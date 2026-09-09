"""
agents/director_agent.py
────────────────────────
Director Agent — ONE JOB:
  raw script text → structured ShotList (Pydantic)

Built following:
  Phase 1 → Gemini Enterprise Agent Platform SDK for Python
  Phase 4 → ADK Introduction (function as tool pattern)
  https://github.com/GoogleCloudPlatform/generative-ai/.../intro_agent_engine.ipynb

The generate_shot_list function is written as an ADK-compatible tool —
it can be registered with Agent Engine as-is in Week 2.
"""
from __future__ import annotations
import json
from typing import Optional

from google import genai
from google.genai import types
from rich.console import Console
from rich.panel import Panel

from schemas.shot import ShotList
from tools.config import Config

console = Console()


# ── Prompts ───────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are the Director Agent in an AI cinematic pipeline.

Your ONLY job: read a script or story idea and break it into a structured shot list.

Non-negotiable rules:
1. Every shot MUST have: shot_number, scene_number, shot_type, location,
   characters, action_beat, mood.
2. Character descriptions must be SPECIFIC enough for an image model to
   stay consistent across all shots.
   BAD:  "a young woman"
   GOOD: "Elena, 28, sharp cheekbones, dark curly hair to shoulders,
          pale skin, small scar on left chin"
3. Location descriptions must include: lighting, atmosphere, colour palette.
   BAD:  "a forest"
   GOOD: "dense pine forest at dusk, orange light through trees, ground mist,
          deep blue shadows between trunks"
4. action_beat = what physically happens. No emotion. No subtext. Just action.
5. mood = exactly ONE word.
6. props = list of specific physical objects VISIBLE in this shot.
7. Return ONLY valid JSON matching the schema. No markdown. No explanation.

Output schema (strict):
{
  "title": "string",
  "total_shots": int,
  "shots": [
    {
      "shot_number": int,
      "scene_number": int,
      "shot_type": "wide|medium|close|cutaway",
      "location": {
        "name": "string",
        "description": "string",
        "time_of_day": "day|night|dusk|dawn"
      },
      "characters": [
        {
          "name": "string",
          "description": "string",
          "outfit": "string",
          "expression": "string or null"
        }
      ],
      "action_beat": "string",
      "mood": "string",
      "props": ["string"],
      "notes": "string or null"
    }
  ]
}
"""

USER_TEMPLATE = """
Script:
\"\"\"
{script}
\"\"\"

Break this into exactly {num_shots} shots.
Be precise and visual. Every character description must be specific enough
that an image model produces consistent results across all shots.
Return ONLY the JSON.
"""


# ── ADK tool function ─────────────────────────────────────────────────────────

class DirectorAgent:
    """
    Wraps the generate_shot_list tool in an ADK-compatible class.

    In Week 2, register with Agent Engine:
        from google.cloud import aiplatform
        agent = aiplatform.agent_engines.create(
            agent_engine=DirectorAgent,
            requirements=["google-generativeai"],
        )
    """

    def __init__(self, config: Config):
        self.client = genai.Client(api_key=config.gemini_api_key)
        self.model  = "gemini-3.6-flash"
        console.print("[bold green]DirectorAgent[/] ready (gemini-3.6-flash · google-genai)")
        

    # ── ADK tool function (register this with Agent Engine in Week 2) ─────────

    def generate_shot_list(self, script: str, num_shots: int = 5) -> ShotList:
        """
        ADK tool: Break a script into a structured shot list.

        Args:
            script:    Raw screenplay or story text.
            num_shots: Number of shots to generate (default 5 for Week 1 test).

        Returns:
            Validated ShotList (Pydantic model).
        """
        console.print(Panel(
            f"[cyan]Script length:[/] {len(script)} chars  "
            f"[cyan]Target shots:[/] {num_shots}",
            title="[bold]Director Agent[/]",
            border_style="cyan",
        ))

        prompt = USER_TEMPLATE.format(script=script, num_shots=num_shots)

        import time
        last_error = None
        for attempt in range(3):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=0.3,
                        response_mime_type="application/json",
                    ),
                )
                raw = response.text.strip()
                break
            except Exception as e:
                last_error = e
                wait = 10 * (attempt + 1)
                console.print(f"  [yellow]Attempt {attempt+1}/3 failed — retrying in {wait}s[/]")
                time.sleep(wait)
        else:
            raise RuntimeError(f"Gemini API call failed after 3 attempts: {last_error}") from last_error

        shot_list = self._parse(raw)

        issues = shot_list.validate_continuity()
        if issues:
            console.print(f"[yellow]Continuity warnings:[/] {issues}")

        console.print(
            f"[bold green]✓ Shot list ready[/] — "
            f"{shot_list.total_shots} shots · '{shot_list.title}'"
        )
        return shot_list

    # ── Private ───────────────────────────────────────────────────────────────

    def _parse(self, raw: str) -> ShotList:
        """Parse JSON → Pydantic. Fail loudly with useful error."""
        # Strip accidental markdown fences from non-JSON-mode fallback
        if raw.startswith("```"):
            parts = raw.split("```")
            raw   = parts[1].lstrip("json").strip() if len(parts) > 1 else raw

        try:
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            raise ValueError(
                f"Director Agent returned invalid JSON.\n"
                f"Error: {e}\n"
                f"First 500 chars of output:\n{raw[:500]}"
            )

        try:
            return ShotList(**data)
        except Exception as e:
            raise ValueError(f"JSON valid but schema mismatch: {e}") from e
