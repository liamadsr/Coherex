'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface AuthState {
  user: SupabaseUser | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  })
  const [supabase] = useState(() => createSupabaseBrowserClient())

  // Initialize auth state and set up listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isAuthenticated: !!session,
        isLoading: false,
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isAuthenticated: !!session,
        isLoading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
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

      // User will be redirected to Google for authentication
    } catch (error: any) {
      console.error('Google sign in error:', error)
      toast.error(error.message || 'Failed to sign in with Google')
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Clear auth state immediately for better UX
      setAuthState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      })
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear any remaining localStorage items
      if (typeof window !== 'undefined') {
        // Clear all Supabase-related localStorage keys
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.startsWith('sb-') || key.includes('supabase')
        )
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }

      toast.success('Signed out successfully')
      router.push('/auth/login')
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
      // Even on error, redirect to login
      router.push('/auth/login')
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error

      setAuthState({
        user: data.user,
        session: data.session,
        isAuthenticated: !!data.session,
        isLoading: false,
      })
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signInWithGoogle,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}