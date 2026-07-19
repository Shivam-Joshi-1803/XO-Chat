// ──────────────────────────────────────────────
// XOChat — User Controller
// ──────────────────────────────────────────────
import { Router, Request, Response } from 'express';
import { userService } from '../services/userService';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { validateQuery } from '../middleware/validateRequest';
import {
  checkUsernameSchema,
  createUserSchema,
  updateProfileSchema,
  searchUserSchema,
  blockUserSchema,
  recoverAccountSchema,
} from '../validation/userSchemas';
import {
  createUserLimiter,
  usernameCheckLimiter,
  generalLimiter,
  recoveryLimiter,
} from '../middleware/rateLimiter';
import { userRepository } from '../repositories/userRepository';
import { env } from '../config/env';

const router = Router();

// ── Check username availability ─────────────
router.post(
  '/username/check',
  usernameCheckLimiter,
  validateRequest(checkUsernameSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await userService.checkUsername(req.body.username);
    res.json(result);
  }
);

// ── Create user ─────────────────────────────
router.post(
  '/users/create',
  createUserLimiter,
  validateRequest(createUserSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await userService.createUser(
      req.body.username,
      req.body.display_name
    );

    if (!result.success || !result.data) {
      res.status(409).json(result);
      return;
    }

    // Set session token in HttpOnly cookie
    // In production: SameSite=None + Secure required for cross-origin fetch (Vercel→Render)
    const cookieName = 'xo_session';
    res.cookie(cookieName, result.data.session_token, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: env.isProd ? 'none' : 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      path: '/',
    });

    // Return user data without session_token and recovery_key_hash,
    // but include the one-time recovery_key
    const { session_token, recovery_key_hash, ...publicData } = result.data;
    res.status(201).json({ success: true, data: publicData });
  }
);

// ── Recover account ──────────────────────────
// Rate limited: 5 attempts per IP per 15 minutes
router.post(
  '/recover',
  recoveryLimiter,
  validateRequest(recoverAccountSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await userService.recoverAccount(
      req.body.username,
      req.body.recovery_key
    );

    if (!result.success || !result.data) {
      res.status(401).json(result);
      return;
    }

    // Issue a new session cookie with the rotated token
    // In production: SameSite=None + Secure required for cross-origin fetch (Vercel→Render)
    const cookieName = 'xo_session';
    res.cookie(cookieName, result.data.session_token, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: env.isProd ? 'none' : 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({ success: true, message: 'Account recovered successfully' });
  }
);

// ── Delete user identity ────────────────────
router.delete(
  '/users/delete',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const result = await userService.deleteUser(req.user!.id);

    if (result.success) {
      // Clear session cookie
      res.clearCookie('xo_session', {
        path: '/',
        secure: env.isProd,
        sameSite: env.isProd ? 'none' : 'lax',
      });
    }

    res.json(result);
  }
);

// ── Update profile ──────────────────────────
router.patch(
  '/profile',
  generalLimiter,
  authenticate,
  validateRequest(updateProfileSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await userService.updateProfile(req.user!.id, req.body);
    // updateProfile already updates last_active via repository
    res.json(result);
  }
);

// ── Get own profile ─────────────────────────
router.get(
  '/users/me',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    // Update last_active on dashboard open / session validation
    await userRepository.updateLastActive(req.user!.id);
    const { session_token, recovery_key_hash, ...publicUser } = req.user!;
    res.json({ success: true, data: publicUser });
  }
);

// ── Search users ────────────────────────────
router.get(
  '/users/search',
  generalLimiter,
  authenticate,
  validateQuery(searchUserSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await userService.searchUsers(
      req.query.q as string,
      req.user!.id
    );
    res.json(result);
  }
);

// ── Block user ──────────────────────────────
router.post(
  '/users/block',
  generalLimiter,
  authenticate,
  validateRequest(blockUserSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await userService.blockUser(req.user!.id, req.body.user_id);
    res.json(result);
  }
);

// ── Unblock user ────────────────────────────
router.post(
  '/users/unblock',
  generalLimiter,
  authenticate,
  validateRequest(blockUserSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await userService.unblockUser(req.user!.id, req.body.user_id);
    res.json(result);
  }
);

// ── Get blocked users ────────────────────────
router.get(
  '/users/blocked',
  generalLimiter,
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const result = await userService.getBlockedUsers(req.user!.id);
    res.json(result);
  }
);

export const userController = router;
