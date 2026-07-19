// ──────────────────────────────────────────────
// XOChat — Socket.IO request handler
// ──────────────────────────────────────────────
import { Socket, Server } from 'socket.io';
import { SOCKET_EVENTS } from '../events';

/**
 * Handles real-time notifications for chat request events.
 * The actual request logic is handled by REST API controllers;
 * this handler is used by the socketManager to emit events.
 */
export function handleRequestEvents(io: Server, socket: Socket, userId: string): void {
  // Request events are primarily emitted from the socketManager
  // after REST API calls succeed. This handler is a placeholder
  // for any client-side initiated socket request events.
}

/**
 * Emits a new chat request notification to the receiver.
 */
export function emitNewRequest(
  io: Server,
  receiverId: string,
  requestData: Record<string, unknown>
): void {
  io.to(`user:${receiverId}`).emit(SOCKET_EVENTS.REQUEST_NEW, requestData);
}

/**
 * Emits request accepted notification to the sender.
 */
export function emitRequestAccepted(
  io: Server,
  senderId: string,
  data: Record<string, unknown>
): void {
  io.to(`user:${senderId}`).emit(SOCKET_EVENTS.REQUEST_ACCEPTED, data);
}

/**
 * Emits request rejected notification to the sender.
 */
export function emitRequestRejected(
  io: Server,
  senderId: string,
  data: Record<string, unknown>
): void {
  io.to(`user:${senderId}`).emit(SOCKET_EVENTS.REQUEST_REJECTED, data);
}

/**
 * Emits conversation deleted notification.
 */
export function emitConversationDeleted(
  io: Server,
  userId: string,
  conversationId: string
): void {
  io.to(`user:${userId}`).emit(SOCKET_EVENTS.CONVERSATION_DELETED, { conversationId });
}
