// ──────────────────────────────────────────────
// XOChat — Socket.IO Server Manager
// ──────────────────────────────────────────────
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import { env } from '../config/env';
import { userRepository } from '../repositories/userRepository';
import { handleConnection } from './handlers/connectionHandler';
import { logger } from '../utils/logger';

let io: Server;

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.isDev
        ? [env.CLIENT_URL, 'http://localhost:3000']
        : [env.CLIENT_URL],
      credentials: true,
    },
    pingInterval: 30000,  // Heartbeat every 30 seconds
    pingTimeout: 60000,
    connectTimeout: 20000,
  });

  // Authentication middleware for socket connections
  io.use(async (socket: Socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      let sessionToken = '';

      if (cookieHeader) {
        const cookies = cookie.parse(cookieHeader);
        sessionToken = cookies['__Host-xo_session'] || cookies['xo_session'] || cookies['xo_session_client'] || '';
      }

      // Fallback: Read token from socket handshake auth payload (useful on mobile viewports where cookies are blocked)
      if (!sessionToken && socket.handshake.auth && socket.handshake.auth.token) {
        sessionToken = socket.handshake.auth.token;
      }

      if (!sessionToken) {
        return next(new Error('Authentication required'));
      }

      const user = await userRepository.findBySessionToken(sessionToken);
      if (!user) {
        return next(new Error('Invalid session'));
      }

      // Attach user to socket
      (socket as any).userId = user.id;
      (socket as any).username = user.username;
      next();
    } catch (err) {
      logger.error('socketManager', 'Socket auth failed', err);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    if (!userId) {
      socket.disconnect();
      return;
    }

    handleConnection(io, socket, userId);
  });

  // Cleanup stale connections every 5 minutes
  setInterval(() => {
    const sockets = io.sockets.sockets;
    sockets.forEach((s) => {
      if (!s.connected) {
        s.disconnect(true);
      }
    });
  }, 5 * 60 * 1000);

  logger.info('socketManager', 'Socket.IO server initialized');
  return io;
}
