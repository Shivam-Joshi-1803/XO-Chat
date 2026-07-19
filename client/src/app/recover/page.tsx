import type { Metadata } from 'next';
import { RecoveryForm } from '@/components/auth/RecoveryForm';

export const metadata: Metadata = {
  title: 'Recover Account — XOChat',
  description: 'Recover your XOChat identity using your recovery key.',
};

export default function RecoverPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <RecoveryForm />
    </main>
  );
}
