'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search,
  Plus,
  ArrowRight,
  Check,
  Clock,
  AlertCircle,
  ExternalLink,
  Settings,
  Database,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  Mail,
  Calendar,
  CreditCard,
  Shield,
  Workflow,
  Cloud,
  Code,
  Zap,
  CheckCircle,
  Unplug,
  RefreshCw,
  Trash2,
  MoreHorizontal,
  Activity
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IntegrationCard } from '@/components/integrations/IntegrationCard'
import { ServiceIcon } from '@/components/integrations/ServiceIcon'
import { Integration, IntegrationCategory } from '@/types'
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

// Map service names to Simple Icons slugs
const iconSlugs: { [key: string]: string } = {
  'google-drive': 'googledrive',
  'dropbox': 'dropbox',
  'sharepoint': 'microsoftsharepoint',
  's3': 'amazons3',
  'r2': 'cloudflare',
  'oracle-storage': 'oracle',
  'google-storage': 'googlecloud',
  'egnyte': 'egnyte',
  'confluence': 'confluence',
  'notion': 'notion',
  'slab': 'slab',
  'guru': 'guru',
  'document360': 'document360',
  'bookstack': 'bookstack',
  'google-sites': 'googlesites',
  'axero': 'axero',
  'wikipedia': 'wikipedia',
  'mediawiki': 'mediawiki',
  'gitbook': 'gitbook',
  'highspot': 'highspot',
  'zendesk': 'zendesk',
  'intercom': 'intercom',
  'freshdesk': 'freshdesk',
  'helpscout': 'helpscout',
  'slack': 'slack',
  'teams': 'microsoftteams',
  'discord': 'discord',
  'salesforce': 'salesforce',
  'hubspot': 'hubspot',
  'pipedrive': 'pipedrive',
  'jira': 'jira',
  'asana': 'asana',
  'trello': 'trello',
  'monday': 'monday',
}

