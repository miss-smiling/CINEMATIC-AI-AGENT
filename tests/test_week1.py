"""
tests/test_week1.py
────────────────────
Week 1 acceptance tests.
ALL must pass before you call Week 1 done.
Run: pytest tests/test_week1.py -v

These tests do NOT need a real API key or ClickHouse connection.
They verify your schemas, memory client, and agent parsing logic.
"""
from __future__ import annotations
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from unittest.mock import patch, MagicMock

from schemas.shot import (
    ShotList, Shot, Character, Location, ShotType, TimeOfDay,
    PromptResult, DriftResult,
)
from tools.memory_client import MemoryClient, CharacterState, LocationState


# ── Fixtures ──────────────────────────────────────────────────────────────────

def make_config(ch_host=""):
    """Make a minimal config object for testing."""
    from tools.config import Config
    return Config(
        gemini_api_key="test-key",
        google_cloud_project="test-proj",
        google_cloud_location="us-central1",
        image_model="imagen-4.0-fast-generate-001",
        ch_host=ch_host,
        ch_port=8443,
        ch_user="default",
        ch_password="",
        ch_database="agentic_cinema",
        use_secret_manager=False,
    )


def make_shot(
    num=1,
    char_name="Elena",
    loc_name="forest",
    outfit="grey jacket",
) -> Shot:
    return Shot(
        shot_number  = num,
        scene_number = 1,
        shot_type    = ShotType.WIDE,
        location     = Location(
            name="forest",
            description="dense pine forest at dusk, orange light, ground mist",
            time_of_day=TimeOfDay.DUSK,
        ),
        characters=[Character(
            name=char_name,
            description="tall woman, dark curly hair, pale skin",
            outfit=outfit,
            expression="fearful",
        )],
        action_beat="Elena walks through fog toward the treeline",
        mood="eerie",
        props=["lantern"],
    )


# ── Schema tests ──────────────────────────────────────────────────────────────

class TestShotSchema:

    def test_shotlist_parses_valid_json(self):
        data = {
            "title": "Test Film", "total_shots": 2,
            "shots": [
                {
                    "shot_number": 1, "scene_number": 1,
                    "shot_type": "wide",
                    "location": {"name": "forest", "description": "dark", "time_of_day": "night"},
                    "characters": [{"name": "A", "description": "tall", "outfit": "coat"}],
                    "action_beat": "A walks", "mood": "tense", "props": [], "notes": None,
                },
                {
                    "shot_number": 2, "scene_number": 1,
                    "shot_type": "close",
                    "location": {"name": "forest", "description": "dark", "time_of_day": "night"},
                    "characters": [{"name": "A", "description": "tall", "outfit": "coat"}],
                    "action_beat": "A stops", "mood": "tense", "props": [], "notes": None,
                },
            ],
        }
        sl = ShotList(**data)
        assert sl.total_shots == 2
        assert sl.shots[0].location.name == "forest"

    def test_validate_continuity_catches_gap(self):
        """Shot list with gap (1, 3) instead of (1, 2) should flag it."""
        data = {
            "title": "Bad", "total_shots": 2,
            "shots": [
                {"shot_number": 1, "scene_number": 1, "shot_type": "wide",
                 "location": {"name": "a", "description": "b", "time_of_day": "day"},
                 "characters": [], "action_beat": "x", "mood": "y", "props": []},
                {"shot_number": 3, "scene_number": 1, "shot_type": "wide",
                 "location": {"name": "a", "description": "b", "time_of_day": "day"},
                 "characters": [], "action_beat": "x", "mood": "y", "props": []},
            ],
        }
        sl     = ShotList(**data)
        issues = sl.validate_continuity()
        assert len(issues) > 0

    def test_validate_continuity_passes_clean(self):
        shot1 = make_shot(1)
        shot2 = make_shot(2)
        sl    = ShotList(title="Clean", total_shots=2, shots=[shot1, shot2])
        assert sl.validate_continuity() == []

    def test_invalid_shot_type_raises(self):
        with pytest.raises(Exception):
            Shot(
                shot_number=1, scene_number=1,
                shot_type="EXTREME_WIDE",           # not in enum
                location=Location(name="x", description="y", time_of_day=TimeOfDay.DAY),
                characters=[], action_beat="z", mood="calm",
            )

    def test_prompt_result_model(self):
        pr = PromptResult(
            shot_number=1,
            image_prompt="wide shot of Elena in forest",
            used_memory=True,
            image_url=None,
            model_used="imagen-4.0-fast-generate-001",
        )
        assert pr.shot_number == 1
        assert pr.used_memory is True

    def test_drift_result_model(self):
        dr = DriftResult(shot_number=2, drift_score=0.12, flags=["jacket color changed"])
        assert dr.drift_score == 0.12
        assert len(dr.flags) == 1


# ── MemoryClient tests ────────────────────────────────────────────────────────

