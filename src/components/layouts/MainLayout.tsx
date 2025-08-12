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
  
  // Default to desktop view on server to prevent hydration mismatch
  const [isDesktop, setIsDesktop] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Default to collapsed
  const [isHydrated, setIsHydrated] = useState(false)

  // Load client-side state after hydration
  useEffect(() => {
    setIsHydrated(true)
    
    // Load saved sidebar state
    const saved = localStorage.getItem('sidebar-collapsed')
    setSidebarCollapsed(saved === 'true')
    
    // Check desktop state
    const desktop = window.innerWidth >= 1024
    setIsDesktop(desktop)
    if (!desktop) {
      setSidebarOpen(false)
      setSidebarCollapsed(false)
    }
  }, [])

  // Handle responsive sidebar behavior
  useEffect(() => {
    if (!isHydrated) return

    const handleResize = () => {
      const desktop = window.innerWidth >= 1024
      setIsDesktop(desktop)
      if (!desktop) {
        // On mobile, close sidebar and reset collapsed state
        setSidebarOpen(false)
        setSidebarCollapsed(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isHydrated])


  const toggleSidebar = () => {
    if (isDesktop) {
      const newCollapsed = !sidebarCollapsed
      setSidebarCollapsed(newCollapsed)
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-collapsed', String(newCollapsed))
      }
    } else {
      toggleSidebarStore()
    }
  }

  const sidebarIsOpen = isDesktop ? !sidebarCollapsed : sidebarOpen
  const marginLeft = isDesktop ? (sidebarCollapsed ? 60 : 240) : 0

  // Use suppressHydrationWarning on the main wrapper to prevent hydration warnings
  // This is safe because we handle the state properly after hydration
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950" suppressHydrationWarning>
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarIsOpen} 
        onToggle={toggleSidebar}
        isDesktop={isDesktop}
      />

      {/* Main content area */}
      <div 
        style={{ marginLeft, width: `calc(100% - ${marginLeft}px)` }}
        className="fixed top-0 right-0 flex flex-col h-screen overflow-hidden"
        suppressHydrationWarning
      >
        {/* Top bar */}
        <TopBar />

        {/* Breadcrumbs with toggle buttons */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-gray-100 dark:bg-neutral-950">
          <div className="flex items-center space-x-2.5">
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
        <div className="flex-1 flex overflow-hidden p-2 pt-0">
          {/* Page content with rounded corners */}
          <main className="flex-1 overflow-auto bg-white dark:bg-[#0c0c0c] rounded-2xl shadow-sm">
            <div className="p-4">
              {children}
            </div>
          </main>

          {/* AI Assistant Panel */}
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              aiAssistantOpen ? "w-96 ml-2" : "w-0"
            )}
          >
            <div className="h-full bg-white dark:bg-[#0c0c0c] rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <AIAssistantPanel 
                isOpen={aiAssistantOpen}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: 'bg-card border border-border',
        }}
      />
    </div>
  )
}