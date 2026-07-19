// ──────────────────────────────────────────────
// XOChat — Conversation Controller
// ──────────────────────────────────────────────
import { Router, Request, Response } from 'express';
import { conversationService } from '../services/conversationService';
import { authenticate } from '../middleware/authenticate';
import { generalLimiter } from '../middleware/rateLimiter';
import { getIO } from '../socket/socketManager';
import { SOCKET_EVENTS } from '../socket/events';

const router = Router();

// ── Get all conversations ───────────────────
router.get(
  '/conversations',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const result = await conversationService.getConversations(req.user!.id);
    res.json(result);
  }
);

// ── Delete conversation ─────────────────────
router.delete(
  '/conversations/:id',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const conversationId = req.params.id as string;
    const result = await conversationService.deleteConversation(
      conversationId,
      req.user!.id
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    // Notify both participants
    try {
      const io = getIO();
      io.to(`conv:${conversationId}`).emit(SOCKET_EVENTS.CONVERSATION_DELETED, { conversationId });
    } catch { /* non-fatal */ }
    res.json(result);
  }
);

// ── Pin/unpin conversation ──────────────────
router.patch(
  '/conversations/:id/pin',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const pin = req.body.pin !== false;
    const result = await conversationService.pinConversation(
      req.params.id as string,
      req.user!.id,
      pin
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  }
);

// ── Archive/unarchive conversation ──────────
router.patch(
  '/conversations/:id/archive',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const archive = req.body.archive !== false;
    const result = await conversationService.archiveConversation(
      req.params.id as string,
      req.user!.id,
      archive
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  }
);

// ── Close conversation (hide for this user only) ─
router.post(
  '/conversations/:id/close',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const result = await conversationService.closeConversation(
      req.params.id as string,
      req.user!.id
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  }
);

// ── Mute/unmute conversation ─────────────────
router.patch(
  '/conversations/:id/mute',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const mute = req.body.mute !== false;
    const result = await conversationService.muteConversation(
      req.params.id as string,
      req.user!.id,
      mute
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  }
);

export const conversationController = router;
