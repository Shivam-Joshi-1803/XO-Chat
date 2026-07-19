// ──────────────────────────────────────────────
// XOChat — Conversation Service
// ──────────────────────────────────────────────
import { conversationRepository } from '../repositories/conversationRepository';
import { messageRepository } from '../repositories/messageRepository';
import { userRepository } from '../repositories/userRepository';
import { ApiResponse, Conversation } from '../types';
import { logger } from '../utils/logger';

export const conversationService = {
  async getConversations(userId: string): Promise<ApiResponse<Conversation[]>> {
    const conversations = await conversationRepository.findAllForUser(userId);

    // Enrich each conversation with the other user's info, last message, and unread count
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId =
          conv.user_one === userId ? conv.user_two : conv.user_one;

        const [otherUser, lastMessage, unreadCount] = await Promise.all([
          userRepository.findPublicById(otherUserId),
          messageRepository.getLastMessage(conv.id),
          messageRepository.getUnreadCount(conv.id, userId),
        ]);

        return {
          ...conv,
          other_user: otherUser || undefined,
          last_message: lastMessage,
          unread_count: unreadCount,
        };
      })
    );

    // Sort: pinned first, then by updated_at
    enriched.sort((a, b) => {
      const aPinned = a.pinned_by?.includes(userId) ?? false;
      const bPinned = b.pinned_by?.includes(userId) ?? false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return { success: true, data: enriched };
  },

  async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<ApiResponse> {
    // Verify user is a participant
    const isParticipant = await conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return { success: false, error: 'Conversation not found' };
    }

    const success = await conversationRepository.deleteConversation(conversationId);
    if (!success) {
      return { success: false, error: 'Failed to delete conversation' };
    }

    logger.info('conversationService', 'Conversation deleted');
    return { success: true, message: 'Conversation deleted' };
  },

  async pinConversation(
    conversationId: string,
    userId: string,
    pin: boolean
  ): Promise<ApiResponse> {
    const isParticipant = await conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return { success: false, error: 'Conversation not found' };
    }

    const success = await conversationRepository.togglePin(conversationId, userId, pin);
    if (!success) {
      return { success: false, error: 'Failed to update pin' };
    }
    return { success: true, message: pin ? 'Conversation pinned' : 'Conversation unpinned' };
  },

  async archiveConversation(
    conversationId: string,
    userId: string,
    archive: boolean
  ): Promise<ApiResponse> {
    const isParticipant = await conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return { success: false, error: 'Conversation not found' };
    }

    const success = await conversationRepository.toggleArchive(conversationId, userId, archive);
    if (!success) {
      return { success: false, error: 'Failed to archive conversation' };
    }
    return { success: true, message: archive ? 'Conversation archived' : 'Conversation unarchived' };
  },

  async closeConversation(
    conversationId: string,
    userId: string
  ): Promise<ApiResponse> {
    const isParticipant = await conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return { success: false, error: 'Conversation not found' };
    }

    const success = await conversationRepository.hideForUser(conversationId, userId);
    if (!success) {
      return { success: false, error: 'Failed to close conversation' };
    }
    return { success: true, message: 'Conversation closed' };
  },

  async muteConversation(
    conversationId: string,
    userId: string,
    mute: boolean
  ): Promise<ApiResponse> {
    const isParticipant = await conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return { success: false, error: 'Conversation not found' };
    }

    const success = await conversationRepository.toggleMute(conversationId, userId, mute);
    if (!success) {
      return { success: false, error: 'Failed to mute conversation' };
    }
    return { success: true, message: mute ? 'Conversation muted' : 'Conversation unmuted' };
  },
};
