// ──────────────────────────────────────────────
// XOChat — Socket.IO message handler
// ──────────────────────────────────────────────
import { Socket, Server } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import { messageService } from '../../services/messageService';
import { conversationRepository } from '../../repositories/conversationRepository';
import { userRepository } from '../../repositories/userRepository';
import { logger } from '../../utils/logger';

export function handleMessages(io: Server, socket: Socket, userId: string): void {
  // ── Send message via socket ─────────────
  socket.on(
    SOCKET_EVENTS.MESSAGE_SEND,
    async (data: {
      conversation_id: string;
      type: 'text' | 'image';
      content?: string;
      image_url?: string;
      reply_to?: string;
    }) => {
      const result = await messageService.sendMessage(userId, data);

      if (!result.success || !result.data) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: result.error });
        return;
      }

      const message = result.data;

      // Get the conversation to find the other user
      const conv = await conversationRepository.findById(data.conversation_id);
      if (!conv) return;

      const otherUserId = conv.user_one === userId ? conv.user_two : conv.user_one;

      // Send to both users (sender gets it too for multi-tab sync)
      io.to(`user:${userId}`).to(`user:${otherUserId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, message);

      // Confirm delivery to sender's socket
      socket.emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
        messageId: message.id,
        conversationId: message.conversation_id,
      });

      // Update last_active for sender (fire-and-forget)
      userRepository.updateLastActive(userId).catch(() => {});

      logger.debug('messageHandler', `Message sent in conversation ${data.conversation_id}`);
    }
  );

  // ── Mark messages as seen ───────────────
  socket.on(
    SOCKET_EVENTS.MESSAGE_SEEN,
    async (data: { conversationId: string }) => {
      if (!data.conversationId) return;

      await messageService.markAsRead(userId, data.conversationId);

      // Update last_active
      userRepository.updateLastActive(userId).catch(() => {});

      // Notify the other user that their messages were seen
      const conv = await conversationRepository.findById(data.conversationId);
      if (!conv) return;

      const otherUserId = conv.user_one === userId ? conv.user_two : conv.user_one;

      io.to(`user:${otherUserId}`).emit(SOCKET_EVENTS.MESSAGE_SEEN, {
        conversationId: data.conversationId,
        seenBy: userId,
      });
    }
  );

  // ── Delete message notification ─────────
  socket.on(
    SOCKET_EVENTS.MESSAGE_DELETED,
    async (data: { messageId: string; conversationId: string }) => {
      if (!data.messageId || !data.conversationId) return;

      const conv = await conversationRepository.findById(data.conversationId);
      if (!conv) return;

      const otherUserId = conv.user_one === userId ? conv.user_two : conv.user_one;

      io.to(`user:${otherUserId}`).emit(SOCKET_EVENTS.MESSAGE_DELETED, {
        messageId: data.messageId,
        conversationId: data.conversationId,
      });
    }
  );
}
