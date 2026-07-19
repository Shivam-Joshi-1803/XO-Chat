// ──────────────────────────────────────────────
// XOChat — Shared TypeScript interfaces
// ──────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  online: boolean;
  last_seen: string;
  last_active: string;
  session_token: string;
  recovery_key_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  online: boolean;
  last_seen: string;
  last_active: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface ChatRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: RequestStatus;
  created_at: string;
  sender?: PublicUser;
  receiver?: PublicUser;
}

export interface Conversation {
  id: string;
  user_one: string;
  user_two: string;
  pinned_by: string[];
  archived_by: string[];
  hidden_by: string[];
  muted_by: string[];
  created_at: string;
  updated_at: string;
  other_user?: PublicUser;
  last_message?: Message | null;
  unread_count?: number;
}

export type MessageType = 'text' | 'image';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  content: string | null;
  image_url: string | null;
  read: boolean;
  edited: boolean;
  reply_to: string | null;
  created_at: string;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
  blocked_user?: PublicUser;
}

export interface UserSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
  auto_download_images: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
  cursor?: string;
}
