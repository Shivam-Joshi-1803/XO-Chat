'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { useUIStore } from '@/stores/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import { USERNAME_REGEX } from '@/lib/constants';
import { Check, X, Copy, KeyRound, AlertTriangle, ShieldCheck } from 'lucide-react';

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(USERNAME_REGEX, 'Use only letters, numbers, underscores, and dots. No spaces or emojis.'),
  display_name: z
    .string()
    .max(50, 'Display name cannot exceed 50 characters')
    .optional(),
});

type FormData = z.infer<typeof usernameSchema>;

export function UsernameModal() {
  const { showUsernameModal, setShowUsernameModal, addToast } = useUIStore();
  const { setUser } = useUserStore();
  const router = useRouter();

  const [usernameInput, setUsernameInput] = useState('');
  const debouncedUsername = useDebounce(usernameInput, 400);

  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const [keyAcknowledged, setKeyAcknowledged] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(usernameSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (debouncedUsername.length < 3) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }

    if (!USERNAME_REGEX.test(debouncedUsername)) {
      setIsAvailable(false);
      setSuggestions([]);
      return;
    }

    const checkAvailability = async () => {
      setIsChecking(true);
      try {
        const res = await api.checkUsername(debouncedUsername);
        if (res.success && res.data) {
          setIsAvailable(res.data.available);
          if (!res.data.available && res.data.suggestions) {
            setSuggestions(res.data.suggestions);
          } else {
            setSuggestions([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [debouncedUsername]);

  const onSubmit = async (data: FormData) => {
    if (!isAvailable) return;
    setIsSubmitting(true);
    try {
      const res = await api.createUser(data.username, data.display_name || data.username);
      if (res.success && res.data) {
        setPendingUser(res.data);
        setRecoveryKey(res.data.recovery_key || null);
      } else {
        setError('username', { message: res.error || 'Failed to create username.' });
      }
    } catch {
      addToast('error', 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = () => {
    if (!recoveryKey) return;
    navigator.clipboard.writeText(recoveryKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleProceed = () => {
    if (!pendingUser) return;
    setUser(pendingUser);
    setShowUsernameModal(false);
    addToast('success', `Identity created!`);
    router.push('/chat');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUsernameInput(suggestion);
    setValue('username', suggestion, { shouldValidate: true });
    clearErrors('username');
  };

  if (recoveryKey) {
    return (
      <Modal
        isOpen={showUsernameModal}
        onClose={() => {}}
        title="Recovery Key"
        description="This key is shown ONCE. Save it now."
      >
        <div className="space-y-5 mt-2">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3.5 border-2 border-[#FF4F00] bg-[#FF4F00]/10 text-foreground">
            <AlertTriangle className="w-5 h-5 text-[#FF4F00] shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">
              This is your <strong className="font-black uppercase tracking-wider text-[#FF4F00]">recovery key</strong>. If you lose access, this is the only way to recover your identity. It will <strong className="font-black text-foreground">never be shown again</strong>.
            </p>
          </div>

          {/* Key Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Recovery Key
              </label>
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#FF4F00] hover:text-foreground border-b border-[#FF4F00] hover:border-foreground transition-colors cursor-pointer"
              >
                {keyCopied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Key</>}
              </button>
            </div>
            <div className="bg-subtle-gray border-2 border-border p-4 font-mono text-lg text-foreground font-black tracking-widest text-center select-all">
              {recoveryKey}
            </div>
          </div>

          {/* Acknowledgement Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => setKeyAcknowledged((v) => !v)}
              className={`mt-0.5 w-4 h-4 border-2 border-border shrink-0 flex items-center justify-center transition-colors cursor-pointer rounded-none ${
                keyAcknowledged ? 'bg-[#FF4F00] border-[#FF4F00]' : 'bg-surface hover:bg-[#FF4F00]/5'
              }`}
            >
              {keyAcknowledged && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-foreground/60 leading-relaxed select-none">
              I have saved my recovery key in a safe place. I understand it cannot be recovered if lost.
            </span>
          </label>

          <Button
            variant="primary"
            onClick={handleProceed}
            disabled={!keyAcknowledged}
            className="w-full gap-2 py-3.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Save & Continue
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={showUsernameModal}
      onClose={() => setShowUsernameModal(false)}
      title="Create Identity"
      description="Choose a unique username for your permanent anonymous identity."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
        <div className="space-y-1">
          <Input
            label="Username"
            prefix="@"
            placeholder="shiv, ghost"
            {...register('username')}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/\s+/g, '');
              setUsernameInput(val);
              setValue('username', val, { shouldValidate: true });
            }}
            error={errors.username?.message}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />

          {/* Availability Status */}
          <div className="h-6 flex items-center pl-1 text-[10px] font-bold uppercase tracking-widest">
            <AnimatePresence mode="wait">
              {isChecking && (
                <div className="text-foreground/50 flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-border/25 border-t-[#FF4F00] rounded-none animate-spin" />
                  Checking...
                </div>
              )}
              {!isChecking && isAvailable === true && (
                <div className="text-[#FF4F00] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Username is available
                </div>
              )}
              {!isChecking && isAvailable === false && (
                <div className="text-red-600 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Username unavailable
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {!isChecking && isAvailable === false && suggestions.length > 0 && (
            <div className="bg-subtle-gray border-2 border-border p-3.5 space-y-2 overflow-hidden">
              <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60 block">Suggestions</span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(sug)}
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-surface border border-border hover:bg-foreground hover:text-background transition-colors cursor-pointer rounded-none"
                  >
                    @{sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>

        <Input
          label="Display Name (Optional)"
          placeholder="Shiv"
          {...register('display_name')}
          error={errors.display_name?.message}
          autoComplete="off"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowUsernameModal(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isAvailable || isChecking}
            loading={isSubmitting}
          >
            Create Identity
          </Button>
        </div>
      </form>
    </Modal>
  );
}
