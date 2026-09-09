"""
tools/memory_client.py
──────────────────────
Shared memory interface — aligned to team ClickHouse schema.

Schema owner: Member 2 (data/schema.sql)
TypeScript reference: server/clickhouse/queries.ts

Tables used:
  entities       — characters AND locations (entity_type = 'character'|'location')
  shots          — one row per generated shot
  shot_entities  — links shots to entities (many-to-many)
  state_history  — audit trail of every state change
  drift_history  — continuity drift scores per shot per entity

Week 1  → LOCAL mode   (Python dict, same interface as ClickHouse)
Week 2+ → CLICKHOUSE mode (set CH_HOST in .env — switch is automatic)
"""
from __future__ import annotations
import json
import uuid
from dataclasses import dataclass
from typing import Optional, Dict, List, Any

from rich.console import Console
from tools.config import Config

console = Console()


# ── State models ──────────────────────────────────────────────────────────────

@dataclass
class CharacterState:
    name:           str
    description:    str     # permanent physical traits
    outfit:         str     # current outfit — may change shot to shot
    last_seen_shot: int
    notes:          str = ""
    entity_id:      str = ""    # ClickHouse entities.id — filled after upsert


@dataclass
class LocationState:
    name:           str
    description:    str
    time_of_day:    str
    last_seen_shot: int
    entity_id:      str = ""    # ClickHouse entities.id — filled after upsert


# ── Client ────────────────────────────────────────────────────────────────────

