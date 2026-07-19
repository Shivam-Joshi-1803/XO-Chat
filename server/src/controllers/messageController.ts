// ──────────────────────────────────────────────
// XOChat — Message Controller
// ──────────────────────────────────────────────
import { Router, Request, Response } from 'express';
import { messageService } from '../services/messageService';
import { authenticate } from '../middleware/authenticate';
import { validateRequest, validateQuery } from '../middleware/validateRequest';
import { sendMessageSchema, paginationSchema } from '../validation/messageSchemas';
import { generalLimiter, messageLimiter } from '../middleware/rateLimiter';

const router = Router();

// ── Get messages for conversation ───────────
router.get(
  '/messages/:conversationId',
  generalLimiter,
  authenticate,
  validateQuery(paginationSchema),
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;

    const result = await messageService.getMessages(
      req.user!.id,
      req.params.conversationId as string,
      page,
      limit
    );

    if (!result.success) {
      res.status(403).json(result);
      return;
    }
    res.json(result);
  }
);

// ── Send message ────────────────────────────
router.post(
  '/messages/send',
  messageLimiter,
  authenticate,
  validateRequest(sendMessageSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await messageService.sendMessage(req.user!.id, req.body);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.status(201).json(result);
  }
);

// ── Delete message ──────────────────────────
router.delete(
  '/messages/:id',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const result = await messageService.deleteMessage(
      req.user!.id,
      req.params.id as string
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  }
);

// ── Mark messages as read ───────────────────
router.post(
  '/messages/:conversationId/read',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const result = await messageService.markAsRead(
      req.user!.id,
      req.params.conversationId as string
    );
    res.json(result);
  }
);

// ── Search messages ─────────────────────────
router.get(
  '/messages/:conversationId/search',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query.q as string;
    if (!query || query.length < 1) {
      res.status(400).json({ success: false, error: 'Search query required' });
      return;
    }
    const result = await messageService.searchMessages(
      req.user!.id,
      req.params.conversationId as string,
      query
    );
    res.json(result);
  }
);

export const messageController = router;
