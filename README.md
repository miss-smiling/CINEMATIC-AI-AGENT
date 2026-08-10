Agentic Cinema Hackathon (ClickHouse Track)

AI-generated storyboards break down over a full story — characters, locations, and props silently drift across shots because each shot is generated in isolation, with no shared memory of what came before. [Product Name] fixes this by giving a multi-agent pipeline a shared, persistent memory of the story, so consistency holds across dozens or hundreds of shots, not just a handful.

The Problem

Most AI filmmaking tools can produce one great shot or a short clip, but fall apart over anything longer. This makes AI unusable for full narrative pre-visualization. We built a system where every agent reads from and writes to a single source of truth, so the story remembers itself.

Who It's For

Indie filmmakers, small production studios, and content creators who want to plan out a full story with AI and need every character, room, and object to stay consistent from the first shot to the last.

How It Works

Three agents, one shared memory, all working off the same facts:

Director Agent — reads a script and breaks it into a structured shot list.
Cinematographer Agent — for each shot, checks the shared memory for the current, correct details of every character/location/prop involved, then generates the image.
Continuity Checker Agent — compares each new image against the established look. Flags real inconsistencies for a redo, and updates shared memory when a change is intentional (e.g. a torn jacket after a fight scene).

Shared Memory (ClickHouse) — holds the current facts about every character, location, and prop, with a history of how they change over time. This is what makes the system different from generating each shot in isolation.

Tech Stack
Gemini — agent reasoning
ClickHouse — shared memory / data layer
Google Cloud — hosting (Cloud Run), Agent Builder for orchestration
Imagen 3 (or locked alternative — see /docs/decisions.md) — shot generation
Grafana — consistency/drift dashboard
React — frontend
Repo Structure
/agents     — Director, Cinematographer, Continuity Checker agent code
/frontend   — shot viewer, story memory viewer, dashboard
/data       — ClickHouse schema and queries
/docs       — decisions log, drift-scoring spec, architecture notes
Setup
bash
# clone
git clone <repo-url>
cd [product-name]

# copy env template and fill in your own keys
cp .env.example .env

See .env.example for required environment variables.

Status

Actively being built for the Agentic Cinema Hackathon (ClickHouse track). See /docs/decisions.md for current open items and locked decisions.

License

MIT — see LICENSE.
