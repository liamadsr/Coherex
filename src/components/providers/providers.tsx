'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/auth-context'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeColorMeta } from '@/components/theme-color-meta'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeColorMeta />
      <QueryProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}