class TestMemoryClient:

    def setup_method(self):
        os.environ.pop("CH_HOST", None)
        self.mem = MemoryClient(make_config(ch_host=""))

    def test_starts_in_local_mode(self):
        assert self.mem.mode == "local"

    def test_character_roundtrip(self):
        state = CharacterState(
            name="Elena",
            description="tall, dark curly hair, pale skin",
            outfit="grey jacket",
            last_seen_shot=1,
        )
        self.mem.upsert_character(state)
        got = self.mem.get_character("Elena")
        assert got is not None
        assert got.outfit == "grey jacket"
        assert got.last_seen_shot == 1

    def test_character_lookup_case_insensitive(self):
        self.mem.upsert_character(
            CharacterState("Elena", "d", "coat", 1)
        )
        assert self.mem.get_character("elena") is not None
        assert self.mem.get_character("ELENA") is not None

    def test_character_upsert_keeps_latest(self):
        self.mem.upsert_character(CharacterState("Elena", "d", "grey jacket", 1))
        self.mem.upsert_character(CharacterState("Elena", "d", "torn jacket", 4))
        got = self.mem.get_character("Elena")
        assert got.outfit == "torn jacket"
        assert got.last_seen_shot == 4

    def test_unknown_character_returns_none(self):
        assert self.mem.get_character("Nobody") is None

    def test_location_roundtrip(self):
        loc = LocationState(
            name="forest",
            description="dense pine, dusk light, mist",
            time_of_day="dusk",
            last_seen_shot=1,
        )
        self.mem.upsert_location(loc)
        got = self.mem.get_location("forest")
        assert got is not None
        assert got.time_of_day == "dusk"

    def test_unknown_location_returns_none(self):
        assert self.mem.get_location("nowhere") is None

    def test_shot_record_and_retrieve(self):
        self.mem.record_shot(1, "wide shot of forest", image_url=None)
        self.mem.record_shot(2, "close up of Elena",   image_url="http://img/2.png")
        shots = self.mem.get_all_shots()
        assert len(shots) == 2
        assert shots[1]["generated_image_url"] == "http://img/2.png"

    def test_shots_ordered_by_number(self):
        self.mem.record_shot(3, "p3", None, None)
        self.mem.record_shot(1, "p1", None, None)
        self.mem.record_shot(2, "p2", None, None)
        nums = [s["shot_number"] for s in self.mem.get_all_shots()]
        assert nums == [1, 2, 3]

    def test_drift_record(self):
        self.mem.record_shot(1, "wide shot of forest")
        self.mem.record_drift(
            shot_id        = "shot-001",
            entity_id      = "entity-001",
            expected_state = '{"outfit": "grey jacket"}',
            detected_state = '{"outfit": "blue jacket"}',
            drift_score    = 0.91,
            reason         = "jacket color changed",
        )
        drifts = self.mem.dump_local()["drift_history"]
        assert drifts[0]["drift_score"] == 0.91

    def test_status_string(self):
        assert "LOCAL" in self.mem.status()


# ── Director Agent parsing tests (no API key) ─────────────────────────────────

class TestDirectorAgentParsing:

    def _make_agent(self):
        """Instantiate DirectorAgent without hitting Gemini API."""
        from agents.director_agent import DirectorAgent
        agent = object.__new__(DirectorAgent)
        agent.model = None
        return agent

    def test_parse_valid_json(self):
        agent = self._make_agent()
        raw   = json.dumps({
            "title": "Test", "total_shots": 1,
            "shots": [{
                "shot_number": 1, "scene_number": 1, "shot_type": "wide",
                "location": {"name": "room", "description": "dark", "time_of_day": "night"},
                "characters": [{"name": "A", "description": "tall", "outfit": "coat"}],
                "action_beat": "A walks", "mood": "tense", "props": [], "notes": None,
            }],
        })
        result = agent._parse(raw)
        assert result.title == "Test"
        assert result.total_shots == 1

    def test_parse_strips_markdown_fences(self):
        agent = self._make_agent()
        raw   = '```json\n{"title":"T","total_shots":0,"shots":[]}\n```'
        result = agent._parse(raw)
        assert result.title == "T"

    def test_parse_invalid_json_raises(self):
        agent = self._make_agent()
        with pytest.raises(ValueError, match="invalid JSON"):
            agent._parse("not json at all")

    def test_parse_schema_mismatch_raises(self):
        agent  = self._make_agent()
        broken = json.dumps({"title": "X", "shots": "not-a-list"})
        with pytest.raises(ValueError):
            agent._parse(broken)


# ── Cinematographer memory hydration tests (no API key) ───────────────────────

class TestCinematographerHydration:

    def setup_method(self):
        from agents.cinematographer_agent import CinematographerAgent
        cfg  = make_config()
        mem  = MemoryClient(cfg)

        agent       = object.__new__(CinematographerAgent)
        agent._config = cfg
        agent._memory = mem
        agent.model   = None

        self.agent = agent
        self.mem   = mem

    def test_first_appearance_uses_director_description(self):
        shot              = make_shot(1, outfit="grey jacket")
        block, used_memory = self.agent._hydrate_characters(shot)
        assert used_memory is False
        assert "grey jacket" in block

    def test_second_appearance_uses_memory_description(self):
        # Pre-load memory as if shot 1 already ran
        self.mem.upsert_character(CharacterState(
            name="Elena",
            description="tall, dark curly hair, pale skin",
            outfit="torn jacket — fight scene",
            last_seen_shot=3,
        ))
        shot              = make_shot(4, outfit="some other outfit")
        block, used_memory = self.agent._hydrate_characters(shot)

        # Must use memory outfit, not Director's outfit
        assert used_memory is True
        assert "torn jacket" in block
        assert "some other outfit" not in block

    def test_location_first_appearance(self):
        shot = make_shot(1, loc_name="forest")
        desc = self.agent._hydrate_location(shot)
        assert "pine" in desc   # from Director's description

    def test_location_memory_hit(self):
        self.mem.upsert_location(LocationState(
            name="forest",
            description="MEMORY: scorched forest after fire, ash on ground",
            time_of_day="dusk",
            last_seen_shot=2,
        ))
        shot = make_shot(3, loc_name="forest")
        desc = self.agent._hydrate_location(shot)
        assert "MEMORY: scorched" in desc
