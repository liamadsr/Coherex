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
  Zap
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IntegrationCard } from '@/components/integrations/IntegrationCard'
import { Integration, IntegrationCategory } from '@/types'

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
        icon: '🔷',
        category: 'storage',
        status: 'available',
        features: ['File sync', 'Collaborative editing', 'Version control'],
      },
      {
        id: 'dropbox',
        name: 'Dropbox',
        description: 'Sync files with Dropbox',
        icon: '💧',
        category: 'storage',
        status: 'available',
        features: ['File sync', 'Sharing', 'Backup'],
      },
      {
        id: 'sharepoint',
        name: 'SharePoint',
        description: 'Microsoft SharePoint integration',
        icon: '🟦',
        category: 'storage',
        status: 'available',
        features: ['Document management', 'Team sites', 'Workflows'],
      },
      {
        id: 's3',
        name: 'S3',
        description: 'Amazon S3 bucket integration',
        icon: '🟧',
        category: 'storage',
        status: 'available',
        features: ['Object storage', 'CDN', 'Versioning'],
      },
      {
        id: 'r2',
        name: 'R2',
        description: 'Cloudflare R2 storage',
        icon: '🟠',
        category: 'storage',
        status: 'available',
        features: ['S3 compatible', 'No egress fees', 'Global distribution'],
      },
      {
        id: 'oracle-storage',
        name: 'Oracle Storage',
        description: 'Oracle Cloud Infrastructure storage',
        icon: '🔴',
        category: 'storage',
        status: 'available',
        features: ['Object storage', 'Archive storage', 'Data transfer'],
      },
      {
        id: 'google-storage',
        name: 'Google Storage',
        description: 'Google Cloud Storage buckets',
        icon: '🔵',
        category: 'storage',
        status: 'available',
        features: ['Multi-regional', 'Lifecycle management', 'Versioning'],
      },
      {
        id: 'egnyte',
        name: 'Egnyte',
        description: 'Enterprise content collaboration',
        icon: '🟩',
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
        icon: '🔷',
        category: 'wiki',
        status: 'available',
        features: ['Page creation', 'Collaboration', 'Search'],
      },
      {
        id: 'notion',
        name: 'Notion',
        description: 'All-in-one workspace',
        icon: '⬛',
        category: 'wiki',
        status: 'available',
        features: ['Databases', 'Notes', 'Tasks'],
      },
      {
        id: 'slab',
        name: 'Slab',
        description: 'Modern knowledge base',
        icon: '📚',
        category: 'wiki',
        status: 'available',
        features: ['Real-time collaboration', 'Search', 'Analytics'],
      },
      {
        id: 'guru',
        name: 'Guru',
        description: 'Company wiki and intranet',
        icon: '⚫',
        category: 'wiki',
        status: 'available',
        features: ['Knowledge cards', 'Verification', 'Browser extension'],
      },
      {
        id: 'document360',
        name: 'Document360',
        description: 'Self-service knowledge base',
        icon: '📄',
        category: 'wiki',
        status: 'available',
        features: ['Categories', 'Version control', 'Analytics'],
      },
      {
        id: 'bookstack',
        name: 'BookStack',
        description: 'Simple wiki platform',
        icon: '📚',
        category: 'wiki',
        status: 'available',
        features: ['Books & chapters', 'Search', 'Permissions'],
      },
      {
        id: 'google-sites',
        name: 'Google Sites',
        description: 'Simple website builder',
        icon: '📄',
        category: 'wiki',
        status: 'available',
        features: ['Drag & drop', 'Templates', 'Collaboration'],
      },
      {
        id: 'axero',
        name: 'Axero',
        description: 'Employee intranet',
        icon: '🟣',
        category: 'wiki',
        status: 'available',
        features: ['Social features', 'Blogs', 'Forums'],
      },
      {
        id: 'wikipedia',
        name: 'Wikipedia',
        description: 'Public encyclopedia',
        icon: '🌐',
        category: 'wiki',
        status: 'available',
        features: ['Article search', 'Categories', 'Languages'],
      },
      {
        id: 'mediawiki',
        name: 'MediaWiki',
        description: 'Open source wiki software',
        icon: '🔶',
        category: 'wiki',
        status: 'available',
        features: ['Templates', 'Extensions', 'Version control'],
      },
      {
        id: 'gitbook',
        name: 'GitBook',
        description: 'Technical documentation',
        icon: '📖',
        category: 'wiki',
        status: 'available',
        features: ['Git sync', 'API docs', 'Search'],
      },
      {
        id: 'highspot',
        name: 'Highspot',
        description: 'Sales enablement platform',
        icon: '🔵',
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
        icon: '🟢',
        category: 'customer-support',
        status: 'connected',
        features: ['Ticket management', 'Knowledge base', 'Chat'],
      },
      {
        id: 'intercom',
        name: 'Intercom',
        description: 'Customer messaging platform',
        icon: '💬',
        category: 'customer-support',
        status: 'available',
        features: ['Live chat', 'Help center', 'Product tours'],
      },
      {
        id: 'freshdesk',
        name: 'Freshdesk',
        description: 'Help desk software',
        icon: '🟩',
        category: 'customer-support',
        status: 'available',
        features: ['Ticketing', 'Automation', 'SLA management'],
      },
      {
        id: 'helpscout',
        name: 'Help Scout',
        description: 'Customer support tools',
        icon: '🔵',
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
        icon: '💜',
        category: 'communication',
        status: 'connected',
        features: ['Channels', 'Direct messages', 'File sharing'],
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        description: 'Collaboration hub',
        icon: '🟦',
        category: 'communication',
        status: 'available',
        features: ['Chat', 'Video calls', 'File sharing'],
      },
      {
        id: 'discord',
        name: 'Discord',
        description: 'Voice and text chat',
        icon: '🟣',
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
        icon: '☁️',
        category: 'crm',
        status: 'available',
        features: ['Contacts', 'Opportunities', 'Reports'],
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Inbound marketing and sales',
        icon: '🟠',
        category: 'crm',
        status: 'available',
        features: ['Contacts', 'Deals', 'Marketing automation'],
      },
      {
        id: 'pipedrive',
        name: 'Pipedrive',
        description: 'Sales CRM',
        icon: '🟢',
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
        icon: '🔷',
        category: 'project-management',
        status: 'available',
        features: ['Issue tracking', 'Sprints', 'Roadmaps'],
      },
      {
        id: 'asana',
        name: 'Asana',
        description: 'Work management platform',
        icon: '🔴',
        category: 'project-management',
        status: 'available',
        features: ['Tasks', 'Projects', 'Timeline'],
      },
      {
        id: 'trello',
        name: 'Trello',
        description: 'Visual collaboration tool',
        icon: '🟦',
        category: 'project-management',
        status: 'available',
        features: ['Boards', 'Cards', 'Power-ups'],
      },
      {
        id: 'monday',
        name: 'Monday.com',
        description: 'Work operating system',
        icon: '🟣',
        category: 'project-management',
        status: 'available',
        features: ['Workflows', 'Dashboards', 'Automations'],
      },
    ],
  },
]

// Mock connected integrations
const connectedIntegrations = ['zendesk', 'slack', 'email']

export default function IntegrationsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

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
            <Button 
              variant="default"
              onClick={() => router.push('/integrations/connected')}
            >
              See Connectors
              <Badge className="ml-2" variant="secondary">
                {connectedCount}
              </Badge>
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search connectors..."
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

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
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
      </div>
    </MainLayout>
  )
}