class MemoryClient:
    """
    Shared memory for all agents.
    Aligned to team schema in data/schema.sql and server/clickhouse/queries.ts.

    Usage:
        mem = MemoryClient(config)
        state = mem.get_character("Elena")      # read before acting
        mem.upsert_character(updated_state)     # write after acting
    """

    def __init__(self, config: Config):
        self._config = config
        self._mode   = "local"
        self._ch     = None

        if config.clickhouse_ready:
            self._connect_clickhouse()
        else:
            console.print(
                "[bold yellow]MemoryClient[/] → LOCAL mode "
                "(dict store). Set CH_HOST in .env to switch to ClickHouse."
            )
            self._store: Dict[str, Any] = {
                "entities":      {},    # keyed by "character:name" or "location:name"
                "shots":         {},    # keyed by shot_number
                "shot_entities": [],    # list of {shot_id, entity_id, role}
                "state_history": [],    # list of state change records
                "drift_history": [],    # list of drift records
            }

    # ── Connection ────────────────────────────────────────────────────────────

    def _connect_clickhouse(self) -> None:
        try:
            import clickhouse_connect
            self._ch = clickhouse_connect.get_client(
                host     = self._config.ch_host,
                port     = self._config.ch_port,
                username = self._config.ch_user,
                password = self._config.ch_password,
                database = self._config.ch_database,
                secure   = True,
            )
            self._mode = "clickhouse"
            console.print(
                f"[bold green]MemoryClient[/] → CLICKHOUSE mode "
                f"({self._config.ch_host})"
            )
        except Exception as e:
            console.print(
                f"[yellow]ClickHouse connection failed, falling back to local:[/] {e}"
            )
            self._mode = "local"
            self._store = {
                "entities": {}, "shots": {},
                "shot_entities": [], "state_history": [], "drift_history": [],
            }

    # ── Characters ────────────────────────────────────────────────────────────

    def get_character(self, name: str) -> Optional[CharacterState]:
        """
        Read current character state before building an image prompt.
        Maps to: SELECT * FROM entities WHERE entity_type='character' AND name=?
        """
        if self._mode == "local":
            key  = f"character:{name.lower()}"
            data = self._store["entities"].get(key)
            if not data:
                return None
            state = json.loads(data["current_state"])
            return CharacterState(
                name           = data["name"],
                description    = state.get("description", ""),
                outfit         = state.get("outfit", ""),
                last_seen_shot = state.get("last_seen_shot", 0),
                notes          = state.get("notes", ""),
                entity_id      = data["id"],
            )

        # ClickHouse path — mirrors queries.ts getEntity
        result = self._ch.query(
            "SELECT id, name, current_state FROM entities "
            "WHERE entity_type = 'character' AND name = {name:String} "
            "ORDER BY updated_at DESC LIMIT 1",
            parameters={"name": name},
        )
        if not result.result_rows:
            return None
        r     = result.result_rows[0]
        state = json.loads(r[2])
        return CharacterState(
            name           = r[1],
            description    = state.get("description", ""),
            outfit         = state.get("outfit", ""),
            last_seen_shot = state.get("last_seen_shot", 0),
            notes          = state.get("notes", ""),
            entity_id      = r[0],
        )

    def upsert_character(self, new_state: CharacterState) -> None:
        """
        Write character state after processing a shot.
        Also writes a state_history entry so the frontend shows what changed.
        Maps to: INSERT/UPDATE entities + INSERT state_history
        """
        current_state_json = json.dumps({
            "description":    new_state.description,
            "outfit":         new_state.outfit,
            "last_seen_shot": new_state.last_seen_shot,
            "notes":          new_state.notes,
        })

        if self._mode == "local":
            key      = f"character:{new_state.name.lower()}"
            existing = self._store["entities"].get(key)
            prev_state = existing["current_state"] if existing else "{}"
            entity_id  = existing["id"] if existing else str(uuid.uuid4())

            self._store["entities"][key] = {
                "id":                    entity_id,
                "entity_type":           "character",
                "name":                  new_state.name,
                "canonical_description": new_state.description,
                "reference_image_url":   "",
                "current_state":         current_state_json,
            }
            # record state change only when something actually changed
            if existing and prev_state != current_state_json:
                self._store["state_history"].append({
                    "entity_id":      entity_id,
                    "shot_id":        str(new_state.last_seen_shot),
                    "previous_state": prev_state,
                    "new_state":      current_state_json,
                    "reason":         "cinematographer update",
                })
            new_state.entity_id = entity_id
            return

        # ClickHouse — check if entity exists first
        existing = self._ch.query(
            "SELECT id, current_state FROM entities "
            "WHERE entity_type = 'character' AND name = {name:String} LIMIT 1",
            parameters={"name": new_state.name},
        )
        if existing.result_rows:
            entity_id  = existing.result_rows[0][0]
            prev_state = existing.result_rows[0][1]
            # UPDATE — mirrors queries.ts updateEntityState
            self._ch.command(
                "ALTER TABLE entities UPDATE "
                "current_state = {cs:String}, updated_at = now() "
                "WHERE id = {id:String}",
                parameters={"cs": current_state_json, "id": entity_id},
            )
        else:
            entity_id  = str(uuid.uuid4())
            prev_state = "{}"
            self._ch.insert("entities", [[
                entity_id, "character", new_state.name,
                new_state.description, "", current_state_json,
            ]], column_names=[
                "id", "entity_type", "name",
                "canonical_description", "reference_image_url", "current_state",
            ])

        # record state change — mirrors queries.ts saveStateChange
        if prev_state != current_state_json:
            self._ch.insert("state_history", [[
                entity_id,
                str(new_state.last_seen_shot),
                prev_state,
                current_state_json,
                "cinematographer update",
            ]], column_names=[
                "entity_id", "shot_id",
                "previous_state", "new_state", "reason",
            ])
        new_state.entity_id = entity_id

    # ── Locations ─────────────────────────────────────────────────────────────

    def get_location(self, name: str) -> Optional[LocationState]:
        """
        Read location state before building an image prompt.
        Maps to: SELECT * FROM entities WHERE entity_type='location' AND name=?
        """
        if self._mode == "local":
            key  = f"location:{name.lower()}"
            data = self._store["entities"].get(key)
            if not data:
                return None
            state = json.loads(data["current_state"])
            return LocationState(
                name           = data["name"],
                description    = state.get("description", ""),
                time_of_day    = state.get("time_of_day", "day"),
                last_seen_shot = state.get("last_seen_shot", 0),
                entity_id      = data["id"],
            )

        result = self._ch.query(
            "SELECT id, name, current_state FROM entities "
            "WHERE entity_type = 'location' AND name = {name:String} "
            "ORDER BY updated_at DESC LIMIT 1",
            parameters={"name": name},
        )
        if not result.result_rows:
            return None
        r     = result.result_rows[0]
        state = json.loads(r[2])
        return LocationState(
            name           = r[1],
            description    = state.get("description", ""),
            time_of_day    = state.get("time_of_day", "day"),
            last_seen_shot = state.get("last_seen_shot", 0),
            entity_id      = r[0],
        )

    def upsert_location(self, new_state: LocationState) -> None:
        """
        Write location state after processing a shot.
        Maps to: INSERT/UPDATE entities WHERE entity_type='location'
        """
        current_state_json = json.dumps({
            "description":    new_state.description,
            "time_of_day":    new_state.time_of_day,
            "last_seen_shot": new_state.last_seen_shot,
        })

        if self._mode == "local":
            key       = f"location:{new_state.name.lower()}"
            existing  = self._store["entities"].get(key)
            entity_id = existing["id"] if existing else str(uuid.uuid4())
            self._store["entities"][key] = {
                "id":                    entity_id,
                "entity_type":           "location",
                "name":                  new_state.name,
                "canonical_description": new_state.description,
                "reference_image_url":   "",
                "current_state":         current_state_json,
            }
            new_state.entity_id = entity_id
            return

        existing = self._ch.query(
            "SELECT id FROM entities "
            "WHERE entity_type = 'location' AND name = {name:String} LIMIT 1",
            parameters={"name": new_state.name},
        )
        if existing.result_rows:
            entity_id = existing.result_rows[0][0]
            self._ch.command(
                "ALTER TABLE entities UPDATE "
                "current_state = {cs:String}, updated_at = now() "
                "WHERE id = {id:String}",
                parameters={"cs": current_state_json, "id": entity_id},
            )
        else:
            entity_id = str(uuid.uuid4())
            self._ch.insert("entities", [[
                entity_id, "location", new_state.name,
                new_state.description, "", current_state_json,
            ]], column_names=[
                "id", "entity_type", "name",
                "canonical_description", "reference_image_url", "current_state",
            ])
        new_state.entity_id = entity_id

    # ── Shots ─────────────────────────────────────────────────────────────────

    def record_shot(
        self,
        shot_number: int,
        prompt:      str,
        image_url:   Optional[str] = None,
        scene_id:    str = "scene_01",
    ) -> str:
        """
        Log a completed shot. Returns shot_id for linking entities.
        Maps to: INSERT INTO shots (mirrors queries.ts saveShot)
        """
        shot_id = str(uuid.uuid4())

        if self._mode == "local":
            self._store["shots"][shot_number] = {
                "id":                  shot_id,
                "scene_id":            scene_id,
                "shot_number":         shot_number,
                "description":         prompt,
                "generated_image_url": image_url or "",
                "status":              "generated" if image_url else "planned",
            }
            return shot_id

        self._ch.insert("shots", [[
            shot_id, scene_id, shot_number,
            prompt, image_url or "",
            "generated" if image_url else "planned",
        ]], column_names=[
            "id", "scene_id", "shot_number",
            "description", "generated_image_url", "status",
        ])
        return shot_id

    def link_entity_to_shot(
        self,
        shot_id:   str,
        entity_id: str,
        role:      str,
    ) -> None:
        """
        Link a character or location entity to a shot.
        Maps to: INSERT INTO shot_entities (mirrors queries.ts linkEntityToShot)
        Frontend uses this to show which characters appear in each shot.
        """
        if self._mode == "local":
            self._store["shot_entities"].append({
                "shot_id":   shot_id,
                "entity_id": entity_id,
                "role":      role,
            })
            return

        self._ch.insert(
            "shot_entities",
            [[shot_id, entity_id, role]],
            column_names=["shot_id", "entity_id", "role"],
        )

    def get_all_shots(self) -> List[Dict[str, Any]]:
        """Member 3 frontend and Grafana read this."""
        if self._mode == "local":
            return sorted(
                self._store["shots"].values(),
                key=lambda x: x["shot_number"],
            )

        result = self._ch.query(
            "SELECT id, scene_id, shot_number, description, "
            "generated_image_url, status "
            "FROM shots ORDER BY shot_number"
        )
        return [
            {
                "id": r[0], "scene_id": r[1], "shot_number": r[2],
                "description": r[3], "generated_image_url": r[4], "status": r[5],
            }
            for r in result.result_rows
        ]

    # ── Drift ─────────────────────────────────────────────────────────────────

    def record_drift(
        self,
        shot_id:        str,
        entity_id:      str,
        expected_state: str,
        detected_state: str,
        drift_score:    float,
        reason:         str = "",
    ) -> None:
        """
        Week 3: Continuity Checker writes here after comparing each shot.
        Maps to: INSERT INTO drift_history (mirrors queries.ts saveDrift)
        """
        if self._mode == "local":
            self._store["drift_history"].append({
                "shot_id":        shot_id,
                "entity_id":      entity_id,
                "expected_state": expected_state,
                "detected_state": detected_state,
                "drift_score":    drift_score,
                "reason":         reason,
            })
            return

        self._ch.insert("drift_history", [[
            shot_id, entity_id, expected_state,
            detected_state, drift_score, reason,
        ]], column_names=[
            "shot_id", "entity_id", "expected_state",
            "detected_state", "drift_score", "reason",
        ])

    # ── Utils ─────────────────────────────────────────────────────────────────

    @property
    def mode(self) -> str:
        return self._mode

    def status(self) -> str:
        return f"MemoryClient [{self._mode.upper()}]"

    def dump_local(self) -> Dict:
        """Debug helper — full local store. Local mode only."""
        if self._mode != "local":
            return {"error": "Only available in local mode"}
        return self._store