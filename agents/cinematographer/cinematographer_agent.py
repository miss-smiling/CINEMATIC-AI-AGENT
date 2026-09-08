"""
agents/cinematographer_agent.py
────────────────────────────────
Cinematographer Agent — ONE JOB:
  Shot + ClickHouse state → grounded image prompt → (image in Week 2)

Built following:
  Phase 1 → Gemini Enterprise Agent Platform SDK
  Phase 4 → ADK function calling pattern
  Phase 2 → Imagen 3 Image Generation Guide (image call stubbed Week 1)

Read flow:  Shot arrives → check ClickHouse for each character/location
Write flow: Generate prompt → call image model → write result back to ClickHouse
"""
from __future__ import annotations
from typing import Optional, Tuple, List
import os

from google import genai
from google.genai import types
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from schemas.shot import Shot, ShotList, PromptResult
from tools.memory_client import MemoryClient, CharacterState, LocationState
from tools.config import Config

console = Console()


# ── Prompts ───────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are the Cinematographer Agent in an AI cinematic pipeline.

Your job: given a shot description and character/location states from shared
memory, produce ONE image generation prompt that will create a visually
consistent frame.

Rules you must never break:
1. Always use the shared memory description for characters — NEVER invent
   new looks. If memory says "red jacket", the prompt says "red jacket".
2. Prompt structure (always follow this order):
   [shot type] of [characters with MEMORY-GROUNDED descriptions doing action]
   in [location with MEMORY-GROUNDED details], [lighting], [camera details],
   [mood/atmosphere], [colour palette], cinematic photography, 8K
3. Max 120 words. Dense, specific. Zero filler.
4. Return ONLY the prompt string. Nothing else.
"""

USER_TEMPLATE = """
Shot {shot_number} of {total_shots}:
  Type:    {shot_type}
  Action:  {action_beat}
  Mood:    {mood}
  Props:   {props}

Characters (use these descriptions EXACTLY — from shared memory):
{character_block}

Location (use this description EXACTLY — from shared memory):
  Name:        {location_name}
  Description: {location_desc}
  Time of day: {time_of_day}

