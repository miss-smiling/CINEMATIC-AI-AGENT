"""
schemas/shot.py
───────────────
Single source of truth for the data contract every agent speaks.

Director Agent    → produces  ShotList
Cinematographer   → consumes  Shot,     produces  PromptResult
Continuity Checker→ consumes  Shot + PromptResult, produces DriftResult

If you need to change a field, tell the team first.
Member 2's ClickHouse schema is derived from these models.
"""
from __future__ import annotations
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


# ── Enums ────────────────────────────────────────────────────────────────────

class TimeOfDay(str, Enum):
    DAY   = "day"
    NIGHT = "night"
    DUSK  = "dusk"
    DAWN  = "dawn"


class ShotType(str, Enum):
    WIDE    = "wide"
    MEDIUM  = "medium"
    CLOSE   = "close"
    CUTAWAY = "cutaway"


# ── Core models ───────────────────────────────────────────────────────────────

class Character(BaseModel):
    """
    Visual description of one character IN THIS SHOT.
    Must be specific enough for an image model to stay consistent.
    """
    name:        str
    description: str   # physical — face, hair, body type. Permanent traits.
    outfit:      str   # what they are wearing RIGHT NOW in this shot
    expression:  Optional[str] = None


class Location(BaseModel):
    name:        str
    description: str   # visual detail — lighting, atmosphere, colour palette
    time_of_day: TimeOfDay = TimeOfDay.DAY


class Shot(BaseModel):
    shot_number:  int
    scene_number: int
    shot_type:    ShotType
    location:     Location
    characters:   List[Character]
    action_beat:  str              # what physically happens — no subtext
    mood:         str              # ONE word
    props:        List[str] = Field(default_factory=list)
    notes:        Optional[str] = None


class ShotList(BaseModel):
    title:       str
    total_shots: int
    shots:       List[Shot]

    def validate_continuity(self) -> List[str]:
        """Sanity check before handing to Cinematographer."""
        issues = []
        if len(self.shots) != self.total_shots:
            issues.append(
                f"total_shots declared as {self.total_shots} "
                f"but {len(self.shots)} shots found"
            )
        nums = [s.shot_number for s in self.shots]
        if sorted(nums) != list(range(1, len(self.shots) + 1)):
            issues.append("Shot numbers are not sequential — Continuity Checker will break")
        return issues


# ── Output models ─────────────────────────────────────────────────────────────

class PromptResult(BaseModel):
    """What the Cinematographer writes back after processing one shot."""
    shot_number:   int
    image_prompt:  str
    used_memory:   bool            # True = ClickHouse had prior state for characters/location
    image_url:     Optional[str] = None   # None in Week 1 (model call stubbed)
    model_used:    Optional[str] = None


class DriftResult(BaseModel):
    """What the Continuity Checker writes after comparing a shot."""
    shot_number:   int
    drift_score:   float           # 0.0 = perfect match, 1.0 = completely different
    flags:         List[str] = Field(default_factory=list)  # "jacket color changed"
    state_updated: bool = False    # True if shared memory was updated with new state
