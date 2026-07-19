-- ══════════════════════════════════════════════
-- XOChat — Database Schema Migration v2
-- Run this in your Supabase SQL Editor AFTER migrations.sql
-- All changes are purely ADDITIVE — no data loss.
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Add last_active to users
-- ──────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ──────────────────────────────────────────────
-- Add recovery_key_hash to users
-- Stores only the Argon2id hash — never the plaintext key.
-- ──────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS recovery_key_hash TEXT;

-- ──────────────────────────────────────────────
-- Add per-user conversation states
-- archived_by  — UUIDs of users who archived this conversation
-- hidden_by    — UUIDs of users who "closed" (hid) this conversation
-- muted_by     — UUIDs of users who muted this conversation
-- ──────────────────────────────────────────────
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS archived_by UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hidden_by   UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS muted_by    UUID[] DEFAULT '{}';

-- ──────────────────────────────────────────────
-- New indexes for performance
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_last_active
  ON users (last_active);

CREATE INDEX IF NOT EXISTS idx_users_recovery
  ON users (recovery_key_hash)
  WHERE recovery_key_hash IS NOT NULL;

-- ──────────────────────────────────────────────
-- Backfill: set last_active = created_at for existing users
-- ──────────────────────────────────────────────
UPDATE users
  SET last_active = created_at
  WHERE last_active = NOW()
    AND created_at < NOW() - INTERVAL '5 minutes';
