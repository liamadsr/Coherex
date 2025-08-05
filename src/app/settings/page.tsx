'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Flag,
  ArrowRight
} from 'lucide-react'

const settingsCards = [
  {
    category: 'Personal',
    items: [
      {
        title: 'Profile',
        description: 'Update your personal information, avatar, and preferences',
        icon: User,
        href: '/settings/profile',
        color: 'blue'
      },
      {
        title: 'Notifications',
        description: 'Configure how and when you receive notifications',
        icon: Bell,
        href: '/settings/notifications',
        color: 'yellow'
      },
      {
        title: 'Security',
        description: 'Manage your password, two-factor authentication, and sessions',
        icon: ShieldCheck,
        href: '/settings/security',
        color: 'green'
      }
    ]
  },
  {
    category: 'Organization',
    items: [
      {
        title: 'Overview',
        description: 'View and manage your organization details',
        icon: Building2,
        href: '/settings/organization',
        color: 'purple'
      },
      {
        title: 'Members',
        description: 'Manage team members, roles, and permissions',
        icon: Users,
        href: '/settings/organization/members',
        color: 'blue'
      },
      {
        title: 'Billing',
        description: 'View billing history and manage subscriptions',
        icon: CreditCard,
        href: '/settings/organization/billing',
        color: 'green'
      },
      {
        title: 'Compliance',
        description: 'Configure compliance and regulatory requirements',
        icon: FileCheck,
        href: '/settings/organization/compliance',
        color: 'orange'
      },
      {
        title: 'Audit Logs',
        description: 'Track activity and changes across your organization',
        icon: ScrollText,
        href: '/settings/organization/audit',
        color: 'gray'
      }
    ]
  },
  {
    category: 'Admin',
    items: [
      {
        title: 'Platform Settings',
        description: 'Configure platform-wide settings and policies',
        icon: Shield,
        href: '/settings/admin',
        color: 'red'
      },
      {
        title: 'User Management',
        description: 'Manage all users across the platform',
        icon: UserCog,
        href: '/settings/admin/users',
        color: 'purple'
      },
      {
        title: 'Organizations',
        description: 'Manage all organizations on the platform',
        icon: Building,
        href: '/settings/admin/organizations',
        color: 'blue'
      },
      {
        title: 'System Health',
        description: 'Monitor system performance and health metrics',
        icon: Heart,
        href: '/settings/admin/system',
        color: 'red'
      },
      {
        title: 'Feature Flags',
        description: 'Control feature rollouts and experiments',
        icon: Flag,
        href: '/settings/admin/feature-flags',
        color: 'yellow'
      }
    ]
  }
]

export default function SettingsPage() {
  const router = useRouter()

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account, organization, and platform settings
        </p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-8">
        {settingsCards.map((section) => (
          <div key={section.category}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <Card
                    key={item.href}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => router.push(item.href)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${getColorClasses(item.color)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}