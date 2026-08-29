-- Draft schema for shared memory (ClickHouse)
-- Owner: Member 2 — refine during Week 1

CREATE TABLE IF NOT EXISTS characters (
    id String,
    name String,
    canonical_description String,
    reference_image_url String,
    current_state String,      -- e.g. "torn jacket after scene 4"
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY id;

CREATE TABLE IF NOT EXISTS locations (
    id String,
    name String,
    canonical_description String,
    current_state String,      -- e.g. lighting/time-of-day changes
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY id;

CREATE TABLE IF NOT EXISTS props (
    id String,
    name String,
    canonical_description String,
    current_state String,
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY id;

CREATE TABLE IF NOT EXISTS shots (
    id String,
    scene_id String,
    shot_number UInt32,
    character_ids Array(String),
    location_id String,
    prop_ids Array(String),
    generated_image_url String,
    drift_score Float32,        -- filled in by Continuity Checker
    flagged Bool DEFAULT false,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (scene_id, shot_number);
