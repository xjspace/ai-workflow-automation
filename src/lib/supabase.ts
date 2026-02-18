import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 浏览器端客户端（单例模式）
let browserClient: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    if (typeof window !== 'undefined') {
      if (!browserClient) {
        browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
      }
      return browserClient[prop as keyof SupabaseClient];
    }
    // 服务端访问时返回空操作
    return () => Promise.resolve({ data: null, error: new Error('Server-side access') });
  }
});

/**
 * API 路由客户端（用于 API Routes）
 * 支持通过 Authorization header 的 Bearer token 认证
 */
export const createSupabaseApiClient = (authToken?: string): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: authToken ? {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    } : {},
  });
};

/**
 * 服务端客户端（用于 Server Components 和 Server Actions）
 * 使用 cookies 进行会话管理
 */
export const createSupabaseServerClient = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component 中调用时可能会失败，这是预期行为
        }
      },
    },
  });
};

/**
 * Admin 客户端（需要 service role key，绕过 RLS）
 * 仅用于需要管理员权限的操作
 */
export const createSupabaseAdminClient = async () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// 向后兼容：重导出旧名称
export { createSupabaseApiClient as createServerClient };
