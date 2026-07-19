// ──────────────────────────────────────────────
// XOChat — Socket.IO typing handler
// Throttled: typing:start emitted max once per 500ms per user
// ──────────────────────────────────────────────
import { Socket, Server } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import { conversationRepository } from '../../repositories/conversationRepository';

// Track last typing event timestamp per user per conversation
const typingThrottle = new Map<string, number>();
const THROTTLE_MS = 500;

export function handleTyping(io: Server, socket: Socket, userId: string): void {
  socket.on(SOCKET_EVENTS.TYPING_START, async (data: { conversationId: string }) => {
    if (!data.conversationId) return;

    // Throttle: max once per 500ms per user+conversation key
    const throttleKey = `${userId}:${data.conversationId}`;
    const now = Date.now();
    const last = typingThrottle.get(throttleKey) ?? 0;
    if (now - last < THROTTLE_MS) return;
    typingThrottle.set(throttleKey, now);

    // Verify user is a participant
    const conv = await conversationRepository.findById(data.conversationId);
    if (!conv) return;
    if (conv.user_one !== userId && conv.user_two !== userId) return;

    const otherUserId = conv.user_one === userId ? conv.user_two : conv.user_one;

    io.to(`user:${otherUserId}`).emit(SOCKET_EVENTS.TYPING_START, {
      conversationId: data.conversationId,
      userId,
    });
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, async (data: { conversationId: string }) => {
    if (!data.conversationId) return;

    // Remove throttle entry on stop
    typingThrottle.delete(`${userId}:${data.conversationId}`);

    const conv = await conversationRepository.findById(data.conversationId);
    if (!conv) return;

    const otherUserId = conv.user_one === userId ? conv.user_two : conv.user_one;

    io.to(`user:${otherUserId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
      conversationId: data.conversationId,
      userId,
    });
  });

  // Clean up throttle entries on disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    for (const key of typingThrottle.keys()) {
      if (key.startsWith(`${userId}:`)) {
        typingThrottle.delete(key);
      }
    }
  });
}
