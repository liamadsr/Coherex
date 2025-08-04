'use client'

import { useState } from 'react'
import { 
  Brain, 
  Database, 
  FileText, 
  Globe, 
  Plus, 
  Search, 
  Upload,
  FolderOpen,
  GitBranch,
  Link,
  FileCode,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for knowledge sources
  const knowledgeSources = [
    {
      id: 1,
      name: 'Product Documentation',
      type: 'website',
      icon: Globe,
      url: 'https://docs.example.com',
      documents: 156,
      lastSync: '2 hours ago',
      status: 'active',
      size: '12.3 MB',
      completeness: 95
    },
    {
      id: 2,
      name: 'Customer Support FAQs',
      type: 'database',
      icon: Database,
      connection: 'PostgreSQL',
      documents: 89,
      lastSync: '5 minutes ago',
      status: 'active',
      size: '3.7 MB',
      completeness: 100
    },
    {
      id: 3,
      name: 'API Reference',
      type: 'git',
      icon: GitBranch,
      repository: 'github.com/example/api-docs',
      documents: 234,
      lastSync: '1 day ago',
      status: 'syncing',
      size: '8.9 MB',
      completeness: 78
    },
    {
      id: 4,
      name: 'Company Policies',
      type: 'files',
      icon: FileText,
      documents: 45,
      lastSync: '3 days ago',
      status: 'active',
      size: '2.1 MB',
      completeness: 100
    },
    {
      id: 5,
      name: 'Technical Specifications',
      type: 'confluence',
      icon: Link,
      documents: 178,
      lastSync: '12 hours ago',
      status: 'active',
      size: '15.4 MB',
      completeness: 88
    },
    {
      id: 6,
      name: 'Code Examples',
      type: 'git',
      icon: FileCode,
      repository: 'github.com/example/samples',
      documents: 92,
      lastSync: '6 hours ago',
      status: 'error',
      size: '5.2 MB',
      completeness: 65
    },
  ]

  const stats = [
    { label: 'Total Sources', value: '12', icon: Database, change: '+2', trend: 'up' },
    { label: 'Documents', value: '1,234', icon: FileText, change: '+156', trend: 'up' },
    { label: 'Total Size', value: '156 MB', icon: Brain, change: '+12.3 MB', trend: 'up' },
    { label: 'Sync Health', value: '92%', icon: Activity, change: '+5%', trend: 'up' },
  ]

  const recentActivity = [
    { action: 'Synced', source: 'Customer Support FAQs', time: '5 minutes ago', status: 'success' },
    { action: 'Updated', source: 'Product Documentation', time: '2 hours ago', status: 'success' },
    { action: 'Failed to sync', source: 'Code Examples', time: '6 hours ago', status: 'error' },
    { action: 'Added', source: 'Technical Specifications', time: '12 hours ago', status: 'success' },
  ]

  const typeDistribution = [
    { type: 'Website', count: 3, percentage: 25 },
    { type: 'Database', count: 2, percentage: 17 },
    { type: 'Files', count: 4, percentage: 33 },
    { type: 'Git Repository', count: 2, percentage: 17 },
    { type: 'Confluence', count: 1, percentage: 8 },
  ]

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your organization's knowledge sources and documents
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    {stat.change && (
                      <p className="text-sm text-green-600 mt-1">
                        {stat.change} this week
                      </p>
                    )}
                  </div>
                  <stat.icon className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search knowledge sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Knowledge Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgeSources.map((source) => (
                <Card key={source.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          source.status === 'error' 
                            ? 'bg-red-100 dark:bg-red-900/20' 
                            : 'bg-blue-100 dark:bg-blue-900/20'
                        }`}>
                          <source.icon className={`w-6 h-6 ${
                            source.status === 'error'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{source.name}</CardTitle>
                          <CardDescription>{source.documents} documents</CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          source.status === 'active' ? 'default' : 
                          source.status === 'error' ? 'destructive' : 
                          'secondary'
                        }
                        className={source.status === 'syncing' ? 'animate-pulse' : ''}
                      >
                        {source.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Size</span>
                          <span className="font-medium">{source.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Last sync</span>
                          <span className="font-medium">{source.lastSync}</span>
                        </div>
                        {source.url && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">URL</span>
                            <span className="font-medium text-xs truncate max-w-[150px]">{source.url}</span>
                          </div>
                        )}
                        {source.repository && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Repository</span>
                            <span className="font-medium text-xs truncate max-w-[150px]">{source.repository}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Completeness</span>
                          <span className="text-xs font-medium">{source.completeness}%</span>
                        </div>
                        <Progress value={source.completeness} className="h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sources" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Source Distribution</CardTitle>
                  <CardDescription>Knowledge sources by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {typeDistribution.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.type}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{item.count} sources</span>
                            <Badge variant="secondary">{item.percentage}%</Badge>
                          </div>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Source health overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Active Sources</span>
                      </div>
                      <span className="text-lg font-bold">10</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Syncing</span>
                      </div>
                      <span className="text-lg font-bold">1</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-medium">Errors</span>
                      </div>
                      <span className="text-lg font-bold">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates to your knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium">
                            {activity.action} <span className="text-blue-600">{activity.source}</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                      {activity.status === 'error' && (
                        <Button variant="outline" size="sm">Retry</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Coverage</CardTitle>
                  <CardDescription>Areas well-documented vs gaps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Well Covered</h4>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Product features and functionality</li>
                        <li>• API endpoints and usage</li>
                        <li>• Company policies and procedures</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Needs Improvement</h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• Troubleshooting guides</li>
                        <li>• Integration examples</li>
                        <li>• Best practices documentation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Insights</CardTitle>
                  <CardDescription>How agents use knowledge</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Most Referenced</span>
                        <Badge>Product Documentation</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Referenced in 68% of conversations
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Least Used</span>
                        <Badge variant="secondary">Company Policies</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Only 12% utilization rate
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Fastest Growing</span>
                        <Badge variant="outline">API Reference</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        +45% usage increase this month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}