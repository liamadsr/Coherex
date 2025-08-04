'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Bot, 
  Users, 
  Palette, 
  MessageSquare, 
  Brain, 
  Plug, 
  Code,
  BarChart3,
  Settings,
  Building,
  Shield,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores'

interface NavigationItem {
  name: string
  href: string
  icon: any
  badge?: string
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Agents',
    href: '/agents',
    icon: Bot,
    children: [
      { name: 'All Agents', href: '/agents', icon: Bot },
      { name: 'Create Agent', href: '/agents/new', icon: Bot },
    ]
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Users,
  },
  {
    name: 'Conversations',
    href: '/conversations',
    icon: MessageSquare,
  },
  {
    name: 'Builder',
    href: '/builder',
    icon: Palette,
  },
  {
    name: 'Channels',
    href: '/channels',
    icon: MessageSquare,
    children: [
      { name: 'Overview', href: '/channels', icon: MessageSquare },
      { name: 'Email', href: '/channels/email', icon: MessageSquare },
      { name: 'Slack', href: '/channels/slack', icon: MessageSquare },
      { name: 'Teams', href: '/channels/teams', icon: MessageSquare },
      { name: 'SMS', href: '/channels/sms', icon: MessageSquare },
      { name: 'Voice', href: '/channels/voice', icon: MessageSquare },
      { name: 'Web Chat', href: '/channels/web-chat', icon: MessageSquare },
    ]
  },
  {
    name: 'Knowledge',
    href: '/knowledge',
    icon: Brain,
    children: [
      { name: 'Overview', href: '/knowledge', icon: Brain },
      { name: 'Sources', href: '/knowledge/sources', icon: Brain },
      { name: 'Documents', href: '/knowledge/documents', icon: Brain },
      { name: 'Sync Status', href: '/knowledge/sync', icon: Brain },
      { name: 'Search', href: '/knowledge/search', icon: Brain },
    ]
  },
  {
    name: 'Integrations',
    href: '/integrations',
    icon: Plug,
    children: [
      { name: 'Marketplace', href: '/integrations', icon: Plug },
      { name: 'Connected', href: '/integrations/connected', icon: Plug },
      { name: 'Enterprise', href: '/integrations/enterprise', icon: Plug },
      { name: 'Custom', href: '/integrations/custom', icon: Plug },
    ]
  },
  {
    name: 'MCP',
    href: '/mcp',
    icon: Code,
    badge: 'New',
  },
  {
    name: 'Code Execution',
    href: '/code-execution',
    icon: Code,
    badge: 'Beta',
    children: [
      { name: 'Overview', href: '/code-execution', icon: Code },
      { name: 'Environments', href: '/code-execution/environments', icon: Code },
      { name: 'Security', href: '/code-execution/security', icon: Code },
      { name: 'Logs', href: '/code-execution/logs', icon: Code },
    ]
  },
  {
    name: 'Evaluation',
    href: '/evaluation',
    icon: BarChart3,
    badge: 'New',
    children: [
      { name: 'Dashboard', href: '/evaluation', icon: BarChart3 },
      { name: 'Agents', href: '/evaluation/agents', icon: BarChart3 },
      { name: 'Reports', href: '/evaluation/reports', icon: BarChart3 },
      { name: 'Criteria', href: '/evaluation/criteria', icon: BarChart3 },
    ]
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    children: [
      { name: 'Overview', href: '/analytics', icon: BarChart3 },
      { name: 'Performance', href: '/analytics/performance', icon: BarChart3 },
      { name: 'Usage', href: '/analytics/usage', icon: BarChart3 },
      { name: 'Costs', href: '/analytics/costs', icon: BarChart3 },
      { name: 'ROI', href: '/analytics/roi', icon: BarChart3 },
    ]
  },
]

const bottomNavigation: NavigationItem[] = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      { name: 'Profile', href: '/settings/profile', icon: Settings },
      { name: 'Notifications', href: '/settings/notifications', icon: Settings },
      { name: 'Security', href: '/settings/security', icon: Settings },
    ]
  },
  {
    name: 'Organization',
    href: '/organization',
    icon: Building,
    children: [
      { name: 'Overview', href: '/organization', icon: Building },
      { name: 'Members', href: '/organization/members', icon: Building },
      { name: 'Billing', href: '/organization/billing', icon: Building },
      { name: 'Compliance', href: '/organization/compliance', icon: Building },
      { name: 'Audit Logs', href: '/organization/audit', icon: Building },
    ]
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Shield,
    children: [
      { name: 'Platform', href: '/admin', icon: Shield },
      { name: 'Users', href: '/admin/users', icon: Shield },
      { name: 'Organizations', href: '/admin/organizations', icon: Shield },
      { name: 'System Health', href: '/admin/system', icon: Shield },
      { name: 'Feature Flags', href: '/admin/feature-flags', icon: Shield },
    ]
  },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isDesktop?: boolean
}

