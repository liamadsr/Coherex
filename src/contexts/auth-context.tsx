'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, Organization } from '@/types'
import { mockApi } from '@/mock-data'
import { toast } from 'sonner'
import { getSafeRedirectUrl } from '@/lib/utils/url-validator'

interface AuthState {
  user: User | null
  organization: Organization | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

interface SignupData {
  firstName: string
  lastName: string
  email: string
  password: string
  organizationName: string
  role: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    organization: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would check for a valid session/token
        const storedAuth = localStorage.getItem('coherex-auth')
        if (storedAuth) {
          const { user, organization } = JSON.parse(storedAuth)
          
          // Validate that user and organization exist and have required properties
          if (!user || !user.id || !organization) {
            console.warn('Invalid stored auth data, clearing...')
            localStorage.removeItem('coherex-auth')
            setAuthState(prev => ({ ...prev, isLoading: false }))
            return
          }
          
          // Re-set the auth cookie if we have stored auth
          document.cookie = `auth-token=mock-token-${user.id}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
          
          setAuthState({
            user,
            organization,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await mockApi.login(email, password)
      
      if (response.success && response.data) {
        const { user, organization } = response.data
        
        // Store auth data
        localStorage.setItem('coherex-auth', JSON.stringify({ user, organization }))
        
        // Set auth cookie for middleware (in a real app, this would be an httpOnly cookie set by the server)
        document.cookie = `auth-token=mock-token-${user.id}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
        
        setAuthState({
          user,
          organization,
          isAuthenticated: true,
          isLoading: false,
        })

        toast.success('Welcome back!')
        
        // Check for redirect URL in query params and validate it
        const searchParams = new URLSearchParams(window.location.search)
        const from = searchParams.get('from')
        const redirectTo = getSafeRedirectUrl(from, '/dashboard')
        router.push(redirectTo)
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Invalid email or password')
      throw error
    }
  }, [router])

  const signup = useCallback(async (data: SignupData) => {
    try {
      const response = await mockApi.signup(data)
      
      if (response.success && response.data) {
        const { user, organization } = response.data
        
        // Store auth data
        localStorage.setItem('coherex-auth', JSON.stringify({ user, organization }))
        
        // Set auth cookie for middleware (in a real app, this would be an httpOnly cookie set by the server)
        document.cookie = `auth-token=mock-token-${user.id}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
        
        setAuthState({
          user,
          organization,
          isAuthenticated: true,
          isLoading: false,
        })

        toast.success('Account created successfully!')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Signup failed:', error)
      toast.error('Failed to create account')
      throw error
    }
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem('coherex-auth')
    
    // Clear auth cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    
    setAuthState({
      user: null,
      organization: null,
      isAuthenticated: false,
      isLoading: false,
    })
    router.push('/login')
    toast.success('Logged out successfully')
  }, [router])

  const updateUser = useCallback((user: User) => {
    setAuthState(prev => {
      const newState = { ...prev, user }
      localStorage.setItem('coherex-auth', JSON.stringify({ 
        user, 
        organization: prev.organization 
      }))
      return newState
    })
  }, [])

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}