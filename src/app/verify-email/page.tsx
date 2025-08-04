'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react'

import { AuthLayout } from '@/components/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { delay } from '@/mock-data'
import { toast } from 'sonner'

type VerificationState = 'loading' | 'success' | 'error' | 'expired'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationState, setVerificationState] = useState<VerificationState>('loading')
  const [isResending, setIsResending] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationState('error')
        return
      }

      try {
        // Simulate verification API call
        await delay(2000)
        
        // Mock verification logic
        if (token === 'invalid') {
          setVerificationState('error')
        } else if (token === 'expired') {
          setVerificationState('expired')
        } else {
          setVerificationState('success')
          
          // Auto-redirect to dashboard after success
          setTimeout(() => {
            toast.success('Email verified! Redirecting to dashboard...')
            router.push('/dashboard')
          }, 3000)
        }
      } catch (err) {
        setVerificationState('error')
      }
    }

    verifyEmail()
  }, [token, router])

  const resendVerification = async () => {
    setIsResending(true)
    try {
      await delay(1000)
      toast.success('Verification email sent!')
    } catch (err) {
      toast.error('Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (verificationState) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Verifying your email...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Email verified successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your email has been verified. You can now access all features of Blockwork.
              </p>
              {email && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Verified email: <strong>{email}</strong>
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Continue to Dashboard
              </Button>

              <div className="text-xs text-gray-500 dark:text-gray-500">
                You will be redirected automatically in a few seconds...
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Welcome to Blockwork! Your account is now fully activated and ready to use.
              </AlertDescription>
            </Alert>
          </motion.div>
        )

      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto">
              <RefreshCw className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Verification link expired
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The verification link has expired. Please request a new one to verify your email.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending new link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send new verification link
                  </>
                )}
              </Button>

              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        )

      case 'error':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Verification failed
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We couldn't verify your email. The link may be invalid or expired.
              </p>
            </div>

            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {!token 
                  ? 'No verification token provided.' 
                  : 'Invalid or malformed verification token.'
                }
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending new link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Request new verification link
                  </>
                )}
              </Button>

              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Create New Account
                </Button>
              </Link>

              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        )
    }
  }

  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Confirming your email address"
    >
      {renderContent()}
    </AuthLayout>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Verifying..." subtitle="Please wait while we verify your email">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}