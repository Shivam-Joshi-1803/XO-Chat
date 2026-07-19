// ──────────────────────────────────────────────
// XOChat — Message Service
// ──────────────────────────────────────────────
import { messageRepository } from '../repositories/messageRepository';
import { conversationRepository } from '../repositories/conversationRepository';
import { userService } from './userService';
import { sanitizeText } from '../utils/sanitize';
import { ApiResponse, Message, PaginatedResponse } from '../types';
import { logger } from '../utils/logger';

export const messageService = {
  async sendMessage(
    userId: string,
    params: {
      conversation_id: string;
      type: 'text' | 'image';
      content?: string | null;
      image_url?: string | null;
      reply_to?: string | null;
    }
  ): Promise<ApiResponse<Message>> {
    // Verify user is a participant
    const isParticipant = await conversationRepository.isParticipant(
      params.conversation_id,
      userId
    );
    if (!isParticipant) {
      return { success: false, error: 'You are not a participant of this conversation' };
    }

    // Get conversation to check for blocks
    const conv = await conversationRepository.findById(params.conversation_id);
    if (!conv) {
      return { success: false, error: 'Conversation not found' };
    }

    const otherUserId = conv.user_one === userId ? conv.user_two : conv.user_one;
    const blocked = await userService.isBlocked(userId, otherUserId);
    if (blocked) {
      return { success: false, error: 'Cannot send messages in this conversation' };
    }

    // Sanitize text content
    const sanitizedContent =
      params.type === 'text' && params.content
        ? sanitizeText(params.content)
        : params.content;

    if (params.type === 'text' && (!sanitizedContent || !sanitizedContent.trim())) {
      return { success: false, error: 'Message content cannot be empty' };
    }

    const message = await messageRepository.create({
      conversation_id: params.conversation_id,
      sender_id: userId,
      type: params.type,
      content: sanitizedContent || null,
      image_url: params.image_url || null,
      reply_to: params.reply_to || null,
    });

    if (!message) {
      return { success: false, error: 'Failed to send message' };
    }

    // Update conversation timestamp
    await conversationRepository.touch(params.conversation_id);

    return { success: true, data: message };
  },

  async getMessages(
    userId: string,
    conversationId: string,
    page: number = 1,
    limit: number = 30
  ): Promise<PaginatedResponse<Message>> {
    // Verify user is a participant
    const isParticipant = await conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return { success: false, error: 'Conversation not found' };
    }

    const { messages, total } = await messageRepository.findByConversation(
      conversationId,
      page,
      limit
    );

    return {
      success: true,
      data: messages,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  },

  async deleteMessage(
    userId: string,
    messageId: string
  ): Promise<ApiResponse> {
    const message = await messageRepository.findById(messageId);
    if (!message) {
      return { success: false, error: 'Message not found' };
    }

    // Only the sender can delete their own message
    if (message.sender_id !== userId) {
      return { success: false, error: 'You can only delete your own messages' };
    }

    const success = await messageRepository.deleteMessage(messageId);
    if (!success) {
      return { success: false, error: 'Failed to delete message' };
    }

    return { success: true, message: 'Message deleted' };
  },

  async markAsRead(
    userId: string,
    conversationId: string
  ): Promise<ApiResponse> {
    const isParticipant = await conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return { success: false, error: 'Conversation not found' };
    }

    await messageRepository.markAsRead(conversationId, userId);
    return { success: true };
  },

  async searchMessages(
    userId: string,
    conversationId: string,
    query: string
  ): Promise<ApiResponse<Message[]>> {
    const isParticipant = await conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return { success: false, error: 'Conversation not found' };
    }

    const messages = await messageRepository.searchInConversation(
      conversationId,
      query
    );
    return { success: true, data: messages };
  },
};
