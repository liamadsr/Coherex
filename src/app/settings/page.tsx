'use client'

import { useState } from 'react'
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
  Flag,
  Settings as SettingsIcon
} from 'lucide-react'

// Import all settings page components
import ProfileSettings from './profile/page'
import NotificationSettings from './notifications/page'
import OrganizationSettings from './organization/page'

interface SettingsItem {
  id: string
  label: string
  icon: any
  component: React.ComponentType
  category?: string
}

const settingsItems: SettingsItem[] = [
  // Personal Settings
  { id: 'profile', label: 'Your profile', icon: User, component: ProfileSettings },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
  { id: 'security', label: 'Security', icon: ShieldCheck, component: ProfileSettings }, // Placeholder
  
  // Organization Settings
  { id: 'organization', label: 'Organization', icon: Building2, component: OrganizationSettings, category: 'Organization' },
  { id: 'members', label: 'Members', icon: Users, component: ProfileSettings }, // Placeholder
  { id: 'billing', label: 'Billing', icon: CreditCard, component: ProfileSettings }, // Placeholder
  { id: 'compliance', label: 'Compliance', icon: FileCheck, component: ProfileSettings }, // Placeholder
  { id: 'audit', label: 'Audit Logs', icon: ScrollText, component: ProfileSettings }, // Placeholder
  
  // Admin Settings
  { id: 'platform', label: 'Platform', icon: Shield, component: ProfileSettings, category: 'Admin' },
  { id: 'admin-users', label: 'Users', icon: UserCog, component: ProfileSettings }, // Placeholder
  { id: 'organizations', label: 'Organizations', icon: Building, component: ProfileSettings }, // Placeholder
  { id: 'system', label: 'System Health', icon: Heart, component: ProfileSettings }, // Placeholder
  { id: 'features', label: 'Feature Flags', icon: Flag, component: ProfileSettings }, // Placeholder
]

export default function SettingsPage() {
  const [activeItem, setActiveItem] = useState('profile')
  
  const ActiveComponent = settingsItems.find(item => item.id === activeItem)?.component || ProfileSettings

  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-neutral-800 overflow-y-auto bg-white dark:bg-[#0c0c0c]">
        <div className="p-6">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <SettingsIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
        </div>

        <nav className="px-3 pb-6">
          <ul className="space-y-1">
            {settingsItems.map((item, index) => {
              // Add category header
              const showCategory = index === 0 || 
                (item.category && item.category !== settingsItems[index - 1]?.category)
              
              return (
                <li key={item.id}>
                  {showCategory && item.category && (
                    <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {item.category}
                    </h3>
                  )}
                  <button
                    onClick={() => setActiveItem(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left',
                      activeItem === item.id
                        ? 'bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <item.icon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      activeItem === item.id 
                        ? 'text-gray-700 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-500'
                    )} />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto bg-white dark:bg-[#0c0c0c]">
        <ActiveComponent />
      </div>
    </div>
  )
}