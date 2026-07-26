'use client';
import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';

export function AuthRedirect() {
  const { fetchUser, isAuthenticated, isLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/chat');
    }
  }, [isAuthenticated, isLoading, router]);

  return null;
}
