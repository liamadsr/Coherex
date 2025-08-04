'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Breadcrumbs } from './Breadcrumbs'
import { Toaster } from '@/components/ui/sonner'
import { useUIStore } from '@/stores'
import { AIAssistantPanel } from '@/components/ai-assistant/AIAssistantPanel'
import { AIAssistantToggle } from '@/components/ai-assistant/AIAssistantToggle'
import { Button } from '@/components/ui/button'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
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
        <TopBar />

        {/* Breadcrumbs with toggle buttons */}
        <div className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
          <div className="flex items-center space-x-4">
            {/* Sidebar toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
            >
              {isDesktop ? (
                sidebarCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            <Breadcrumbs />
          </div>
          
          {/* AI Assistant toggle */}
          <AIAssistantToggle 
            onClick={toggleAIAssistant}
            isOpen={aiAssistantOpen}
          />
        </div>

        {/* Content area with AI Assistant */}
        <div className="flex-1 flex overflow-hidden">
          {/* Page content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>

          {/* AI Assistant Panel */}
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              aiAssistantOpen ? "w-96" : "w-0"
            )}
          >
            <AIAssistantPanel 
              isOpen={aiAssistantOpen}
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