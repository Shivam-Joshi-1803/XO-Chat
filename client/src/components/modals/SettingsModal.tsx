'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import { api } from '@/lib/api';
import { Bell, Download, Trash2, FileOutput, Shield, KeyRound, ExternalLink, Sun } from 'lucide-react';
import Link from 'next/link';

export function SettingsModal() {
  const { showSettingsModal, setShowSettingsModal, addToast, setShowDeleteModal } = useUIStore();
  const { conversations, fetchConversations } = useChatStore();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState(true);
  const [autoDownload, setAutoDownload] = useState(true);
  const [isClearingChats, setIsClearingChats] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeTheme = (localStorage.getItem('xo_theme') as 'light' | 'dark') || 'light';
      setTheme(activeTheme);
      setNotifications(localStorage.getItem('xo_notifications') !== 'false');
      setAutoDownload(localStorage.getItem('xo_auto_download') !== 'false');
    }
  }, []);

  const handleToggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('xo_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    addToast('success', `Theme: ${newTheme}`);
  };

  const handleToggle = (key: string, value: boolean, setter: (val: boolean) => void) => {
    setter(value);
    localStorage.setItem(key, String(value));
    addToast('success', 'Setting updated');
  };

  const handleClearAllChats = async () => {
    if (!confirm('Clear all conversations? This cannot be undone.')) return;
    setIsClearingChats(true);
    try {
      for (const conv of conversations) {
        await api.deleteConversation(conv.id);
      }
      addToast('success', 'All chats deleted');
      await fetchConversations();
      setShowSettingsModal(false);
    } catch {
      addToast('error', 'Failed to clear chats');
    } finally {
      setIsClearingChats(false);
    }
  };

  const handleExportChats = () => {
    try {
      const dataStr = JSON.stringify(conversations, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const filename = `xo_chat_export_${new Date().toISOString().split('T')[0]}.json`;
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', filename);
      link.click();
      addToast('success', 'Chats exported');
    } catch {
      addToast('error', 'Export failed');
    }
  };

  return (
    <Modal
      isOpen={showSettingsModal}
      onClose={() => setShowSettingsModal(false)}
      title="Settings"
      description="Manage your secure messaging and environment."
    >
      <div className="space-y-4 mt-4">
        {/* Theme Settings */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#5e5e5e] dark:text-foreground/60">Theme</h3>
          <div className="flex items-center justify-between gap-3 p-3 border-2 border-border bg-surface">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sun className="w-4 h-4 text-foreground shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wide text-foreground">Visual Theme</h4>
                <p className="text-[10px] text-foreground/60 font-medium leading-tight">Switch between light and dark modes</p>
              </div>
            </div>
            <div className="flex border border-border bg-subtle-gray p-0.5 gap-0.5 shrink-0">
              <button
                onClick={() => handleToggleTheme('light')}
                className={`px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-widest cursor-pointer rounded-none border
                  ${theme === 'light'
                    ? 'bg-foreground text-background border-border'
                    : 'bg-surface text-foreground border-transparent hover:bg-foreground/5'}`}
              >
                LIGHT
              </button>
              <button
                onClick={() => handleToggleTheme('dark')}
                className={`px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-widest cursor-pointer rounded-none border
                  ${theme === 'dark'
                    ? 'bg-foreground text-background border-border'
                    : 'bg-surface text-foreground border-transparent hover:bg-foreground/5'}`}
              >
                DARK
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#5e5e5e] dark:text-foreground/60">Notifications</h3>
          <div className="flex items-center justify-between gap-3 p-3 border-2 border-border bg-surface">
            <div className="flex items-center gap-2.5 min-w-0">
              <Bell className="w-4 h-4 text-foreground shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wide text-foreground">Desktop Notifications</h4>
                <p className="text-[10px] text-foreground/60 font-medium leading-tight">Notify about incoming requests and messages</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('xo_notifications', !notifications, setNotifications)}
              className={`shrink-0 px-3 py-1.5 border-2 border-border font-mono text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer rounded-none
                ${notifications ? 'bg-[#FF4F00] text-white border-[#FF4F00]' : 'bg-surface text-foreground hover:bg-foreground hover:text-background'}`}
            >
              {notifications ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Chat Settings */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#5e5e5e] dark:text-foreground/60">Preferences</h3>
          <div className="flex items-center justify-between gap-3 p-3 border-2 border-border bg-surface">
            <div className="flex items-center gap-2.5 min-w-0">
              <Download className="w-4 h-4 text-foreground shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wide text-foreground">Auto Image Loading</h4>
                <p className="text-[10px] text-foreground/60 font-medium leading-tight">Load shared images instantly in conversations</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('xo_auto_download', !autoDownload, setAutoDownload)}
              className={`shrink-0 px-3 py-1.5 border-2 border-border font-mono text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer rounded-none
                ${autoDownload ? 'bg-[#FF4F00] text-white border-[#FF4F00]' : 'bg-surface text-foreground hover:bg-foreground hover:text-background'}`}
            >
              {autoDownload ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Recovery Key */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#5e5e5e] dark:text-foreground/60">Recovery</h3>
          <div className="p-3.5 border-2 border-border bg-surface space-y-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#FF4F00] shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wide text-foreground">Recovery Key</h4>
            </div>
            <p className="text-[10px] text-foreground/60 font-medium leading-normal">
              Your recovery key was shown once at account creation. Keep it safe — it is the only way to recover your identity.
            </p>
            <Link
              href="/recover"
              target="_blank"
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#FF4F00] hover:text-foreground border-b border-[#FF4F00] hover:border-foreground transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open Recovery
            </Link>
          </div>
        </div>

        {/* Data Actions */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#5e5e5e] dark:text-foreground/60">Data Operations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={handleExportChats}
              className="w-full gap-2 justify-start px-3 py-2.5"
            >
              <FileOutput className="w-3.5 h-3.5" /> Export Data
            </Button>
            <Button
              variant="secondary"
              onClick={handleClearAllChats}
              loading={isClearingChats}
              className="w-full gap-2 justify-start px-3 py-2.5 hover:bg-red-600 hover:text-white hover:border-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Chats
            </Button>
          </div>
        </div>

        {/* Identity & Deletion */}
        <div className="border-t-2 border-border/10 pt-4 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#5e5e5e] dark:text-foreground/60">
            <Shield className="w-4 h-4 shrink-0" /> Secure Sandbox
          </div>
          <Button
            variant="danger"
            onClick={() => {
              setShowSettingsModal(false);
              setShowDeleteModal(true);
            }}
            className="w-full xs:w-auto px-4 py-2"
          >
            Delete Identity
          </Button>
        </div>
      </div>
    </Modal>
  );
}
