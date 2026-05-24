'use server';

import { createClient } from '@/utils/supabase/server';
import { verifyRateLimit } from '@/lib/ratelimit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, redirectUrl } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!redirectUrl || typeof redirectUrl !== 'string') {
      return NextResponse.json(
        { error: 'Redirect URL is required' },
        { status: 400 }
      );
    }

    const { success } = await verifyRateLimit(email);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many magic link requests. Try again in a few moments.' },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to email',
    });
  } catch (error) {
    console.error('Magic link request error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
