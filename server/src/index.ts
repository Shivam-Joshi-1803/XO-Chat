// ──────────────────────────────────────────────
// XOChat — Server Entry Point
// ──────────────────────────────────────────────
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { corsOptions } from './config/cors';
import { securityHeaders } from './middleware/securityHeaders';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { userController } from './controllers/userController';
import { requestController } from './controllers/requestController';
import { conversationController } from './controllers/conversationController';
import { messageController } from './controllers/messageController';
import { uploadController } from './controllers/uploadController';
import { initializeSocket } from './socket/socketManager';
import { startScheduledJobs } from './jobs';
import { logger } from './utils/logger';

const app = express();
const httpServer = createServer(app);

// ── Global Middleware ─────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // We set our own CSP in securityHeaders
}));
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(compression()); // HTTP response compression
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(generalLimiter);

// ── Health Check ──────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────
app.use('/api', userController);
app.use('/api', requestController);
app.use('/api', conversationController);
app.use('/api', messageController);
app.use('/api', uploadController);

// ── Error Handler ─────────────────────────────
app.use(errorHandler);

// ── Initialize Socket.IO ──────────────────────
initializeSocket(httpServer);

// ── Start Server ──────────────────────────────
const HOST = '0.0.0.0';
httpServer.listen(env.PORT, HOST, () => {
  logger.info('server', `XOChat server running on ${HOST}:${env.PORT}`);
  logger.info('server', `Environment: ${env.NODE_ENV}`);

  // Start background jobs AFTER server is listening (non-blocking)
  startScheduledJobs();
});

export default app;
