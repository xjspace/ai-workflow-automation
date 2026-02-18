import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 成功登录，重定向到 dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // 登录失败，重定向到登录页面
  return NextResponse.redirect(`${origin}/auth/login?error=oauth_callback_failed`);
}