Generate the image prompt now.
"""


# ── Agent ─────────────────────────────────────────────────────────────────────

class CinematographerAgent:

    def __init__(self, config: Config, memory: MemoryClient):
        self._config = config
        self._memory = memory

        self.client = genai.Client(api_key=config.gemini_api_key)
        self.model  = "gemini-3.6-flash"
        console.print("[bold green]CinematographerAgent[/] ready (gemini-3.6-flash · google-genai)")

    # ── Public API ────────────────────────────────────────────────────────────

    def process_shot(self, shot: Shot, total_shots: int) -> PromptResult:
        """
        ADK tool: Process one shot through the full read → generate → write cycle.

        Returns PromptResult with the image prompt (and image_url in Week 2).
        """
        console.print(Panel(
            f"[magenta]Shot {shot.shot_number}/{total_shots}[/]  "
            f"{shot.action_beat[:70]}…",
            title="[bold]Cinematographer Agent[/]",
            border_style="magenta",
        ))

        # ── Step 1: READ from ClickHouse (or local dict in Week 1) ───────────
        char_block, used_memory = self._hydrate_characters(shot)
        loc_desc               = self._hydrate_location(shot)

        # ── Step 2: Build grounded prompt via Gemini ──────────────────────────
        user_msg = USER_TEMPLATE.format(
            shot_number   = shot.shot_number,
            total_shots   = total_shots,
            shot_type     = shot.shot_type.value,
            action_beat   = shot.action_beat,
            mood          = shot.mood,
            props         = ", ".join(shot.props) if shot.props else "none",
            character_block = char_block,
            location_name  = shot.location.name,
            location_desc  = loc_desc,
            time_of_day    = shot.location.time_of_day.value,
        )

        import time
        last_error = None
        for attempt in range(3):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=user_msg,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=0.4,
                    ),
                )
                prompt = response.text.strip()
                break
            except Exception as e:
                last_error = e
                wait = 10 * (attempt + 1)
                console.print(f"  [yellow]Shot {shot.shot_number} attempt {attempt+1}/3 failed — retrying in {wait}s[/]")
                time.sleep(wait)
        else:
            raise RuntimeError(
                f"Cinematographer failed on shot {shot.shot_number} after 3 attempts: {last_error}"
            )

        # ── Step 3: Call image model (STUBBED in Week 1) ──────────────────────
        image_url = self._generate_image(prompt, shot.shot_number)

        # ── Step 4: WRITE back to ClickHouse ─────────────────────────────────
        # ── Step 4: WRITE back to ClickHouse ─────────────────────────────────
        self._persist_state(shot)
        shot_id = self._memory.record_shot(
            shot_number = shot.shot_number,
            prompt      = prompt,
            image_url   = image_url,
        )
        # link each character and location to this shot
        # populates shot_entities table — frontend queries this
        for char in shot.characters:
            if char_state := self._memory.get_character(char.name):
                self._memory.link_entity_to_shot(
                    shot_id   = shot_id,
                    entity_id = char_state.entity_id,
                    role      = "character",
                )
        if loc_state := self._memory.get_location(shot.location.name):
            self._memory.link_entity_to_shot(
                shot_id   = shot_id,
                entity_id = loc_state.entity_id,
                role      = "location",
            )

        self._print_result(shot.shot_number, prompt, used_memory)

        return PromptResult(
            shot_number  = shot.shot_number,
            image_prompt = prompt,
            used_memory  = used_memory,
            image_url    = image_url,
            model_used   = self._config.image_model,
        )

    def process_shot_list(self, shot_list: ShotList) -> List[PromptResult]:
        """
        Run all shots sequentially.
        Week 1: sync chain.
        Week 2: replace with BullMQ job queue between shots.
        """
        console.print(
            f"\n[bold cyan]Processing '{shot_list.title}' "
            f"— {shot_list.total_shots} shots[/]\n"
        )
        results = []
        for shot in shot_list.shots:
            result = self.process_shot(shot, shot_list.total_shots)
            results.append(result)
        return results

    # ── Private: READ ─────────────────────────────────────────────────────────

    def _hydrate_characters(self, shot: Shot) -> Tuple[str, bool]:
        """
        For each character, check ClickHouse memory first.
        Memory hit  → use stored description (consistency preserved).
        Memory miss → use Director's description (first appearance).
        """
        lines       = []
        used_memory = False

        for char in shot.characters:
            mem = self._memory.get_character(char.name)
            if mem:
                used_memory = True
                console.print(
                    f"  [green]Memory hit[/] · {char.name} "
                    f"(last shot {mem.last_seen_shot})"
                )
                lines.append(
                    f"  {char.name}: {mem.description} | "
                    f"outfit: {mem.outfit} | "
                    f"expression: {char.expression or 'neutral'}"
                )
            else:
                console.print(
                    f"  [yellow]First appearance[/] · {char.name}"
                )
                lines.append(
                    f"  {char.name}: {char.description} | "
                    f"outfit: {char.outfit} | "
                    f"expression: {char.expression or 'neutral'}"
                )

        return "\n".join(lines), used_memory

    def _hydrate_location(self, shot: Shot) -> str:
        mem = self._memory.get_location(shot.location.name)
        if mem:
            console.print(
                f"  [green]Memory hit[/] · location '{shot.location.name}'"
            )
            return mem.description
        console.print(
            f"  [yellow]First appearance[/] · location '{shot.location.name}'"
        )
        return shot.location.description

    # ── Private: WRITE ────────────────────────────────────────────────────────

    def _persist_state(self, shot: Shot) -> None:
        """Write current shot's character and location state back to ClickHouse."""
        for char in shot.characters:
            self._memory.upsert_character(CharacterState(
                name           = char.name,
                description    = char.description,
                outfit         = char.outfit,
                last_seen_shot = shot.shot_number,
                notes          = shot.notes or "",
            ))
        self._memory.upsert_location(LocationState(
            name           = shot.location.name,
            description    = shot.location.description,
            time_of_day    = shot.location.time_of_day.value,
            last_seen_shot = shot.shot_number,
        ))

    # ── Private: Image model (stubbed Week 1) ─────────────────────────────────

    def _generate_image(self, prompt: str, shot_number: int) -> Optional[str]:
        """
        Week 1: STUBBED — returns None.
        Week 2: Replace with Imagen 4 Fast API call.

        Hackathon resource:
          Phase 2 → Imagen 3 Image Generation Guide
          https://github.com/GoogleCloudPlatform/generative-ai/.../intro_gemini_3_image_gen.ipynb

        Week 2 implementation:
            import vertexai
            from vertexai.preview.vision_models import ImageGenerationModel
            vertexai.init(project=self._config.google_cloud_project,
                          location=self._config.google_cloud_location)
            model    = ImageGenerationModel.from_pretrained(self._config.image_model)
            response = model.generate_images(prompt=prompt, number_of_images=1)
            return response.images[0]._gcs_uri
        """
        if not self._config.google_cloud_project:
            console.print("  [dim]Image model: STUBBED (GOOGLE_CLOUD_PROJECT not set)[/]")
            return None

        from tools.image_generator import generate_shot_image
        try:
            return generate_shot_image(
                prompt=prompt,
                shot_number=shot_number,
                project_id=self._config.google_cloud_project,
                location=self._config.google_cloud_location,
            )
        except Exception as e:
            console.print(f"  [yellow]Image generation failed: {e}[/]")
            return None

    # ── Display ───────────────────────────────────────────────────────────────

    def _print_result(self, shot_num: int, prompt: str, used_memory: bool) -> None:
        t = Table(show_header=False, box=None, padding=(0, 1))
        t.add_column(style="dim", width=18)
        t.add_column()
        t.add_row("Shot:", str(shot_num))
        t.add_row("Memory used:", "[green]Yes[/]" if used_memory else "[yellow]First appearance[/]")
        t.add_row("Prompt:", prompt[:140] + ("…" if len(prompt) > 140 else ""))
        console.print(t)
        console.print()
