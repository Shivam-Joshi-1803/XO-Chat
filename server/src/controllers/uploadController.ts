// ──────────────────────────────────────────────
// XOChat — Upload Controller
// ──────────────────────────────────────────────
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadService } from '../services/uploadService';
import { authenticate } from '../middleware/authenticate';
import { uploadLimiter } from '../middleware/rateLimiter';

// Configure multer for memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

const router = Router();

// ── Upload image ────────────────────────────
router.post(
  '/images/upload',
  uploadLimiter,
  authenticate,
  upload.single('image'),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No image file provided' });
      return;
    }

    const conversationId = req.body.conversation_id;
    if (!conversationId) {
      res.status(400).json({ success: false, error: 'conversation_id is required' });
      return;
    }

    const result = await uploadService.uploadImage(
      req.user!.id,
      conversationId,
      req.file
    );

    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.status(201).json(result);
  }
);

export const uploadController = router;
