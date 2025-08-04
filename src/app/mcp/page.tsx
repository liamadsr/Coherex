'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search,
  Plus,
  Settings,
  Power,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  ExternalLink,
  MoreHorizontal,
  Server,
  Code,
  Terminal,
  Database,
  Cloud,
  Cpu,
  Zap,
  Shield,
  Info,
  Play,
  Pause,
  Download,
  Upload,
  GitBranch,
  Package,
  MessageSquare
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MCPServerCard } from '@/components/mcp/MCPServerCard'
import { toast } from 'sonner'

// Mock MCP servers data
const mcpServers = [
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Access and manipulate files and directories',
    icon: Database,
    status: 'running' as const,
    version: '1.0.0',
    endpoint: 'npx -y @modelcontextprotocol/server-filesystem',
    args: ['/Users/liamalizadeh/code'],
    tools: [
      { name: 'read_file', description: 'Read contents of a file' },
      { name: 'write_file', description: 'Write content to a file' },
      { name: 'list_directory', description: 'List contents of a directory' },
      { name: 'create_directory', description: 'Create a new directory' },
      { name: 'delete_file', description: 'Delete a file or directory' },
      { name: 'move_file', description: 'Move or rename a file' },
    ],
    resources: {
      cpu: 12,
      memory: 256,
      requests: 1234,
      errors: 2,
    },
    config: {
      allowedPaths: ['/Users/liamalizadeh/code'],
      maxFileSize: '10MB',
      watchEnabled: true,
    },
    lastActive: new Date(),
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Interact with GitHub repositories and APIs',
    icon: GitBranch,
    status: 'running' as const,
    version: '1.0.0',
    endpoint: 'npx -y @modelcontextprotocol/server-github',
    args: [],
    tools: [
      { name: 'search_repositories', description: 'Search for GitHub repositories' },
      { name: 'get_repository', description: 'Get repository details' },
      { name: 'list_issues', description: 'List repository issues' },
      { name: 'create_issue', description: 'Create a new issue' },
      { name: 'list_pull_requests', description: 'List pull requests' },
      { name: 'get_file_contents', description: 'Get file contents from a repository' },
    ],
    resources: {
      cpu: 8,
      memory: 128,
      requests: 567,
      errors: 0,
    },
    config: {
      token: '•••••••••••••••',
      rateLimit: 5000,
      scope: 'repo, read:org',
    },
    lastActive: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases',
    icon: Database,
    status: 'stopped' as const,
    version: '1.0.0',
    endpoint: 'npx -y @modelcontextprotocol/server-postgres',
    args: ['postgresql://localhost:5432/blockwork'],
    tools: [
      { name: 'query', description: 'Execute SQL queries' },
      { name: 'list_tables', description: 'List all tables in database' },
      { name: 'describe_table', description: 'Get table schema' },
      { name: 'insert_data', description: 'Insert data into table' },
    ],
    resources: {
      cpu: 0,
      memory: 0,
      requests: 0,
      errors: 0,
    },
    config: {
      connectionString: 'postgresql://localhost:5432/blockwork',
      sslMode: 'require',
      poolSize: 10,
    },
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'web-browser',
    name: 'Web Browser',
    description: 'Browse and interact with web pages',
    icon: Cloud,
    status: 'running' as const,
    version: '0.1.0',
    endpoint: 'npx -y @modelcontextprotocol/server-puppeteer',
    args: [],
    tools: [
      { name: 'navigate', description: 'Navigate to a URL' },
      { name: 'screenshot', description: 'Take a screenshot of the page' },
      { name: 'click', description: 'Click on an element' },
      { name: 'fill', description: 'Fill in a form field' },
      { name: 'evaluate', description: 'Execute JavaScript on the page' },
    ],
    resources: {
      cpu: 25,
      memory: 512,
      requests: 89,
      errors: 5,
    },
    config: {
      headless: true,
      timeout: 30000,
      viewport: { width: 1920, height: 1080 },
    },
    lastActive: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages and interact with Slack',
    icon: MessageSquare,
    status: 'error' as const,
    version: '1.0.0',
    endpoint: 'npx -y @modelcontextprotocol/server-slack',
    args: [],
    tools: [
      { name: 'send_message', description: 'Send a message to a channel' },
      { name: 'list_channels', description: 'List all channels' },
      { name: 'get_channel_history', description: 'Get channel message history' },
      { name: 'upload_file', description: 'Upload a file to Slack' },
    ],
    resources: {
      cpu: 0,
      memory: 0,
      requests: 0,
      errors: 15,
    },
    config: {
      token: '•••••••••••••••',
      workspace: 'blockwork.slack.com',
    },
    error: 'Authentication failed: Invalid token',
    lastActive: new Date(Date.now() - 1000 * 60 * 60),
  },
]

