-- ══════════════════════════════════════════════
-- XOChat — Database Schema Migration
-- Run this in your Supabase SQL Editor
-- ══════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- Users table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(20) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio VARCHAR(160),
  online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Username uniqueness enforced at database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_session_token ON users (session_token);

-- ──────────────────────────────────────────────
-- Chat Requests table
-- ──────────────────────────────────────────────
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE IF NOT EXISTS chat_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_request CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_requests_receiver ON chat_requests (receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_chat_requests_sender ON chat_requests (sender_id, status);

-- Prevent duplicate pending requests between the same pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_requests_unique_pending
  ON chat_requests (
    LEAST(sender_id, receiver_id),
    GREATEST(sender_id, receiver_id)
  )
  WHERE status = 'pending';

-- ──────────────────────────────────────────────
-- Conversations table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_one UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_two UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pinned_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_conversation CHECK (user_one != user_two)
);

-- Prevent duplicate conversations between the same pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_pair
  ON conversations (
    LEAST(user_one, user_two),
    GREATEST(user_one, user_two)
  );

CREATE INDEX IF NOT EXISTS idx_conversations_user_one ON conversations (user_one);
CREATE INDEX IF NOT EXISTS idx_conversations_user_two ON conversations (user_two);

-- ──────────────────────────────────────────────
-- Messages table
-- ──────────────────────────────────────────────
CREATE TYPE message_type AS ENUM ('text', 'image');

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type message_type NOT NULL DEFAULT 'text',
  content TEXT,
  image_url TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  edited BOOLEAN NOT NULL DEFAULT false,
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (conversation_id, read) WHERE read = false;

-- ──────────────────────────────────────────────
-- Blocked Users table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_unique
  ON blocked_users (blocker_id, blocked_id);

-- ──────────────────────────────────────────────
-- User Settings table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN NOT NULL DEFAULT true,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_download_images BOOLEAN NOT NULL DEFAULT true
);

-- ──────────────────────────────────────────────
-- Updated_at trigger function
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- Create Supabase Storage bucket for chat images
-- Run this separately if needed:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('chat-images', 'chat-images', true);
-- ──────────────────────────────────────────────
