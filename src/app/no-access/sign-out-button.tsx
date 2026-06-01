'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/services/auth';
import { Loader2, LogOut } from 'lucide-react';

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch {
      // Ignore — we redirect to login regardless.
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      Sign in with a different account
    </button>
  );
}
