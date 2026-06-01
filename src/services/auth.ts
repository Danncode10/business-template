'use client';

import { createClient } from '@/utils/supabase/client';

/**
 * Auth Service (Client-side)
 * Strictly contains all business logic and Supabase queries for authentication.
 * Rate limiting checks must be performed via server actions before calling these functions.
 */

export async function signInWithEmail(email: string, password: string) {
  const client = createClient();
  
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) throw signInError;

  // Check if MFA is required
  const { data: mfaData, error: mfaError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();

  if (mfaError) throw mfaError;

  if (mfaData.nextLevel === 'aal2' && mfaData.nextLevel !== mfaData.currentLevel) {
    return { success: true, requiresMFA: true };
  }

  return { success: true, requiresMFA: false };
}

// Public sign-up is OFF by default: this is a multi-tenant admin app, accounts
// are provisioned by invite. Set NEXT_PUBLIC_ALLOW_PUBLIC_SIGNUP=true only on a
// deployment that genuinely wants open registration.
const PUBLIC_SIGNUP_ENABLED =
  process.env.NEXT_PUBLIC_ALLOW_PUBLIC_SIGNUP === 'true';

export async function signUpWithEmail(email: string, password: string) {
  if (!PUBLIC_SIGNUP_ENABLED) {
    throw new Error('Public sign-up is disabled. Ask your administrator for an invite.');
  }
  const client = createClient();
  const { error } = await client.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return { success: true };
}

export async function signOut() {
  const client = createClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
  return { success: true };
}

export async function forgotPassword(email: string) {
  const client = createClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return { success: true };
}

export async function resetPassword(password: string) {
  const client = createClient();
  const { error } = await client.auth.updateUser({
    password: password,
  });
  if (error) throw error;
  return { success: true };
}

export async function updatePassword(password: string, currentPassword?: string) {
  const client = createClient();

  if (currentPassword) {
    // 1. Get current user email
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user?.email) throw new Error('Authentication required');

    // 2. Silent re-auth
    const { error: reAuthError } = await client.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (reAuthError) {
      throw new Error('Incorrect current password');
    }
  }

  // 3. Procceed with update
  const { error } = await client.auth.updateUser({
    password: password,
  });
  
  if (error) throw error;
  return { success: true };
}
