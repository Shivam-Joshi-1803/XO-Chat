// ──────────────────────────────────────────────
// XOChat — Chat Request Controller
// ──────────────────────────────────────────────
import { Router, Request, Response } from 'express';
import { requestService } from '../services/requestService';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { sendRequestSchema, respondRequestSchema, cancelRequestSchema } from '../validation/requestSchemas';
import { generalLimiter } from '../middleware/rateLimiter';
import { userRepository } from '../repositories/userRepository';
import { getIO } from '../socket/socketManager';
import { SOCKET_EVENTS } from '../socket/events';

const router = Router();

// ── Send chat request ───────────────────────
router.post(
  '/requests/send',
  generalLimiter,
  authenticate,
  validateRequest(sendRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await requestService.sendRequest(
      req.user!.id,
      req.body.username
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    // Notify receiver via socket
    if (result.data) {
      try {
        const io = getIO();
        io.to(`user:${result.data.receiver_id}`).emit(SOCKET_EVENTS.REQUEST_NEW, {
          ...result.data,
          sender: { id: req.user!.id, username: req.user!.username, display_name: req.user!.display_name },
        });
      } catch {
        // Socket not yet initialized or unavailable — non-fatal
      }
    }

    res.status(201).json(result);
  }
);

// ── Accept chat request ─────────────────────
router.post(
  '/requests/accept',
  generalLimiter,
  authenticate,
  validateRequest(respondRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await requestService.acceptRequest(
      req.user!.id,
      req.body.request_id
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    // Update last_active
    await userRepository.updateLastActive(req.user!.id);

    // Notify sender via socket
    if (result.data) {
      try {
        const io = getIO();
        io.to(`user:${result.data.request.sender_id}`).emit(SOCKET_EVENTS.REQUEST_ACCEPTED, result.data);
      } catch { /* non-fatal */ }
    }

    res.json(result);
  }
);

// ── Reject chat request ─────────────────────
router.post(
  '/requests/reject',
  generalLimiter,
  authenticate,
  validateRequest(respondRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await requestService.rejectRequest(
      req.user!.id,
      req.body.request_id
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    // Update last_active
    await userRepository.updateLastActive(req.user!.id);

    // Notify sender via socket
    if (result.data) {
      try {
        const io = getIO();
        io.to(`user:${result.data.sender_id}`).emit(SOCKET_EVENTS.REQUEST_REJECTED, result.data);
      } catch { /* non-fatal */ }
    }

    res.json(result);
  }
);

// ── Cancel sent request ─────────────────────
router.post(
  '/requests/cancel',
  generalLimiter,
  authenticate,
  validateRequest(cancelRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await requestService.cancelRequest(
      req.user!.id,
      req.body.request_id
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  }
);

// ── Get pending requests ────────────────────
router.get(
  '/requests',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const result = await requestService.getPendingRequests(req.user!.id);
    res.json(result);
  }
);

// ── Get ALL requests (for requests page tabs) ─
router.get(
  '/requests/all',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const result = await requestService.getAllRequests(req.user!.id);
    res.json(result);
  }
);

export const requestController = router;
