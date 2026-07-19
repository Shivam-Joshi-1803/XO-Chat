// ──────────────────────────────────────────────
// XOChat — Socket.IO event constants
// ──────────────────────────────────────────────

export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',

  // Typing
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Messages
  MESSAGE_NEW: 'message:new',
  MESSAGE_SEND: 'message:send',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_SEEN: 'message:seen',
  MESSAGE_DELETED: 'message:deleted',

  // Chat Requests
  REQUEST_NEW: 'request:new',
  REQUEST_ACCEPTED: 'request:accepted',
  REQUEST_REJECTED: 'request:rejected',

  // Conversations
  CONVERSATION_DELETED: 'conversation:deleted',

  // Errors
  ERROR: 'error:message',
} as const;
