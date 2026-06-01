import { ShieldX } from 'lucide-react';
import { SignOutButton } from './sign-out-button';

export const metadata = {
  title: 'No access',
};

/**
 * Shown when an authenticated user is NOT a member of this deployment's
 * organization/app. They authenticated against the shared Supabase pool but
 * don't belong here — the membership gate (services/auth-guard.ts) sends them
 * here instead of into the dashboard.
 */
export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-muted">
          <ShieldX className="size-7 text-destructive" />
        </div>

        <h1 className="text-xl font-semibold text-foreground">
          You don&apos;t have access to this site
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your account isn&apos;t a member of this organization. If you manage a
          different site, sign in there instead. If you believe this is a
          mistake, contact your administrator to be invited.
        </p>

        <div className="mt-8 flex justify-center">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
