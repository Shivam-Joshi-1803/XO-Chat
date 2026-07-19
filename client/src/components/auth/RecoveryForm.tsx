'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { KeyRound, CheckCircle2, AlertTriangle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

export function RecoveryForm() {
  const router = useRouter();
  const { fetchUser } = useUserStore();

  const [username, setUsername] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    const cleanKey = recoveryKey.trim().toUpperCase();

    if (!cleanUsername) {
      setError('Please enter your username');
      return;
    }
    if (!cleanKey) {
      setError('Please enter your recovery key');
      return;
    }

    setLoading(true);
    try {
      const res = await api.recoverAccount(cleanUsername, cleanKey);
      if (res.success) {
        setSuccess(true);
        await fetchUser();
        setTimeout(() => {
          router.push('/chat');
        }, 1200);
      } else {
        setError(res.error || 'Invalid username or recovery key');
      }
    } catch (err: any) {
      setError(err?.message || 'Recovery failed. Check network or key details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground hover:text-[#FF4F00] transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Brutalist Form Card */}
      <div className="bg-surface border-4 border-border p-8 shadow-[8px_8px_0px_0px_var(--border)] rounded-none">
        {/* Icon */}
        <div className="w-14 h-14 bg-foreground flex items-center justify-center mx-auto mb-6 border-2 border-border shadow-[4px_4px_0px_0px_#FF4F00]">
          <KeyRound className="w-7 h-7 text-background" />
        </div>

        <h1 className="text-xl font-black text-foreground text-center mb-2 uppercase tracking-widest">Recover Account</h1>
        <p className="text-xs text-foreground/60 text-center mb-8 leading-relaxed font-semibold uppercase tracking-wider">
          Enter username and recovery key to restore anonymous identity.
        </p>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 bg-foreground flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#FF4F00]" />
            </div>
            <p className="text-foreground font-black uppercase tracking-widest text-xs">Account Recovered</p>
            <p className="text-[10px] text-foreground/60 font-mono">Redirecting to chats...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-foreground uppercase tracking-widest">
                Username
              </label>
              <input
                id="recover-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                autoComplete="username"
                maxLength={20}
                className="w-full bg-surface border-2 border-border rounded-none px-4 py-3 text-sm text-foreground placeholder-foreground/25 font-semibold focus:outline-none focus:border-[#FF4F00] transition-colors"
              />
            </div>

            {/* Recovery Key */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-foreground uppercase tracking-widest">
                Recovery Key
              </label>
              <div className="relative">
                <input
                  id="recover-key"
                  type={showKey ? 'text' : 'password'}
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
                  placeholder="XO-XXXX-XXXX-XXXX-XXXX"
                  autoComplete="off"
                  maxLength={29}
                  className="w-full bg-surface border-2 border-border rounded-none px-4 py-3 pr-10 text-sm text-foreground placeholder-foreground/25 font-mono focus:outline-none focus:border-[#FF4F00] transition-colors tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[9px] font-black uppercase tracking-wider text-foreground/45">
                Format: XO-XXXX-XXXX-XXXX-XXXX (shown once at creation)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-600/10 border-2 border-red-600 px-4 py-3 text-red-600 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs leading-normal">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="recover-submit"
              type="submit"
              disabled={loading || !username.trim() || !recoveryKey.trim()}
              className="w-full py-3 bg-foreground border-2 border-border text-background hover:bg-[#FF4F00] hover:border-[#FF4F00] hover:text-white font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 rounded-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-background/20 border-t-background rounded-none animate-spin" />
                  Recovering...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Recover Account
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
