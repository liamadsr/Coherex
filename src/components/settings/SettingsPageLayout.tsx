'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  User,
  Bell,
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  FileCheck,
  ScrollText,
  Shield,
  UserCog,
  Building,
  Heart,
  Flag
} from 'lucide-react'

interface SettingsSection {
  title: string
  items: {
    name: string
    href: string
    icon: any
    description?: string
  }[]
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Personal',
    items: [
      {
        name: 'Profile',
        href: '/settings/profile',
        icon: User,
        description: 'Manage your personal information'
      },
      {
        name: 'Notifications',
        href: '/settings/notifications',
        icon: Bell,
        description: 'Configure notification preferences'
      },
      {
        name: 'Security',
        href: '/settings/security',
        icon: ShieldCheck,
        description: 'Security and authentication settings'
      }
    ]
  },
  {
    title: 'Organization',
    items: [
      {
        name: 'Overview',
        href: '/settings/organization',
        icon: Building2,
        description: 'Organization details and settings'
      },
      {
        name: 'Members',
        href: '/settings/organization/members',
        icon: Users,
        description: 'Manage team members and permissions'
      },
      {
        name: 'Billing',
        href: '/settings/organization/billing',
        icon: CreditCard,
        description: 'Billing and subscription management'
      },
      {
        name: 'Compliance',
        href: '/settings/organization/compliance',
        icon: FileCheck,
        description: 'Compliance and regulatory settings'
      },
      {
        name: 'Audit Logs',
        href: '/settings/organization/audit',
        icon: ScrollText,
        description: 'View activity and audit logs'
      }
    ]
  },
  {
    title: 'Admin',
    items: [
      {
        name: 'Platform',
        href: '/settings/admin',
        icon: Shield,
        description: 'Platform-wide settings'
      },
      {
        name: 'Users',
        href: '/settings/admin/users',
        icon: UserCog,
        description: 'Manage all platform users'
      },
      {
        name: 'Organizations',
        href: '/settings/admin/organizations',
        icon: Building,
        description: 'Manage all organizations'
      },
      {
        name: 'System Health',
        href: '/settings/admin/system',
        icon: Heart,
        description: 'Monitor system health and performance'
      },
      {
        name: 'Feature Flags',
        href: '/settings/admin/feature-flags',
        icon: Flag,
        description: 'Manage feature flags and rollouts'
      }
    ]
  }
]

interface SettingsPageLayoutProps {
  children: React.ReactNode
}

export function SettingsPageLayout({ children }: SettingsPageLayoutProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex gap-8">
        {/* Settings Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your preferences</p>
          </div>

          <nav className="space-y-6">
            {settingsSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                          active
                            ? 'bg-gray-100 dark:bg-neutral-900 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        <Icon className={cn(
                          'w-4 h-4 mr-3',
                          active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                        )} />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}