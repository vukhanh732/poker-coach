-- Phase 2: Schema updates
-- Run against the session-mode (unpooled) connection.

-- 1. game_type enum
CREATE TYPE game_type AS ENUM ('cash', 'tournament');

-- 2. hand_log_tag enum (spec-defined values only; backfill drops bad_beat/cooler)
CREATE TYPE hand_log_tag AS ENUM (
  'mistake',
  'tough_spot',
  'bluff_caught',
  'hero_call',
  'value_bet'
);

-- 3. Add game_type to hand_logs
ALTER TABLE hand_logs
  ADD COLUMN game_type game_type NOT NULL DEFAULT 'cash';

-- 4. Add game_type to quiz_attempts
ALTER TABLE quiz_attempts
  ADD COLUMN game_type game_type NOT NULL DEFAULT 'cash';

-- 5. Add lapses to quiz_attempts
ALTER TABLE quiz_attempts
  ADD COLUMN lapses integer NOT NULL DEFAULT 0;

-- 6. Convert hand_logs.tags: text[] → hand_log_tag[]
--    Values not in the enum (bad_beat, cooler) are silently dropped.
ALTER TABLE hand_logs ADD COLUMN tags_new hand_log_tag[] NOT NULL DEFAULT '{}';

UPDATE hand_logs
SET tags_new = COALESCE(
  (SELECT array_agg(t::hand_log_tag)
   FROM unnest(tags) AS t
   WHERE t IN ('mistake', 'tough_spot', 'bluff_caught', 'hero_call', 'value_bet')),
  '{}'
);

ALTER TABLE hand_logs DROP COLUMN tags;
ALTER TABLE hand_logs RENAME COLUMN tags_new TO tags;
