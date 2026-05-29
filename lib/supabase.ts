import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// ========== 服务端（API Routes） ==========
let _adminClient: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Check .env.local and restart npm run dev.'
      )
    }

    _adminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _adminClient
}

// 兼容旧代码（延迟初始化）
export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabaseAdmin()
    return client[prop as keyof typeof client]
  }
})

// ========== 客户端（浏览器） ==========
let _browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserClient() {
  if (!_browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Check .env.local and restart npm run dev.'
      )
    }

    _browserClient = createBrowserClient(url, key)
  }
  return _browserClient
}

// 兼容旧代码
try {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    _browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
} catch (e) {
  // 静默失败
}

export { _browserClient as createClientBrowser }

// Type helpers for database tables
export type DbTable = 'businesses' | 'patients' | 'reviews' | 'sms_logs'
export type DbInsert<T extends DbTable> = any
export type DbUpdate<T extends DbTable> = any
export type DbRow<T extends DbTable> = any