// Integration categories with their connectors
const integrationCategories: IntegrationCategory[] = [
  {
    id: 'storage',
    name: 'Storage',
    description: 'Connect to cloud storage and file hosting services.',
    icon: Database,
    integrations: [
      {
        id: 'file',
        name: 'File',
        description: 'Local file system integration',
        icon: FileText,
        category: 'storage',
        status: 'available',
        features: ['File upload', 'File download', 'Directory browsing'],
      },
      {
        id: 'google-drive',
        name: 'Google Drive',
        description: 'Connect to Google Drive for document storage',
        icon: iconSlugs['google-drive'] || 'googledrive',
        category: 'storage',
        status: 'available',
        features: ['File sync', 'Collaborative editing', 'Version control'],
      },
      {
        id: 'dropbox',
        name: 'Dropbox',
        description: 'Sync files with Dropbox',
        icon: iconSlugs['dropbox'] || 'dropbox',
        category: 'storage',
        status: 'available',
        features: ['File sync', 'Sharing', 'Backup'],
      },
      {
        id: 'sharepoint',
        name: 'SharePoint',
        description: 'Microsoft SharePoint integration',
        icon: iconSlugs['sharepoint'] || 'microsoftsharepoint',
        category: 'storage',
        status: 'available',
        features: ['Document management', 'Team sites', 'Workflows'],
      },
      {
        id: 's3',
        name: 'S3',
        description: 'Amazon S3 bucket integration',
        icon: iconSlugs['s3'] || 'amazons3',
        category: 'storage',
        status: 'available',
        features: ['Object storage', 'CDN', 'Versioning'],
      },
      {
        id: 'r2',
        name: 'R2',
        description: 'Cloudflare R2 storage',
        icon: iconSlugs['r2'] || 'cloudflare',
        category: 'storage',
        status: 'available',
        features: ['S3 compatible', 'No egress fees', 'Global distribution'],
      },
      {
        id: 'oracle-storage',
        name: 'Oracle Storage',
        description: 'Oracle Cloud Infrastructure storage',
        icon: iconSlugs['oracle-storage'] || 'oracle',
        category: 'storage',
        status: 'available',
        features: ['Object storage', 'Archive storage', 'Data transfer'],
      },
      {
        id: 'google-storage',
        name: 'Google Storage',
        description: 'Google Cloud Storage buckets',
        icon: iconSlugs['google-storage'] || 'googlecloud',
        category: 'storage',
        status: 'available',
        features: ['Multi-regional', 'Lifecycle management', 'Versioning'],
      },
      {
        id: 'egnyte',
        name: 'Egnyte',
        description: 'Enterprise content collaboration',
        icon: iconSlugs['egnyte'] || 'egnyte',
        category: 'storage',
        status: 'available',
        features: ['File sync', 'Governance', 'Compliance'],
      },
    ],
  },
  {
    id: 'wiki',
    name: 'Wiki',
    description: 'Link to wiki and knowledge base platforms.',
    icon: FileText,
    integrations: [
      {
        id: 'confluence',
        name: 'Confluence',
        description: 'Atlassian Confluence wiki',
        icon: iconSlugs['confluence'] || 'confluence',
        category: 'wiki',
        status: 'available',
        features: ['Page creation', 'Collaboration', 'Search'],
      },
      {
        id: 'notion',
        name: 'Notion',
        description: 'All-in-one workspace',
        icon: iconSlugs['notion'] || 'notion',
        category: 'wiki',
        status: 'available',
        features: ['Databases', 'Notes', 'Tasks'],
      },
      {
        id: 'slab',
        name: 'Slab',
        description: 'Modern knowledge base',
        icon: iconSlugs['slab'] || 'slab',
        category: 'wiki',
        status: 'available',
        features: ['Real-time collaboration', 'Search', 'Analytics'],
      },
      {
        id: 'guru',
        name: 'Guru',
        description: 'Company wiki and intranet',
        icon: iconSlugs['guru'] || 'guru',
        category: 'wiki',
        status: 'available',
        features: ['Knowledge cards', 'Verification', 'Browser extension'],
      },
      {
        id: 'document360',
        name: 'Document360',
        description: 'Self-service knowledge base',
        icon: iconSlugs['document360'] || 'document360',
        category: 'wiki',
        status: 'available',
        features: ['Categories', 'Version control', 'Analytics'],
      },
      {
        id: 'bookstack',
        name: 'BookStack',
        description: 'Simple wiki platform',
        icon: iconSlugs['bookstack'] || 'bookstack',
        category: 'wiki',
        status: 'available',
        features: ['Books & chapters', 'Search', 'Permissions'],
      },
      {
        id: 'google-sites',
        name: 'Google Sites',
        description: 'Simple website builder',
        icon: iconSlugs['google-sites'] || 'googlesites',
        category: 'wiki',
        status: 'available',
        features: ['Drag & drop', 'Templates', 'Collaboration'],
      },
      {
        id: 'axero',
        name: 'Axero',
        description: 'Employee intranet',
        icon: iconSlugs['axero'] || 'axero',
        category: 'wiki',
        status: 'available',
        features: ['Social features', 'Blogs', 'Forums'],
      },
      {
        id: 'wikipedia',
        name: 'Wikipedia',
        description: 'Public encyclopedia',
        icon: iconSlugs['wikipedia'] || 'wikipedia',
        category: 'wiki',
        status: 'available',
        features: ['Article search', 'Categories', 'Languages'],
      },
      {
        id: 'mediawiki',
        name: 'MediaWiki',
        description: 'Open source wiki software',
        icon: iconSlugs['mediawiki'] || 'mediawiki',
        category: 'wiki',
        status: 'available',
        features: ['Templates', 'Extensions', 'Version control'],
      },
      {
        id: 'gitbook',
        name: 'GitBook',
        description: 'Technical documentation',
        icon: iconSlugs['gitbook'] || 'gitbook',
        category: 'wiki',
        status: 'available',
        features: ['Git sync', 'API docs', 'Search'],
      },
      {
        id: 'highspot',
        name: 'Highspot',
        description: 'Sales enablement platform',
        icon: iconSlugs['highspot'] || 'highspot',
        category: 'wiki',
        status: 'available',
        features: ['Content management', 'Analytics', 'Training'],
      },
    ],
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Connect to help desk and support platforms.',
    icon: Users,
    integrations: [
      {
        id: 'zendesk',
        name: 'Zendesk',
        description: 'Customer service platform',
        icon: iconSlugs['zendesk'] || 'zendesk',
        category: 'customer-support',
        status: 'connected',
        features: ['Ticket management', 'Knowledge base', 'Chat'],
      },
      {
        id: 'intercom',
        name: 'Intercom',
        description: 'Customer messaging platform',
        icon: iconSlugs['intercom'] || 'intercom',
        category: 'customer-support',
        status: 'available',
        features: ['Live chat', 'Help center', 'Product tours'],
      },
      {
        id: 'freshdesk',
        name: 'Freshdesk',
        description: 'Help desk software',
        icon: iconSlugs['freshdesk'] || 'freshdesk',
        category: 'customer-support',
        status: 'available',
        features: ['Ticketing', 'Automation', 'SLA management'],
      },
      {
        id: 'helpscout',
        name: 'Help Scout',
        description: 'Customer support tools',
        icon: iconSlugs['helpscout'] || 'helpscout',
        category: 'customer-support',
        status: 'available',
        features: ['Shared inbox', 'Docs', 'Reports'],
      },
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Connect to messaging and communication tools.',
    icon: MessageSquare,
    integrations: [
      {
        id: 'slack',
        name: 'Slack',
        description: 'Team communication platform',
        icon: iconSlugs['slack'] || 'slack',
        category: 'communication',
        status: 'connected',
        features: ['Channels', 'Direct messages', 'File sharing'],
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        description: 'Collaboration hub',
        icon: iconSlugs['teams'] || 'microsoftteams',
        category: 'communication',
        status: 'available',
        features: ['Chat', 'Video calls', 'File sharing'],
      },
      {
        id: 'discord',
        name: 'Discord',
        description: 'Voice and text chat',
        icon: iconSlugs['discord'] || 'discord',
        category: 'communication',
        status: 'available',
        features: ['Voice channels', 'Text chat', 'Screen sharing'],
      },
      {
        id: 'email',
        name: 'Email',
        description: 'SMTP email integration',
        icon: Mail,
        category: 'communication',
        status: 'connected',
        features: ['Send emails', 'Templates', 'Attachments'],
      },
    ],
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Customer relationship management systems.',
    icon: Users,
    integrations: [
      {
        id: 'salesforce',
        name: 'Salesforce',
        description: 'Leading CRM platform',
        icon: iconSlugs['salesforce'] || 'salesforce',
        category: 'crm',
        status: 'available',
        features: ['Contacts', 'Opportunities', 'Reports'],
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Inbound marketing and sales',
        icon: iconSlugs['hubspot'] || 'hubspot',
        category: 'crm',
        status: 'available',
        features: ['Contacts', 'Deals', 'Marketing automation'],
      },
      {
        id: 'pipedrive',
        name: 'Pipedrive',
        description: 'Sales CRM',
        icon: iconSlugs['pipedrive'] || 'pipedrive',
        category: 'crm',
        status: 'available',
        features: ['Pipeline management', 'Activities', 'Insights'],
      },
    ],
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Task and project tracking tools.',
    icon: BarChart3,
    integrations: [
      {
        id: 'jira',
        name: 'Jira',
        description: 'Agile project management',
        icon: iconSlugs['jira'] || 'jira',
        category: 'project-management',
        status: 'available',
        features: ['Issue tracking', 'Sprints', 'Roadmaps'],
      },
      {
        id: 'asana',
        name: 'Asana',
        description: 'Work management platform',
        icon: iconSlugs['asana'] || 'asana',
        category: 'project-management',
        status: 'available',
        features: ['Tasks', 'Projects', 'Timeline'],
      },
      {
        id: 'trello',
        name: 'Trello',
        description: 'Visual collaboration tool',
        icon: iconSlugs['trello'] || 'trello',
        category: 'project-management',
        status: 'available',
        features: ['Boards', 'Cards', 'Power-ups'],
      },
      {
        id: 'monday',
        name: 'Monday.com',
        description: 'Work operating system',
        icon: iconSlugs['monday'] || 'monday',
        category: 'project-management',
        status: 'available',
        features: ['Workflows', 'Dashboards', 'Automations'],
      },
    ],
  },
]

// Mock connected integrations
const connectedIntegrations = ['zendesk', 'slack', 'email']

// Mock connected integrations data
const connectedIntegrationsData = [
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Customer service platform',
    icon: iconSlugs['zendesk'] || 'zendesk',
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
    icon: iconSlugs['slack'] || 'slack',
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
    icon: 'email',
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

export default function IntegrationsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('marketplace')

  // Filter integrations based on search and category
  const filteredCategories = integrationCategories
    .map(category => ({
      ...category,
      integrations: category.integrations.filter(integration => {
        const matchesSearch = 
          integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          integration.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })
    }))
    .filter(category => 
      selectedCategory === 'all' || 
      category.id === selectedCategory
    )
    .filter(category => category.integrations.length > 0)

  // Get total counts
  const totalIntegrations = integrationCategories.reduce(
    (acc, cat) => acc + cat.integrations.length, 
    0
  )
  const connectedCount = connectedIntegrations.length

  const handleConnect = (integrationId: string) => {
    router.push(`/integrations/${integrationId}/connect`)
  }

  // Filter connected integrations based on search
  const filteredConnectedIntegrations = connectedIntegrationsData.filter(integration =>
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

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Connect coherex to your favorite tools and services
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={activeTab === 'marketplace' ? "Search integrations..." : "Search connected integrations..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalIntegrations}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{connectedCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{integrationCategories.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Setup</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="marketplace">
              Marketplace
              <Badge className="ml-2" variant="secondary">
                {totalIntegrations}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="connected">
              Connected
              <Badge className="ml-2" variant="secondary">
                {connectedCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6 mt-6">
            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">All Categories</TabsTrigger>
                {integrationCategories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Integration Categories */}
            <div className="space-y-8">
              {filteredCategories.map(category => (
                <div key={category.id}>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {category.integrations.map(integration => (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        isConnected={connectedIntegrations.includes(integration.id)}
                        onConnect={() => handleConnect(integration.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <Card className="p-12 text-center">
                <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search query
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Connected Tab */}
          <TabsContent value="connected" className="space-y-4 mt-6">
            {filteredConnectedIntegrations.map(integration => {
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
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          {typeof integration.icon === 'string' ? (
                            integration.icon === 'email' ? (
                              <Mail className="w-8 h-8" />
                            ) : (
                              <ServiceIcon name={integration.name} slug={integration.icon} />
                            )
                          ) : (
                            <span className="text-2xl">{integration.icon}</span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {integration.name}
                            <StatusIcon className={cn("w-5 h-5", statusColor)} />
                          </CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleSync(integration.id)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sync Now
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/integrations/${integration.id}/connect`)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDisconnect(integration.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {integration.status === 'error' && integration.error && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {integration.error}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Last Sync</p>
                        <p className="font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatLastSync(integration.lastSync)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Items Synced</p>
                        <p className="font-medium flex items-center">
                          <Activity className="w-4 h-4 mr-1" />
                          {integration.metrics.totalSynced}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Status</p>
                        <p className="font-medium">
                          <Badge 
                            variant={integration.status === 'connected' ? 'default' : 'destructive'}
                            className="capitalize"
                          >
                            {integration.status}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {filteredConnectedIntegrations.length === 0 && (
              <Card className="p-12 text-center">
                <Unplug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No connected integrations</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery ? 'Try adjusting your search query' : 'Start by connecting your first integration'}
                </p>
                <Button onClick={() => setActiveTab('marketplace')}>
                  <Zap className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}