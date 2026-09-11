-- Keep discovery settings separate from request admission. This runs before
-- upstream 235/236 without changing their checksums. A nonempty disabled value
-- prevents 236 from treating the new allowlist as an uninitialized legacy copy.
ALTER TABLE groups
    ADD COLUMN IF NOT EXISTS model_allowlist JSONB NOT NULL DEFAULT '{"enabled":false}'::jsonb;

-- Retained for current-version rollback and existing administrative API clients.
-- When upgrading an already-migrated upstream database, do not copy its explicit
-- request policy into this independent display setting or disable that policy.
ALTER TABLE groups
    ADD COLUMN IF NOT EXISTS models_list_config JSONB NOT NULL DEFAULT '{}'::jsonb;
