// ──────────────────────────────────────────────
// XOChat — Socket.IO presence handler
// ──────────────────────────────────────────────
import { Socket, Server } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import { userRepository } from '../../repositories/userRepository';
import { logger } from '../../utils/logger';

// Maps userId -> Set of socketIds (user can have multiple tabs)
const onlineUsers = new Map<string, Set<string>>();

export function getOnlineUsers(): Map<string, Set<string>> {
  return onlineUsers;
}

export function isUserOnline(userId: string): boolean {
  const sockets = onlineUsers.get(userId);
  return !!sockets && sockets.size > 0;
}

export function getUserSocketIds(userId: string): string[] {
  const sockets = onlineUsers.get(userId);
  return sockets ? Array.from(sockets) : [];
}

export function handlePresence(io: Server, socket: Socket, userId: string): void {
  // Register this socket for the user
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId)!.add(socket.id);

  // Mark user as online in DB
  userRepository.setOnline(userId, true).catch(() => {});

  // Broadcast online status
  socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, { userId });
  logger.debug('presenceHandler', `User online: ${userId}`);

  // Join user's personal room for targeted messages
  socket.join(`user:${userId}`);

  // Handle disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        // User is fully offline
        await userRepository.setOnline(userId, false).catch(() => {});
        io.emit(SOCKET_EVENTS.USER_OFFLINE, {
          userId,
          lastSeen: new Date().toISOString(),
        });
        logger.debug('presenceHandler', `User offline: ${userId}`);
      }
    }
  });
}
