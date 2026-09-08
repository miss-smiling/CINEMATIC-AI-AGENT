-- Shared memory schema for Agentic Cinema
-- Owner: Member 2 - Data Layer / ClickHouse
-- Stores entities, shots, state changes, and continuity drift.

CREATE TABLE IF NOT EXISTS entities (
    id String,
    entity_type LowCardinality(String),
    name String,
    canonical_description String,
    reference_image_url String,
    current_state String,
    updated_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY id;


CREATE TABLE IF NOT EXISTS shots (
    id String,
    scene_id String,
    shot_number UInt32,
    description String,
    generated_image_url String,
    status LowCardinality(String) DEFAULT 'planned',
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (scene_id, shot_number);


CREATE TABLE IF NOT EXISTS shot_entities (
    shot_id String,
    entity_id String,
    role LowCardinality(String),
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (shot_id, entity_id);


CREATE TABLE IF NOT EXISTS state_history (
    entity_id String,
    shot_id String,
    previous_state String,
    new_state String,
    reason String,
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (entity_id, created_at);


CREATE TABLE IF NOT EXISTS drift_history (
    shot_id String,
    entity_id String,
    expected_state String,
    detected_state String,
    drift_score Float32,
    reason String,
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (shot_id, entity_id, created_at);