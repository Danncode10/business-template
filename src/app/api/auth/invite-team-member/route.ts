'use server';

import { createClient } from '@/utils/supabase/server';
import { verifyRateLimit } from '@/lib/ratelimit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, organizationId } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!organizationId || typeof organizationId !== 'string') {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { success } = await verifyRateLimit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many invitations. Try again in a few moments.' },
        { status: 429 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can invite team members' },
        { status: 403 }
      );
    }

    const magicLinkUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/magic-link-verify?email=${encodeURIComponent(email)}&org=${encodeURIComponent(organizationId)}`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: magicLinkUrl,
        data: {
          organizationId,
          isInvitation: true,
        },
      },
    });

    if (otpError) {
      return NextResponse.json(
        { error: otpError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    console.error('Team member invitation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
