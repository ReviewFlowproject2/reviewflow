import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip if env vars not configured (dev stage)
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Persist cookies for 7 days
          const cookieOptions = {
            ...options,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
            sameSite: 'lax' as const,
          }
          request.cookies.set({ name, value, ...cookieOptions })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...cookieOptions })
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions = {
            ...options,
            path: '/',
            maxAge: 0,
          }
          request.cookies.set({ name, value: '', ...cookieOptions })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...cookieOptions })
        },
      },
    }
  )

  // Refresh session if it exists
  const { data: { session } } = await supabase.auth.getSession()

  // If user is logged in and tries to access login/register, redirect to dashboard
  if (session) {
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