const statusColors = {
  running: 'text-green-600',
  stopped: 'text-gray-600',
  error: 'text-red-600',
  starting: 'text-blue-600',
}

const statusIcons = {
  running: CheckCircle,
  stopped: Clock,
  error: AlertCircle,
  starting: RefreshCw,
}

// Mock available MCP packages
const availablePackages = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Access Google Drive files and folders',
    package: '@modelcontextprotocol/server-gdrive',
    installed: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Read and write Notion pages and databases',
    package: '@modelcontextprotocol/server-notion',
    installed: false,
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent memory storage for conversations',
    package: '@modelcontextprotocol/server-memory',
    installed: false,
  },
]

export default function MCPPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('active')

  const filteredServers = mcpServers.filter(server =>
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeServers = filteredServers.filter(s => s.status === 'running')
  const stoppedServers = filteredServers.filter(s => s.status === 'stopped')
  const errorServers = filteredServers.filter(s => s.status === 'error')

  const handleServerAction = (serverId: string, action: string) => {
    const server = mcpServers.find(s => s.id === serverId)
    
    switch (action) {
      case 'start':
        toast.success(`Starting ${server?.name}...`)
        break
      case 'stop':
        toast.success(`Stopping ${server?.name}...`)
        break
      case 'restart':
        toast.success(`Restarting ${server?.name}...`)
        break
      case 'configure':
        router.push(`/mcp/${serverId}`)
        break
      case 'logs':
        router.push(`/mcp/${serverId}?tab=logs`)
        break
      case 'remove':
        if (confirm(`Are you sure you want to remove ${server?.name}?`)) {
          toast.success(`${server?.name} removed`)
        }
        break
    }
  }

  const handleInstallPackage = (packageId: string) => {
    const pkg = availablePackages.find(p => p.id === packageId)
    toast.success(`Installing ${pkg?.name}...`)
    // In real app, would run npm install
  }

  // Calculate totals
  const totalCPU = mcpServers.reduce((acc, s) => acc + s.resources.cpu, 0)
  const totalMemory = mcpServers.reduce((acc, s) => acc + s.resources.memory, 0)
  const totalRequests = mcpServers.reduce((acc, s) => acc + s.resources.requests, 0)
  const totalErrors = mcpServers.reduce((acc, s) => acc + s.resources.errors, 0)

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Model Context Protocol</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage MCP servers that extend your AI agents' capabilities
              </p>
            </div>
            <Button onClick={() => router.push('/mcp/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Server
            </Button>
          </div>

          {/* Alert */}
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>About MCP</AlertTitle>
            <AlertDescription>
              Model Context Protocol (MCP) enables your AI agents to interact with external tools and services. 
              Each server provides specific capabilities through standardized tools.
            </AlertDescription>
          </Alert>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search MCP servers..."
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Servers</p>
                  <p className="text-2xl font-bold">{activeServers.length}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Power className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">CPU Usage</p>
                  <p className="text-2xl font-bold">{totalCPU}%</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Cpu className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <Progress value={totalCPU} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Memory</p>
                  <p className="text-2xl font-bold">{totalMemory} MB</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              Active
              <Badge variant="secondary" className="ml-2">
                {activeServers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="all">
              All Servers
              <Badge variant="secondary" className="ml-2">
                {filteredServers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="available">
              Available
              <Badge variant="secondary" className="ml-2">
                {availablePackages.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Active Servers */}
          <TabsContent value="active" className="space-y-4">
            {activeServers.length === 0 ? (
              <Card className="p-12 text-center">
                <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active servers</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start a server to enable AI capabilities
                </p>
                <Button onClick={() => setSelectedTab('all')}>
                  View All Servers
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeServers.map(server => (
                  <MCPServerCard
                    key={server.id}
                    server={server}
                    onAction={handleServerAction}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Servers */}
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {filteredServers.map(server => (
                <MCPServerCard
                  key={server.id}
                  server={server}
                  onAction={handleServerAction}
                />
              ))}
            </div>
          </TabsContent>

          {/* Available Packages */}
          <TabsContent value="available" className="space-y-4">
            <div className="grid gap-4">
              {availablePackages.map(pkg => (
                <Card key={pkg.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {pkg.description}
                        </p>
                        <code className="text-xs text-gray-500 mt-2 block">
                          {pkg.package}
                        </code>
                      </div>
                      <Button
                        onClick={() => handleInstallPackage(pkg.id)}
                        disabled={pkg.installed}
                      >
                        {pkg.installed ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Installed
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Install
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}