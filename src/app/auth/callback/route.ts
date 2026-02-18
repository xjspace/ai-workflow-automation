import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is a password recovery flow
      if (type === 'recovery') {
        // Redirect to reset password page
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }

      // Successful login, redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Login failed, redirect to login page with error
  return NextResponse.redirect(`${origin}/auth/login?error=oauth_callback_failed`);
}
