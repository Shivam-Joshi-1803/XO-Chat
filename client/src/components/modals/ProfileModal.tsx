'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/stores/uiStore';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/lib/api';
import { Camera, Save } from 'lucide-react';

const profileSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Display name cannot be empty')
    .max(50, 'Display name must be at most 50 characters'),
  bio: z
    .string()
    .max(160, 'Bio must be at most 160 characters')
    .nullable()
    .optional(),
  avatar_url: z
    .string()
    .url('Invalid URL')
    .or(z.literal(''))
    .nullable()
    .optional(),
});

type FormData = z.infer<typeof profileSchema>;

export function ProfileModal() {
  const { showProfileModal, setShowProfileModal, addToast } = useUIStore();
  const { user, setUser } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: user?.display_name || '',
      bio: user?.bio || '',
      avatar_url: user?.avatar_url || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await api.updateProfile({
        display_name: data.display_name,
        bio: data.bio || null,
        avatar_url: data.avatar_url || null,
      });

      if (res.success && res.data) {
        setUser({ ...user!, ...res.data });
        addToast('success', 'Profile updated!');
        setShowProfileModal(false);
      } else {
        addToast('error', res.error || 'Failed to update profile');
      }
    } catch {
      addToast('error', 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={showProfileModal}
      onClose={() => setShowProfileModal(false)}
      title="Edit Profile"
      description="Update display name, bio, and avatar."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <div className="relative group cursor-pointer">
            <Avatar
              name={user?.display_name || 'Anonymous'}
              src={user?.avatar_url}
              size="xl"
            />
            <div className="absolute inset-0 bg-[#FF4F00]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-none">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-xs font-mono text-foreground font-black uppercase tracking-wider">@{user?.username}</span>
        </div>

        <Input
          label="Display Name"
          placeholder="Shiv"
          {...register('display_name')}
          error={errors.display_name?.message}
          autoComplete="off"
        />

        <Input
          label="Avatar URL (Optional)"
          placeholder="https://example.com/avatar.png"
          {...register('avatar_url')}
          error={errors.avatar_url?.message}
          autoComplete="off"
        />

        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase tracking-widest text-foreground">Bio (Optional)</label>
          <textarea
            className="w-full bg-surface border-2 border-border rounded-none px-4 py-2.5 text-sm text-foreground placeholder-foreground/25 focus:outline-none focus:border-[#FF4F00] transition-colors resize-none h-24 font-medium"
            placeholder="Tell us about yourself..."
            {...register('bio')}
          />
          {errors.bio?.message && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mt-1">{errors.bio.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowProfileModal(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="gap-2"
          >
            <Save className="w-4 h-4" /> Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
