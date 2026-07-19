'use client';
import React, { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/lib/api';
import { useChatStore } from '@/stores/chatStore';
import type { Message } from '@/types';
import { Trash2, Copy, Reply, Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onReply: (message: Message) => void;
}

export const MessageBubble = React.memo(function MessageBubble({ message, onReply }: MessageBubbleProps) {
  const { user: currentUser } = useUserStore();
  const { addToast, setShowImagePreview } = useUIStore();
  const { removeMessage, messages } = useChatStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const isMe = message.sender_id === currentUser?.id;
  const conversationMessages = messages[message.conversation_id] || [];

  const handleCopyText = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      addToast('success', 'Copied');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteMessage(message.id);
      if (res.success) {
        removeMessage(message.conversation_id, message.id);
        addToast('success', 'Deleted');
      }
    } catch (err) {
      addToast('error', 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const replyMessage = message.reply_to
    ? conversationMessages.find((m) => m.id === message.reply_to)
    : null;

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative px-0 py-0.5`}>
      <div className="max-w-[68%] flex flex-col relative">
        {/* Reply Preview */}
        {replyMessage && (
          <div
            className={`
              text-[10px] px-3 py-1.5 border-l-4 border-[#FF4F00] bg-black/5 mb-1
              flex items-center gap-1.5 truncate select-none
              ${isMe ? 'border-r-4 border-l-0 border-r-[#FF4F00] text-right' : ''}
            `}
          >
            <Reply className="w-3 h-3 text-[#FF4F00] rotate-180 shrink-0" />
            <span className="font-bold text-foreground truncate">
              {replyMessage.sender_id === currentUser?.id ? 'You' : 'Them'}:{' '}
              {replyMessage.type === 'image' ? 'Image' : replyMessage.content}
            </span>
          </div>
        )}

        {/* Message Block — Swiss brutalist rectangle */}
        <div
          className={`
            relative flex flex-col gap-1
            border-2 border-border
            transition-all duration-100
            ${isMe
              ? 'bg-foreground text-background'
              : 'bg-surface text-foreground'
            }
          `}
        >
          {/* Image Message */}
          {message.type === 'image' && message.image_url && (
            <div
              className="overflow-hidden max-w-sm cursor-pointer relative group/img border-b-2 border-border"
              onClick={() => setShowImagePreview(message.image_url)}
            >
              <img
                src={message.image_url}
                alt="Shared content"
                loading="lazy"
                className="object-cover w-full max-h-64 hover:scale-[1.01] transition-transform duration-300 select-none"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity" />
            </div>
          )}

          {/* Text Content */}
          {message.type === 'text' && message.content && (
            <p className={`px-3 pt-3 text-sm leading-relaxed whitespace-pre-wrap break-words font-medium`}>
              {message.content}
            </p>
          )}

          {/* Footer */}
          <div className={`flex items-center justify-end gap-1.5 px-3 pb-2 pt-1 ${!message.content && message.type !== 'text' ? '' : ''}`}>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isMe ? 'text-background/50' : 'text-foreground/40'}`}>
              {new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
            {isMe && (
              <span>
                {message.read ? (
                  <CheckCheck className="w-3 h-3 text-[#FF4F00]" />
                ) : (
                  <Check className="w-3 h-3 text-background/40" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Hover Action Toolbar */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 z-20 flex items-center gap-0.5
            opacity-0 group-hover:opacity-100 transition-opacity duration-100 select-none
            ${isMe ? 'right-full mr-2' : 'left-full ml-2'}
          `}
        >
          <button
            onClick={() => onReply(message)}
            className="p-1.5 bg-surface border-2 border-border hover:bg-foreground hover:text-background text-foreground transition-colors cursor-pointer rounded-none"
            title="Reply"
          >
            <Reply className="w-3 h-3" />
          </button>
          {message.type === 'text' && (
            <button
              onClick={handleCopyText}
              className="p-1.5 bg-surface border-2 border-border hover:bg-foreground hover:text-background text-foreground transition-colors cursor-pointer rounded-none"
              title="Copy"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
          {isMe && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 bg-white border-2 border-red-600 hover:bg-red-600 hover:text-white text-red-600 transition-colors cursor-pointer rounded-none"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
