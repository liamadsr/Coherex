import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/verify-email',
  '/reset-password',
]

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/agents',
  '/conversations',
  '/knowledge',
  '/evaluations',
  '/integrations',
  '/team',
  '/settings',
  '/analytics',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Get the authentication token from cookies
  const authToken = request.cookies.get('auth-token')?.value
  
  // For this mock implementation, we'll check localStorage auth state
  // In a real app, you'd validate the JWT token server-side
  const isAuthenticated = !!authToken
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Redirect unauthenticated users to login
  if (!isAuthenticated && isProtectedRoute) {
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