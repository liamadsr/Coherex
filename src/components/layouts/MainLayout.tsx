'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Breadcrumbs } from './Breadcrumbs'
import { Toaster } from '@/components/ui/sonner'
import { useUIStore } from '@/stores'
import { AIAssistantPanel } from '@/components/ai-assistant/AIAssistantPanel'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, setSidebarOpen, toggleSidebar: toggleSidebarStore, aiAssistantOpen, toggleAIAssistant } = useUIStore()
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
        className="flex flex-col min-h-screen"
      >
        {/* Top bar */}
        <TopBar 
          onSidebarToggle={toggleSidebar} 
          onAIAssistantToggle={toggleAIAssistant}
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          isDesktop={isDesktop}
          aiAssistantOpen={aiAssistantOpen}
        />

        {/* Breadcrumbs */}
        <div className="px-6 py-4 bg-background border-b border-border">
          <Breadcrumbs />
        </div>

        {/* Content area with AI Assistant */}
        <div className="flex-1 flex relative">
          {/* Page content with padding for AI panel */}
          <main className="flex-1">
            <div className={cn(
              "h-full transition-all duration-300",
              aiAssistantOpen ? "mr-96" : "mr-0"
            )}>
              {children}
            </div>
          </main>

          {/* AI Assistant Panel - Fixed position */}
          <div
            className={cn(
              "fixed right-0 transition-all duration-300 z-40",
              aiAssistantOpen ? "w-96" : "w-0"
            )}
            style={{ 
              top: 'calc(57px + 65px)',  // TopBar height + Breadcrumbs height
              height: 'calc(100vh - 57px - 65px)'
            }}
          >
            <AIAssistantPanel 
              isOpen={aiAssistantOpen}
              onClose={toggleAIAssistant}
            />
          </div>
        </div>
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