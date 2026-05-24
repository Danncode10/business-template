'use server';

import { createClient } from '@/utils/supabase/server';

export async function requestMagicLink(email: string, redirectUrl: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) throw error;
  return { success: true, message: 'Magic link sent to email' };
}

export async function verifyMagicLink(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    token,
    type: 'recovery',
  });

  if (error) throw error;
  return data;
}

export async function setPasswordAfterMagicLink(password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw error;
  return { success: true };
}

export async function sendTeamInvitation(email: string, organizationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Only admins can invite team members');
  }

  const magicLinkUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/magic-link-verify?email=${encodeURIComponent(email)}&org=${encodeURIComponent(organizationId)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: magicLinkUrl,
      data: {
        organizationId,
        isInvitation: true,
      },
    },
  });

  if (error) throw error;
  return { success: true, message: `Invitation sent to ${email}` };
}
