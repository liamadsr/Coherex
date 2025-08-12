'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { FcGoogle } from 'react-icons/fc'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const handleOAuthCallback = useCallback(async () => {
    console.log('Processing OAuth callback...')
    setIsProcessingAuth(true)
    
    try {
      // Wait a moment for Supabase to process the tokens
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('Session check:', { session, error })
      
      if (error) {
        console.error('Session error:', error)
        toast.error('Authentication failed: ' + error.message)
        setIsProcessingAuth(false)
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname)
        return
      }
      
      if (session) {
        console.log('Session established, redirecting to dashboard...')
        toast.success('Successfully signed in!')
        // Use window.location for a full page refresh to ensure middleware runs
        window.location.href = '/dashboard'
      } else {
        console.log('No session found after OAuth callback')
        setIsProcessingAuth(false)
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname)
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      toast.error('Authentication failed')
      setIsProcessingAuth(false)
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [supabase])

  useEffect(() => {
    // Check if we have tokens in the URL hash (implicit flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const errorParam = hashParams.get('error')
    
    console.log('URL hash check:', { 
      hasHash: window.location.hash.length > 1,
      hasAccessToken: !!accessToken,
      hasError: !!errorParam 
    })
    
    if (errorParam) {
      const errorDescription = hashParams.get('error_description')
      console.error('OAuth error:', errorParam, errorDescription)
      toast.error(errorDescription || 'Authentication failed')
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname)
      return
    }
    
    if (accessToken) {
      // We have tokens from OAuth callback
      handleOAuthCallback()
    } else {
      // Check if user is already logged in
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('User already logged in, redirecting...')
          router.push('/dashboard')
        }
      })
    }
  }, [handleOAuthCallback, router, supabase])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error

      // The user will be redirected to Google for authentication
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      toast.error(error.message || 'Failed to sign in with Google')
      setIsLoading(false)
    }
  }

  if (isProcessingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Completing sign in...
            </CardTitle>
            <CardDescription>
              Please wait while we set up your session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="w-32 h-1 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to Coherex</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your AI agents and start building
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 relative"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {!isLoading && <FcGoogle className="w-5 h-5 absolute left-4" />}
            {isLoading ? 'Redirecting to Google...' : 'Continue with Google'}
          </Button>

          <p className="text-xs text-center text-muted-foreground px-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}