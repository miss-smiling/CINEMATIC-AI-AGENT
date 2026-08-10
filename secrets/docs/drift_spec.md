# Drift Scoring Spec

Owner: Member 1 — fill this in before Continuity Checker agent is built.

## Method
(e.g. Gemini Vision comparison — describe exact prompt/approach here)

## Input
- New generated shot image
- Canonical reference (character/location/prop description + reference image)

## Output
- Drift score (define scale, e.g. 0–1 or 0–100)
- Flag threshold (at what score does a shot get flagged for regeneration?)

## Edge cases to handle
- Intentional state changes (e.g. torn jacket after a fight) — should NOT be flagged as drift
- Partial visibility (character partially out of frame)
- Lighting/mood changes that are stylistic, not consistency errors
