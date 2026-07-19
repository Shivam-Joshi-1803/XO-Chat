// ──────────────────────────────────────────────
// XOChat — Chat Request Service
// ──────────────────────────────────────────────
import { requestRepository } from '../repositories/requestRepository';
import { conversationRepository } from '../repositories/conversationRepository';
import { userRepository } from '../repositories/userRepository';
import { userService } from './userService';
import { ApiResponse, ChatRequest, PublicUser } from '../types';
import { logger } from '../utils/logger';

export const requestService = {
  async sendRequest(
    senderId: string,
    receiverUsername: string
  ): Promise<ApiResponse<ChatRequest>> {
    // Find receiver
    const receiver = await userRepository.findByUsername(receiverUsername);
    if (!receiver) {
      return { success: false, error: 'User not found' };
    }

    // Cannot add yourself
    if (receiver.id === senderId) {
      return { success: false, error: 'You cannot send a request to yourself' };
    }

    // Check if blocked
    const blocked = await userService.isBlocked(senderId, receiver.id);
    if (blocked) {
      return { success: false, error: 'Cannot send request to this user' };
    }

    // Check if conversation already exists
    const existing = await conversationRepository.findByUsers(senderId, receiver.id);
    if (existing) {
      return { success: false, error: 'You already have a conversation with this user' };
    }

    // Check if pending request already exists
    const pendingRequest = await requestRepository.findPendingBetween(senderId, receiver.id);
    if (pendingRequest) {
      return { success: false, error: 'A pending request already exists with this user' };
    }

    const request = await requestRepository.create(senderId, receiver.id);
    if (!request) {
      return { success: false, error: 'Failed to send chat request' };
    }

    logger.info('requestService', 'Chat request sent');
    return { success: true, data: request };
  },

  async acceptRequest(
    userId: string,
    requestId: string
  ): Promise<ApiResponse<{ request: ChatRequest; conversationId: string }>> {
    const request = await requestRepository.findById(requestId);

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // Only the receiver can accept
    if (request.receiver_id !== userId) {
      return { success: false, error: 'You are not authorized to accept this request' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'This request has already been handled' };
    }

    // Update request status
    const updated = await requestRepository.updateStatus(requestId, 'accepted');
    if (!updated) {
      return { success: false, error: 'Failed to accept request' };
    }

    // Create conversation
    const conversation = await conversationRepository.create(
      request.sender_id,
      request.receiver_id
    );

    if (!conversation) {
      return { success: false, error: 'Failed to create conversation' };
    }

    logger.info('requestService', 'Chat request accepted, conversation created');
    return {
      success: true,
      data: { request: updated, conversationId: conversation.id },
    };
  },

  async rejectRequest(
    userId: string,
    requestId: string
  ): Promise<ApiResponse<ChatRequest>> {
    const request = await requestRepository.findById(requestId);

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.receiver_id !== userId) {
      return { success: false, error: 'You are not authorized to reject this request' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'This request has already been handled' };
    }

    const updated = await requestRepository.updateStatus(requestId, 'rejected');
    if (!updated) {
      return { success: false, error: 'Failed to reject request' };
    }

    logger.info('requestService', 'Chat request rejected');
    return { success: true, data: updated };
  },

  async cancelRequest(
    userId: string,
    requestId: string
  ): Promise<ApiResponse> {
    const request = await requestRepository.findById(requestId);

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // Only the sender can cancel
    if (request.sender_id !== userId) {
      return { success: false, error: 'You are not authorized to cancel this request' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Only pending requests can be cancelled' };
    }

    const success = await requestRepository.deleteById(requestId);
    if (!success) {
      return { success: false, error: 'Failed to cancel request' };
    }

    logger.info('requestService', 'Chat request cancelled');
    return { success: true, message: 'Request cancelled' };
  },

  async getPendingRequests(
    userId: string
  ): Promise<ApiResponse<{ received: ChatRequest[]; sent: ChatRequest[] }>> {
    const [received, sent] = await Promise.all([
      requestRepository.findReceivedPending(userId),
      requestRepository.findSentPending(userId),
    ]);

    // Enrich with sender/receiver public info
    const enrichedReceived = await Promise.all(
      received.map(async (req) => {
        const sender = await userRepository.findPublicById(req.sender_id);
        return { ...req, sender: sender || undefined };
      })
    );

    const enrichedSent = await Promise.all(
      sent.map(async (req) => {
        const receiver = await userRepository.findPublicById(req.receiver_id);
        return { ...req, receiver: receiver || undefined };
      })
    );

    return {
      success: true,
      data: { received: enrichedReceived, sent: enrichedSent },
    };
  },

  async getAllRequests(userId: string): Promise<ApiResponse<{
    received_pending: ChatRequest[];
    sent_pending: ChatRequest[];
    accepted: ChatRequest[];
    rejected_received: ChatRequest[];
  }>> {
    const all = await requestRepository.findAllForUser(userId);

    // Enrich all with user info in parallel
    const enrichAll = async (requests: ChatRequest[], enrichField: 'sender' | 'receiver') => {
      return Promise.all(
        requests.map(async (req) => {
          const otherId = enrichField === 'sender' ? req.sender_id : req.receiver_id;
          const user = await userRepository.findPublicById(otherId);
          return { ...req, [enrichField]: user || undefined };
        })
      );
    };

    const [rp, sp, acc, rr] = await Promise.all([
      enrichAll(all.received_pending, 'sender'),
      enrichAll(all.sent_pending, 'receiver'),
      enrichAll(all.accepted, 'sender'),
      enrichAll(all.rejected_received, 'sender'),
    ]);

    return {
      success: true,
      data: {
        received_pending: rp,
        sent_pending: sp,
        accepted: acc,
        rejected_received: rr,
      },
    };
  },
};
