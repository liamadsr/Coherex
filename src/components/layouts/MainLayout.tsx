'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Breadcrumbs } from './Breadcrumbs'
import { Toaster } from '@/components/ui/sonner'
import { useUIStore } from '@/stores'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen, toggleSidebar: toggleSidebarStore } = useUIStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024
      setIsDesktop(desktop)
      if (!desktop) {
        // On mobile, close sidebar and reset collapsed state
        setSidebarOpen(false)
        setSidebarCollapsed(false)
      }
    }

    // Initial check
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  const toggleSidebar = () => {
    if (isDesktop) {
      setSidebarCollapsed(!sidebarCollapsed)
    } else {
      toggleSidebarStore()
    }
  }

  const sidebarIsOpen = isDesktop ? !sidebarCollapsed : sidebarOpen
  const marginLeft = isDesktop ? (sidebarCollapsed ? 80 : 280) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarIsOpen} 
        onToggle={toggleSidebar}
        isDesktop={isDesktop}
      />

      {/* Main content area */}
      <div 
        style={{ marginLeft }}
        className="flex flex-col min-h-screen transition-[margin-left] duration-300 ease-in-out"
      >
        {/* Top bar */}
        <TopBar 
          onSidebarToggle={toggleSidebar} 
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          isDesktop={isDesktop}
        />

        {/* Breadcrumbs */}
        <div className="px-6 py-4 bg-background border-b border-border">
          <Breadcrumbs />
        </div>

        {/* Main content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'bg-card border border-border',
        }}
      />
    </div>
  )
}