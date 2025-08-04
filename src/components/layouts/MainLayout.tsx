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
  const marginLeft = isDesktop ? (sidebarCollapsed ? 80 : 240) : 0

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarIsOpen} 
        onToggle={toggleSidebar}
        isDesktop={isDesktop}
      />

      {/* Main content area */}
      <div 
        style={{ marginLeft }}
        className="flex flex-col h-screen overflow-hidden"
      >
        {/* Top bar */}
        <TopBar />

        {/* Breadcrumbs with toggle buttons */}
        <div className="flex items-center justify-between px-6 py-2 bg-gray-100 dark:bg-gray-950">
          <div className="flex items-center space-x-3">
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
        <div className="flex-1 flex overflow-hidden p-4 pt-0">
          {/* Page content with rounded corners */}
          <main className="flex-1 overflow-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
            <div className="p-4">
              {children}
            </div>
          </main>

          {/* AI Assistant Panel */}
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              aiAssistantOpen ? "w-96 ml-4" : "w-0"
            )}
          >
            <div className="h-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
              <AIAssistantPanel 
                isOpen={aiAssistantOpen}
              />
            </div>
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