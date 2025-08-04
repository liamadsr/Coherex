'use client'

import { useState } from 'react'
import { 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Globe,
  Database,
  FileText,
  GitBranch,
  Link,
  FileCode,
  Cloud,
  HardDrive,
  RefreshCw,
  Settings,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function KnowledgeSourcesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for sources
  const sources = [
    {
      id: 1,
      name: 'Product Documentation',
      type: 'website',
      icon: Globe,
      url: 'https://docs.example.com',
      description: 'Official product documentation and user guides',
      documents: 156,
      lastSync: '2 hours ago',
      nextSync: 'in 4 hours',
      status: 'active',
      size: '12.3 MB',
      syncFrequency: 'Every 6 hours',
      createdAt: '2024-01-15',
      owner: 'John Smith'
    },
    {
      id: 2,
      name: 'Customer Support FAQs',
      type: 'database',
      icon: Database,
      connection: 'PostgreSQL',
      description: 'Frequently asked questions from customer support',
      documents: 89,
      lastSync: '5 minutes ago',
      nextSync: 'in 55 minutes',
      status: 'active',
      size: '3.7 MB',
      syncFrequency: 'Every hour',
      createdAt: '2024-01-10',
      owner: 'Sarah Johnson'
    },
    {
      id: 3,
      name: 'API Reference',
      type: 'git',
      icon: GitBranch,
      repository: 'github.com/example/api-docs',
      description: 'Complete API documentation with examples',
      documents: 234,
      lastSync: '1 day ago',
      nextSync: 'syncing now',
      status: 'syncing',
      size: '8.9 MB',
      syncFrequency: 'Daily',
      createdAt: '2023-12-20',
      owner: 'Dev Team'
    },
    {
      id: 4,
      name: 'Company Policies',
      type: 'files',
      icon: FileText,
      location: 'Local storage',
      description: 'HR policies, guidelines, and procedures',
      documents: 45,
      lastSync: '3 days ago',
      nextSync: 'in 4 days',
      status: 'active',
      size: '2.1 MB',
      syncFrequency: 'Weekly',
      createdAt: '2023-11-15',
      owner: 'HR Department'
    },
    {
      id: 5,
      name: 'Technical Specifications',
      type: 'confluence',
      icon: Link,
      space: 'TECH',
      description: 'Technical specs and architecture documents',
      documents: 178,
      lastSync: '12 hours ago',
      nextSync: 'in 12 hours',
      status: 'active',
      size: '15.4 MB',
      syncFrequency: 'Every 24 hours',
      createdAt: '2024-01-05',
      owner: 'Engineering'
    },
    {
      id: 6,
      name: 'Code Examples',
      type: 'git',
      icon: FileCode,
      repository: 'github.com/example/samples',
      description: 'Sample code and implementation examples',
      documents: 92,
      lastSync: '6 hours ago',
      nextSync: 'error - manual sync required',
      status: 'error',
      size: '5.2 MB',
      syncFrequency: 'Every 12 hours',
      createdAt: '2024-01-20',
      owner: 'Dev Team',
      error: 'Authentication failed'
    },
  ]

  const sourceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'website', label: 'Website', icon: Globe },
    { value: 'database', label: 'Database', icon: Database },
    { value: 'git', label: 'Git Repository', icon: GitBranch },
    { value: 'files', label: 'Local Files', icon: FileText },
    { value: 'confluence', label: 'Confluence', icon: Link },
    { value: 'cloud', label: 'Cloud Storage', icon: Cloud },
  ]

  const getSourceIcon = (type: string) => {
    const sourceType = sourceTypes.find(t => t.value === type)
    return sourceType?.icon || FileText
  }

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || source.type === filterType
    const matchesStatus = filterStatus === 'all' || source.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Sources</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Configure and manage your knowledge base sources
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {sourceTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center">
                    {type.icon && <type.icon className="w-4 h-4 mr-2" />}
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="syncing">Syncing</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sources List */}
        <div className="space-y-4">
          {filteredSources.map((source) => {
            const Icon = getSourceIcon(source.type)
            
            return (
              <Card key={source.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        source.status === 'error' 
                          ? 'bg-red-100 dark:bg-red-900/20' 
                          : 'bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          source.status === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">{source.name}</h3>
                          <Badge 
                            variant={
                              source.status === 'active' ? 'default' : 
                              source.status === 'error' ? 'destructive' : 
                              'secondary'
                            }
                            className={source.status === 'syncing' ? 'animate-pulse' : ''}
                          >
                            {source.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {source.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {source.status === 'syncing' && <Clock className="w-3 h-3 mr-1 animate-spin" />}
                            {source.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{source.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Documents</p>
                            <p className="font-medium">{source.documents}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Size</p>
                            <p className="font-medium">{source.size}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Last Sync</p>
                            <p className="font-medium">{source.lastSync}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Next Sync</p>
                            <p className="font-medium">{source.nextSync}</p>
                          </div>
                        </div>

                        {source.error && (
                          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              Error: {source.error}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                          {source.url && (
                            <span className="flex items-center">
                              <Globe className="w-4 h-4 mr-1" />
                              {source.url}
                            </span>
                          )}
                          {source.repository && (
                            <span className="flex items-center">
                              <GitBranch className="w-4 h-4 mr-1" />
                              {source.repository}
                            </span>
                          )}
                          {source.connection && (
                            <span className="flex items-center">
                              <Database className="w-4 h-4 mr-1" />
                              {source.connection}
                            </span>
                          )}
                          {source.space && (
                            <span className="flex items-center">
                              <Link className="w-4 h-4 mr-1" />
                              Space: {source.space}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Source
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Configure Sync
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Source
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}