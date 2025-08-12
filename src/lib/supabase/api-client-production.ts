import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from './types'

/**
 * Production-ready Supabase client for API routes
 * Uses the official Supabase SSR package for secure cookie handling
 */
export async function createApiClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        async remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create client for Route Handlers with proper cookie handling
 * This is the recommended approach for Next.js API routes
 */
export async function createRouteHandlerClient(request: NextRequest) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return request.cookies.get(name)?.value
        },
        async set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          // Note: In app route handlers, cookies are automatically included in the response
        },
        async remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  return { supabase }
}

/**
 * Service role client - bypasses RLS, use sparingly
 * Only for admin operations that need to bypass security
 * Note: This should only be used in API routes, not in middleware
 */
export async function createServiceRoleClient() {
  // Dynamic import to avoid Edge Runtime issues
  const { createClient } = await import('@supabase/supabase-js')
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Middleware helper for refreshing sessions
 * Add this to your middleware.ts file
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return request.cookies.get(name)?.value
        },
        async set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        async remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser()

  return response
}

/**
 * Get user with proper error handling
 */
export async function getUser(supabase: any) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching user:', error.message)
    return null
  }

  return user
}

/**
 * Protect API route - returns user or throws
 */
export async function requireUser(supabase: any) {
  const user = await getUser(supabase)
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}