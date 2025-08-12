import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',  // Landing page
  '/login',
  '/signup',
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
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
  
  // Get the authentication token from cookies
  const authToken = request.cookies.get('auth-token')?.value
  
  // For this mock implementation, we'll check localStorage auth state
  // In a real app, you'd validate the JWT token server-side
  const isAuthenticated = !!authToken
  
  // Skip middleware for static assets and Next.js internals
  if (isStaticAsset || isNextInternal) {
    return NextResponse.next()
  }
  
  // Block dev-only routes in production
  const isDevRoute = devOnlyRoutes.some(route => pathname.startsWith(route))
  if (isDevRoute && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Redirect authenticated users away from auth pages (but not from landing page)
  if (isAuthenticated && isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // All routes are protected by default - redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute) {
    // Store the attempted URL to redirect after login
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Allow the request to continue
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}