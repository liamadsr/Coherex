'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-8">
                <Image
                  src="/images/coherex-Dark.png"
                  alt="COHEREX Logo"
                  width={48}
                  height={48}
                  className="mr-4"
                />
                <h1 className="text-3xl font-bold text-white">COHEREX</h1>
              </div>
              
              <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                The Future of
                <br />
                <span className="text-white">
                  AI Workforce
                </span>
              </h2>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Create, orchestrate, and manage AI agents that work together as digital employees, 
                transforming how your organization operates.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-white rounded-full mr-3" />
                  <span>Conversational agent creation with Orchestrator AI</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-white rounded-full mr-3" />
                  <span>Real-time collaboration and team formation</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-white rounded-full mr-3" />
                  <span>Advanced evaluation and quality monitoring</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg" />
          <div className="absolute top-1/2 right-20 w-16 h-16 bg-purple-300/20 rounded-full blur-md" />
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
          {/* Back to home link */}
          <Link href="/" className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
          
          <div className="mx-auto w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <Image
                src="/images/coherex-Dark.png"
                alt="COHEREX Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">COHEREX</h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>

              {children}

              {/* Footer */}
              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                By continuing, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Privacy Policy
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}