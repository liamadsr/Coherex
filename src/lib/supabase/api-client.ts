import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { NextRequest } from 'next/server'

/**
 * Create a Supabase client for API routes that respects user authentication
 * This client will have the user's session if they are logged in
 */
export async function createApiClient(request?: NextRequest) {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Create a server client that can read auth cookies
  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        async get(name: string) {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
        async set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookie setting errors can be ignored in API routes
          }
        },
        async remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Cookie removal errors can be ignored in API routes
          }
        },
      },
    }
  )

  // If request is provided, try to get session from Authorization header
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        // Set the session from the token
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: '', // Not needed for API calls
        })
      } catch (error) {
        console.error('Failed to set session from token:', error)
      }
    }
  }

  return supabase
}

/**
 * Create a Supabase service role client for admin operations
 * This bypasses RLS and should only be used for admin tasks
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Get the current user from the Supabase client
 */
export async function getCurrentUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Check if the current request is authenticated
 */
export async function isAuthenticated(request?: NextRequest) {
  const supabase = await createApiClient(request)
  const user = await getCurrentUser(supabase)
  return !!user
}

/**
 * Require authentication for an API route
 * Returns the authenticated Supabase client and user
 * Throws an error if not authenticated
 */
export async function requireAuth(request?: NextRequest) {
  const supabase = await createApiClient(request)
  const user = await getCurrentUser(supabase)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return { supabase, user }
}