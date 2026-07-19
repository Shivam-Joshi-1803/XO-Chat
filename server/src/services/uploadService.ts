// ──────────────────────────────────────────────
// XOChat — Upload Service
// ──────────────────────────────────────────────
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { getSupabase } from '../config/supabase';
import { conversationRepository } from '../repositories/conversationRepository';
import { isAllowedImageExtension, validateImageMagicBytes } from '../utils/sanitize';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const uploadService = {
  async uploadImage(
    userId: string,
    conversationId: string,
    file: Express.Multer.File
  ): Promise<ApiResponse<{ url: string }>> {
    // Verify user is a participant
    const isParticipant = await conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return { success: false, error: 'Conversation not found' };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File size exceeds 5 MB limit' };
    }

    // Validate extension
    if (!isAllowedImageExtension(file.originalname)) {
      return { success: false, error: 'Unsupported file type. Allowed: jpg, jpeg, png, gif, webp' };
    }

    // Validate magic bytes
    if (!validateImageMagicBytes(file.buffer)) {
      return { success: false, error: 'File content does not match a valid image format' };
    }

    // Generate unique filename with UUID to prevent path traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    const storagePath = `${userId}/${uniqueName}`;

    // Upload to Supabase Storage
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from('chat-images')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      logger.error('uploadService', 'Upload to Supabase Storage failed', error);
      return { success: false, error: 'Failed to upload image' };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chat-images')
      .getPublicUrl(storagePath);

    // TODO(security): Consider integrating malware scanning for uploaded files.
    // TODO(security): Consider CDR (Content Disarm & Reconstruction) for complex image formats.

    return { success: true, data: { url: urlData.publicUrl } };
  },
};
