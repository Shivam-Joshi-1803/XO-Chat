// ──────────────────────────────────────────────
// XOChat — Socket.IO connection handler
// ──────────────────────────────────────────────
import { Socket, Server } from 'socket.io';
import { handlePresence } from './presenceHandler';
import { handleTyping } from './typingHandler';
import { handleMessages } from './messageHandler';
import { handleRequestEvents } from './requestHandler';
import { userRepository } from '../../repositories/userRepository';
import { logger } from '../../utils/logger';

export function handleConnection(io: Server, socket: Socket, userId: string): void {
  logger.debug('connectionHandler', `Socket connected: ${socket.id}`);

  // Update last_active on (re)connect
  userRepository.updateLastActive(userId).catch(() => {});

  // Register all handlers
  handlePresence(io, socket, userId);
  handleTyping(io, socket, userId);
  handleMessages(io, socket, userId);
  handleRequestEvents(io, socket, userId);
}
