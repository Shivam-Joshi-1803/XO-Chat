'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/lib/api';
import { EmojiPicker } from '@/components/ui/EmojiPicker';
import {
  Send, Image as ImageIcon, Smile, X, Reply, Loader2,
} from 'lucide-react';
import type { Message } from '@/types';
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants';

interface MessageInputProps {
  conversationId: string;
  replyTarget: Message | null;
  onClearReply: () => void;
  onMessageSent: (message: Message) => void;
}

export function MessageInput({
  conversationId,
  replyTarget,
  onClearReply,
  onMessageSent,
}: MessageInputProps) {
  const socket = useSocket();
  const { addToast } = useUIStore();

  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    return () => { stopTyping(); };
  }, [conversationId]);

  const startTyping = () => {
    if (!socket || isTypingRef.current) return;
    isTypingRef.current = true;
    socket.emit('typing:start', { conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { stopTyping(); }, 2000);
  };

  const stopTyping = () => {
    if (!socket || !isTypingRef.current) return;
    isTypingRef.current = false;
    socket.emit('typing:stop', { conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    startTyping();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { addToast('error', 'Image must be < 5 MB'); return; }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { addToast('error', 'Unsupported file type'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;
    setIsUploading(true);
    stopTyping();
    try {
      let uploadedImageUrl = '';
      if (imageFile) {
        const uploadRes = await api.uploadImage(conversationId, imageFile);
        if (uploadRes.success && uploadRes.data?.url) {
          uploadedImageUrl = uploadRes.data.url;
        } else {
          throw new Error('Image upload failed');
        }
      }
      const res = await api.sendMessage({
        conversation_id: conversationId,
        content: text || undefined,
        type: imageFile ? 'image' : 'text',
        image_url: uploadedImageUrl || undefined,
        reply_to: replyTarget ? replyTarget.id : undefined,
      });
      if (res.success && res.data) {
        onMessageSent(res.data);
      }
      setText('');
      handleRemoveImage();
      onClearReply();
    } catch (err) {
      addToast('error', 'Failed to send message');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji);
    startTyping();
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { addToast('error', 'Image must be < 5 MB'); return; }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { addToast('error', 'Unsupported file type'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="px-4 md:px-8 py-3 bg-surface border-t-2 border-border space-y-2 shrink-0 relative z-30"
    >
      {/* Reply Preview Bar */}
      {replyTarget && (
        <div className="flex items-center justify-between px-3 py-2 bg-subtle-gray border-l-4 border-[#FF4F00]">
          <div className="flex items-center gap-2 truncate text-xs">
            <Reply className="w-3.5 h-3.5 text-[#FF4F00] rotate-180 shrink-0" />
            <span className="font-black uppercase tracking-wider text-foreground text-[10px]">Replying:</span>
            <span className="truncate text-foreground/50 font-medium text-[10px]">
              {replyTarget.type === 'image' ? 'Image File' : replyTarget.content}
            </span>
          </div>
          <button
            onClick={onClearReply}
            className="p-1 hover:bg-foreground hover:text-background text-foreground/50 transition-colors cursor-pointer border border-transparent hover:border-border rounded-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image Preview Bar */}
      {imagePreview && (
        <div className="relative inline-block border-2 border-border overflow-hidden">
          <img src={imagePreview} alt="Upload preview" className="w-20 h-20 object-cover" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 p-0.5 bg-black text-white hover:bg-[#FF4F00] transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-surface border-2 border-border text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer rounded-none"
            title="Attach image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 bg-surface border-2 border-border text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer rounded-none"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            {showEmojiPicker && (
              <EmojiPicker
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>
        </div>

        {/* Text input */}
        <input
          value={text}
          onChange={handleInputChange}
          placeholder={imagePreview ? 'Add a caption...' : 'Write a message...'}
          className="flex-1 bg-surface border-2 border-border rounded-none px-4 py-2.5 text-sm text-foreground placeholder-foreground/25 font-medium focus:outline-none focus:border-[#FF4F00] transition-colors"
          disabled={isUploading}
          autoComplete="off"
        />

        <button
          type="submit"
          disabled={isUploading || (!text.trim() && !imageFile)}
          className="p-2.5 bg-foreground border-2 border-border text-background hover:bg-[#FF4F00] hover:border-[#FF4F00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer rounded-none shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
