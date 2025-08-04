'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Search,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  ExternalLink,
  MoreHorizontal,
  Unplug,
  Calendar,
  Zap
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Mock connected integrations data
const connectedIntegrations = [
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Customer service platform',
    icon: '🟢',
    category: 'customer-support',
    status: 'connected' as const,
    lastSync: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    config: {
      subdomain: 'coherex',
      apiKey: '•••••••••••••••k7f9',
      syncInterval: 300, // 5 minutes
    },
    metrics: {
      totalSynced: 1234,
      lastSyncItems: 45,
      errors: 0,
    }
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication platform',
    icon: '💜',
    category: 'communication',
    status: 'connected' as const,
    lastSync: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    config: {
      workspace: 'coherex.slack.com',
      channels: ['#support', '#general', '#sales'],
      token: '•••••••••••••••p3m2',
    },
    metrics: {
      totalSynced: 5678,
      lastSyncItems: 123,
      errors: 0,
    }
  },
  {
    id: 'email',
    name: 'Email',
    description: 'SMTP email integration',
    icon: '📧',
    category: 'communication',
    status: 'error' as const,
    lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    config: {
      smtp: 'smtp.gmail.com',
      port: 587,
      username: 'support@coherex.ai',
    },
    metrics: {
      totalSynced: 890,
      lastSyncItems: 0,
      errors: 3,
    },
    error: 'Authentication failed. Please check your credentials.'
  },
]

const statusIcons = {
  connected: CheckCircle,
  error: AlertCircle,
  syncing: RefreshCw,
  disconnected: Unplug,
}

const statusColors = {
  connected: 'text-green-600',
  error: 'text-red-600',
  syncing: 'text-blue-600',
  disconnected: 'text-gray-600',
}

export default function ConnectedIntegrationsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredIntegrations = connectedIntegrations.filter(integration =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDisconnect = (integrationId: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      toast.success('Integration disconnected')
      // In real app, would make API call
    }
  }

  const handleSync = (integrationId: string) => {
    toast.success('Sync started')
    // In real app, would trigger sync
  }

  const formatLastSync = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/integrations')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Connected Integrations</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your active integrations and connections
                </p>
              </div>
            </div>
            <Button onClick={() => router.push('/integrations')}>
              <Zap className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search connected integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Connected Integrations */}
        <div className="space-y-4">
          {filteredIntegrations.map(integration => {
            const StatusIcon = statusIcons[integration.status]
            const statusColor = statusColors[integration.status]

            return (
              <Card key={integration.id} className={cn(
                "hover:shadow-md transition-all duration-200",
                integration.status === 'error' && "border-red-500"
              )}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-3xl">
                        {integration.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={integration.status === 'connected' ? 'default' : 'destructive'}
                        className="capitalize"
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {integration.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/integrations/${integration.id}/settings`)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSync(integration.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Now
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDisconnect(integration.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {integration.error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 inline mr-2" />
                        {integration.error}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Last Sync */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Last Sync
                      </p>
                      <p className="font-medium">{formatLastSync(integration.lastSync)}</p>
                    </div>

                    {/* Total Synced */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        Total Synced
                      </p>
                      <p className="font-medium">{integration.metrics.totalSynced.toLocaleString()}</p>
                    </div>

                    {/* Last Sync Items */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Last Sync Items
                      </p>
                      <p className="font-medium">{integration.metrics.lastSyncItems.toLocaleString()}</p>
                    </div>

                    {/* Errors */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Errors
                      </p>
                      <p className={cn(
                        "font-medium",
                        integration.metrics.errors > 0 && "text-red-600"
                      )}>
                        {integration.metrics.errors}
                      </p>
                    </div>
                  </div>

                  {/* Configuration Details */}
                  <div className="mt-4 pt-4 border-t">
                    <details className="group">
                      <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                        Configuration Details
                      </summary>
                      <div className="mt-3 space-y-2">
                        {Object.entries(integration.config).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <Card className="p-12 text-center">
            <Unplug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No connected integrations found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery 
                ? 'Try adjusting your search query' 
                : 'Add integrations to connect coherex with your tools'}
            </p>
            <Button onClick={() => router.push('/integrations')}>
              Browse Integrations
            </Button>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}