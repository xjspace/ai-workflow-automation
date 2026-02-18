import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    if (!supabaseInstance) {
      supabaseInstance = createClient(getSupabaseUrl(), getSupabaseAnonKey());
    }
    return supabaseInstance[prop as keyof SupabaseClient];
  }
});

// 服务端客户端（需要 service role key）
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