export function Sidebar({ isOpen, onToggle, isDesktop = false }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load expanded items from localStorage on mount (client-side only)
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-expanded-items')
      if (saved) {
        try {
          setExpandedItems(JSON.parse(saved))
        } catch (error) {
          // If parsing fails, start with empty array
          setExpandedItems([])
        }
      }
    }
  }, [mounted])

  // Auto-expand items that contain the current path (only on first visit or when needed)
  useEffect(() => {
    if (!mounted) return
    
    const allNavItems = [...navigation, ...bottomNavigation]
    
    for (const item of allNavItems) {
      if (item.children) {
        const hasActiveChild = item.children.some(child => {
          // Exact match for base routes
          if (child.href === pathname) return true
          // For nested routes, check if path starts with child href (but not for root paths)
          if (child.href !== '/' && pathname.startsWith(child.href + '/')) return true
          return false
        })
        
        if (hasActiveChild) {
          setExpandedItems(prev => {
            // Only add if not already expanded
            if (!prev.includes(item.name)) {
              const newItems = [...prev, item.name]
              // Save to localStorage (client-side only)
              if (typeof window !== 'undefined') {
                localStorage.setItem('sidebar-expanded-items', JSON.stringify(newItems))
              }
              return newItems
            }
            return prev
          })
        }
      }
    }
  }, [pathname, mounted]) // Include mounted to ensure localStorage is loaded first

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => {
      const newItems = prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
      
      // Save to localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-expanded-items', JSON.stringify(newItems))
      }
      return newItems
    })
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  const isExpanded = (name: string) => expandedItems.includes(name)

  const renderNavItem = (item: NavigationItem, level = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const expanded = isExpanded(item.name)
    const active = isActive(item.href)

    return (
      <div key={item.name}>
        <div
          className={cn(
            'group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            level > 0 && 'ml-4 px-2',
            active && !hasChildren
              ? 'bg-sidebar-primary/10 text-sidebar-primary'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            !isOpen && 'justify-center px-2',
            hasChildren && 'cursor-pointer'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.name)
            }
          }}
        >
          {hasChildren ? (
            <div className="flex items-center flex-1 min-w-0">
              <Icon className={cn(
                'flex-shrink-0 w-5 h-5',
                'text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground'
              )} />
              
              {isOpen && (
                <div className="flex items-center justify-between flex-1 ml-3 min-w-0">
                  <span className="truncate">{item.name}</span>
                  <div className="flex items-center space-x-1">
                    {item.badge && (
                      <Badge variant={item.badge === 'New' ? 'default' : 'secondary'} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href={item.href}
              className="flex items-center flex-1 min-w-0"
              onClick={() => !isDesktop && onToggle()}
            >
              <Icon className={cn(
                'flex-shrink-0 w-5 h-5',
                active ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground'
              )} />
              
              {isOpen && (
                <div className="flex items-center justify-between flex-1 ml-3 min-w-0">
                  <span className="truncate">{item.name}</span>
                  <div className="flex items-center space-x-1">
                    {item.badge && (
                      <Badge variant={item.badge === 'New' ? 'default' : 'secondary'} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Link>
          )}
        </div>

        <AnimatePresence>
          {hasChildren && expanded && isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children?.map(child => renderNavItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        style={{ width: isOpen ? 240 : 80 }}
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-gray-100 dark:bg-gray-950 transition-[width] duration-300 ease-in-out',
          'flex flex-col'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {isOpen && (
            <div className="flex items-center">
              <Image
                src="/images/coherex-Dark.png"
                alt="COHEREX Logo"
                width={32}
                height={32}
                className="mr-2"
              />
              <h1 className="text-xl font-bold text-sidebar-foreground">COHEREX</h1>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navigation.map(item => renderNavItem(item))}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-sidebar-border">
          <nav className="p-4 space-y-2">
            {bottomNavigation.map(item => renderNavItem(item))}
          </nav>
        </div>
      </div>
    </>
  )
}