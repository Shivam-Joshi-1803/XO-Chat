// ──────────────────────────────────────────────
// XOChat — Frontend Types
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface SocketEvents {
  'user:online': { userId: string };
  'user:offline': { userId: string; lastSeen: string };
  'typing:start': { conversationId: string; userId: string };
  'typing:stop': { conversationId: string; userId: string };
  'message:new': Message;
  'message:send': {
    conversation_id: string;
    type: MessageType;
    content?: string;
    image_url?: string;
    reply_to?: string;
  };
  'message:delivered': { messageId: string; conversationId: string };
  'message:seen': { conversationId: string; seenBy: string };
  'message:deleted': { messageId: string; conversationId: string };
  'request:new': ChatRequest;
  'request:accepted': ChatRequest & { conversationId: string };
  'request:rejected': ChatRequest;
  'conversation:deleted': { conversationId: string };
  'error:message': { error: string };
}

/** Response from POST /users/create — includes one-time recovery_key */
export interface CreateUserResponse extends User {
  recovery_key: string;
}

/** All requests organized by tab */
export interface AllRequests {
  received_pending: ChatRequest[];
  sent_pending: ChatRequest[];
  accepted: ChatRequest[];
  rejected_received: ChatRequest[];
}
