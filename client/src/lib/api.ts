// ──────────────────────────────────────────────
// XOChat — API Client
// ──────────────────────────────────────────────
import { API_URL } from './constants';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  PublicUser,
  ChatRequest,
  Conversation,
  Message,
  CreateUserResponse,
  AllRequests,
} from '@/types';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();
  return data as T;
}

export const api = {
  // ── User ────────────────────────────────────
  checkUsername(username: string) {
    return request<ApiResponse<{ available: boolean; suggestions?: string[] }>>(
      '/username/check',
      { method: 'POST', body: JSON.stringify({ username }) }
    );
  },

  createUser(username: string, display_name?: string) {
    return request<ApiResponse<CreateUserResponse>>(
      '/users/create',
      { method: 'POST', body: JSON.stringify({ username, display_name }) }
    );
  },

  recoverAccount(username: string, recovery_key: string) {
    return request<ApiResponse>(
      '/recover',
      { method: 'POST', body: JSON.stringify({ username, recovery_key }) }
    );
  },

  deleteUser() {
    return request<ApiResponse>('/users/delete', { method: 'DELETE' });
  },

  getMe() {
    return request<ApiResponse<User>>('/users/me');
  },

  updateProfile(data: { display_name?: string; bio?: string | null; avatar_url?: string | null }) {
    return request<ApiResponse<PublicUser>>(
      '/profile',
      { method: 'PATCH', body: JSON.stringify(data) }
    );
  },

  searchUsers(query: string) {
    return request<ApiResponse<PublicUser[]>>(`/users/search?q=${encodeURIComponent(query)}`);
  },

  blockUser(userId: string) {
    return request<ApiResponse>('/users/block', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  unblockUser(userId: string) {
    return request<ApiResponse>('/users/unblock', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  getBlockedUsers() {
    return request<ApiResponse<PublicUser[]>>('/users/blocked');
  },

  // ── Requests ────────────────────────────────
  sendRequest(username: string) {
    return request<ApiResponse<ChatRequest>>('/requests/send', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  },

  acceptRequest(requestId: string) {
    return request<ApiResponse<{ request: ChatRequest; conversationId: string }>>(
      '/requests/accept',
      { method: 'POST', body: JSON.stringify({ request_id: requestId }) }
    );
  },

  rejectRequest(requestId: string) {
    return request<ApiResponse<ChatRequest>>('/requests/reject', {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId }),
    });
  },

  cancelRequest(requestId: string) {
    return request<ApiResponse>('/requests/cancel', {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId }),
    });
  },

  getRequests() {
    return request<ApiResponse<{ received: ChatRequest[]; sent: ChatRequest[] }>>('/requests');
  },

  getAllRequests() {
    return request<ApiResponse<AllRequests>>('/requests/all');
  },

  // ── Conversations ───────────────────────────
  getConversations() {
    return request<ApiResponse<Conversation[]>>('/conversations');
  },

  deleteConversation(id: string) {
    return request<ApiResponse>(`/conversations/${id}`, { method: 'DELETE' });
  },

  pinConversation(id: string, pin: boolean) {
    return request<ApiResponse>(`/conversations/${id}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ pin }),
    });
  },

  archiveConversation(id: string, archive: boolean) {
    return request<ApiResponse>(`/conversations/${id}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ archive }),
    });
  },

  closeConversation(id: string) {
    return request<ApiResponse>(`/conversations/${id}/close`, { method: 'POST' });
  },

  muteConversation(id: string, mute: boolean) {
    return request<ApiResponse>(`/conversations/${id}/mute`, {
      method: 'PATCH',
      body: JSON.stringify({ mute }),
    });
  },

  // ── Messages ────────────────────────────────
  getMessages(conversationId: string, page = 1, limit = 50) {
    return request<PaginatedResponse<Message>>(
      `/messages/${conversationId}?page=${page}&limit=${limit}`
    );
  },

  sendMessage(data: {
    conversation_id: string;
    type: 'text' | 'image';
    content?: string;
    image_url?: string;
    reply_to?: string;
  }) {
    return request<ApiResponse<Message>>('/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteMessage(id: string) {
    return request<ApiResponse>(`/messages/${id}`, { method: 'DELETE' });
  },

  markAsRead(conversationId: string) {
    return request<ApiResponse>(`/messages/${conversationId}/read`, {
      method: 'POST',
    });
  },

  searchMessages(conversationId: string, query: string) {
    return request<ApiResponse<Message[]>>(
      `/messages/${conversationId}/search?q=${encodeURIComponent(query)}`
    );
  },

  // ── Upload ──────────────────────────────────
  async uploadImage(conversationId: string, file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('conversation_id', conversationId);

    const url = `${API_URL}/images/upload`;
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },
};
