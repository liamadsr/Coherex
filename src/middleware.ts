import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',  // Landing page
  '/auth/login',
  '/auth/callback',
  '/auth/signup',
  '/forgot-password',
  '/verify-email',
  '/reset-password',
  '/api/waitlist',  // API routes for landing page
]

// Development/Test routes that should only be accessible in development
const devOnlyRoutes = [
  '/test-auth',
  '/clear-storage',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Update Supabase session (this refreshes auth tokens if needed)
  let response = NextResponse.next()
  
  // Create Supabase client for middleware
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
  
  // Refresh session if expired
  await supabase.auth.getUser()
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => {
    // Exact match for root path
    if (route === '/' && pathname === '/') return true
    // For other routes, check if pathname starts with route
    if (route !== '/' && pathname.startsWith(route)) return true
    return false
  })
  
  // Static assets and Next.js internals are always allowed
  const isStaticAsset = pathname.includes('.')
  const isNextInternal = pathname.startsWith('/_next')
  
  // Check if user is authenticated using Supabase auth
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user
  
  // Skip middleware for static assets and Next.js internals
  if (isStaticAsset || isNextInternal) {
    return response
  }
  
  // Redirect /login to /auth/login for convenience
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Block dev-only routes in production
  const isDevRoute = devOnlyRoutes.some(route => pathname.startsWith(route))
  if (isDevRoute && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Redirect authenticated users away from auth pages (but not from landing page or callback)
  if (isAuthenticated && isPublicRoute && pathname !== '/' && pathname !== '/auth/callback') {
    // If there's a 'from' parameter, redirect there instead of dashboard
    const from = request.nextUrl.searchParams.get('from')
    const redirectTo = from && from !== '/auth/login' ? from : '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }
  
  // All routes are protected by default - redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute) {
    // Store the attempted URL to redirect after login
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Return the response with updated session
  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Note: We DO want to run on API routes for session handling
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}