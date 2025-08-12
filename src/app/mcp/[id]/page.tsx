'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Save,
  Terminal,
  Code,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  Copy,
  ExternalLink,
  RefreshCw,
  Play,
  Pause,
  FileText,
  Database,
  Shield,
  Clock,
  Zap,
  Power,
  Trash2,
  GitBranch,
  MessageSquare,
  Cloud,
  Activity,
  Cpu,
  HardDrive
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Mock MCP server data - in real app would fetch by ID
const getMCPServer = (id: string) => {
  const servers: Record<string, any> = {
    filesystem: {
      id: 'filesystem',
      name: 'Filesystem',
      description: 'Access and manipulate files and directories',
      icon: Database,
      status: 'running',
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
    github: {
      id: 'github',
      name: 'GitHub',
      description: 'Interact with GitHub repositories and APIs',
      icon: GitBranch,
      status: 'running',
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
    postgres: {
      id: 'postgres',
      name: 'PostgreSQL',
      description: 'Connect to PostgreSQL databases',
      icon: Database,
      status: 'stopped',
      version: '1.0.0',
      endpoint: 'npx -y @modelcontextprotocol/server-postgres',
      args: ['postgresql://localhost:5432/coherex'],
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
        connectionString: 'postgresql://localhost:5432/coherex',
        sslMode: 'require',
        poolSize: 10,
      },
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    'web-browser': {
      id: 'web-browser',
      name: 'Web Browser',
      description: 'Browse and interact with web pages',
      icon: Cloud,
      status: 'running',
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
    slack: {
      id: 'slack',
      name: 'Slack',
      description: 'Send messages and interact with Slack',
      icon: MessageSquare,
      status: 'error',
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
        workspace: 'coherex.slack.com',
      },
      error: 'Authentication failed: Invalid token',
      lastActive: new Date(Date.now() - 1000 * 60 * 60),
    },
  }
  
  return servers[id]
}

const statusColors = {
  running: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  stopped: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
  error: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  starting: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
}

const statusIcons = {
  running: CheckCircle,
  stopped: Clock,
  error: AlertCircle,
  starting: RefreshCw,
}

export default function MCPServerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const serverId = params.id as string
  const server = getMCPServer(serverId)

  const [activeTab, setActiveTab] = useState('overview')
  const [config, setConfig] = useState(server?.config || {})
  const [args, setArgs] = useState(server?.args?.join(' ') || '')
  const [autoRestart, setAutoRestart] = useState(true)
  const [enableLogs, setEnableLogs] = useState(true)
  const [isStarting, setIsStarting] = useState(false)

  if (!server) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
          <h1 className="text-2xl font-bold">MCP Server Not Found</h1>
          <p className="text-gray-600">The server you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/mcp')}>
            Back to MCP
          </Button>
        </div>
      </MainLayout>
    )
  }

  const Icon = server.icon
  const StatusIcon = statusIcons[server.status]

  const handleSave = () => {
    toast.success('Server configuration saved')
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const handleStart = async () => {
    setIsStarting(true)
    // Simulate starting
    setTimeout(() => {
      setIsStarting(false)
      toast.success(`${server.name} started successfully`)
    }, 2000)
  }

  const handleStop = async () => {
    toast.success(`${server.name} stopped`)
  }

  const handleRestart = async () => {
    toast.success(`Restarting ${server.name}...`)
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to remove ${server.name}? This action cannot be undone.`)) {
      toast.success(`${server.name} removed`)
      router.push('/mcp')
    }
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{server.name}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">{server.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className={cn("capitalize", statusColors[server.status])}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {server.status}
                    </Badge>
                    <Badge variant="outline">v{server.version}</Badge>
                    <span className="text-sm text-gray-500">
                      Last active {new Date(server.lastActive).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {server.status === 'stopped' && (
                <Button onClick={handleStart} disabled={isStarting}>
                  {isStarting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Start Server
                </Button>
              )}
              {server.status === 'running' && (
                <>
                  <Button variant="outline" onClick={handleStop}>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                  <Button variant="outline" onClick={handleRestart}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                </>
              )}
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>

          {server.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{server.error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Stats Cards */}
        {server.status === 'running' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">CPU Usage</p>
                    <p className="text-2xl font-bold">{server.resources.cpu}%</p>
                  </div>
                  <Cpu className="w-8 h-8 text-blue-600" />
                </div>
                <Progress value={server.resources.cpu} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Memory</p>
                    <p className="text-2xl font-bold">{server.resources.memory} MB</p>
                  </div>
                  <HardDrive className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Requests</p>
                    <p className="text-2xl font-bold">{server.resources.requests.toLocaleString()}</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Errors (24h)</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      server.resources.errors > 0 && "text-red-600"
                    )}>
                      {server.resources.errors}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Server Information</CardTitle>
                  <CardDescription>Basic information about this MCP server</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Endpoint Command</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                        {server.endpoint}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(server.endpoint, 'Endpoint')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">Package</Label>
                    <p className="font-medium">{server.endpoint.split(' ').pop()}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">Version</Label>
                    <p className="font-medium">v{server.version}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">Status</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={cn("capitalize", statusColors[server.status])}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {server.status}
                      </Badge>
                      {server.status === 'running' && (
                        <span className="text-sm text-gray-500">
                          Running for 2h 34m
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Server performance and usage metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm font-medium">{server.resources.cpu}%</span>
                      </div>
                      <Progress value={server.resources.cpu} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Memory Usage</span>
                        <span className="text-sm font-medium">{server.resources.memory} MB</span>
                      </div>
                      <Progress value={(server.resources.memory / 1024) * 100} />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Tools</p>
                        <p className="text-xl font-bold">{server.tools.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Requests</p>
                        <p className="text-xl font-bold">{server.resources.requests.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Tools</CardTitle>
                    <CardDescription>
                      Tools provided by this MCP server for AI agents
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    View API Docs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[150px]">Usage (24h)</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {server.tools.map((tool, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">
                          <div className="flex items-center space-x-2">
                            <Code className="w-4 h-4 text-gray-500" />
                            <span>{tool.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{tool.description}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {Math.floor(Math.random() * 1000)} calls
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Tool Usage</AlertTitle>
                  <AlertDescription>
                    These tools are automatically available to AI agents when this server is running. 
                    Agents can call these tools to perform actions on your behalf.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Server Configuration</CardTitle>
                <CardDescription>
                  Configure how this MCP server operates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="endpoint">Endpoint Command</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      id="endpoint"
                      value={server.endpoint}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(server.endpoint, 'Endpoint')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="args">Arguments</Label>
                  <Input
                    id="args"
                    value={args}
                    onChange={(e) => setArgs(e.target.value)}
                    placeholder="Additional arguments..."
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Space-separated arguments passed to the server
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Server Settings</h4>
                  
                  {Object.entries(config).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Input
                        id={key}
                        value={String(value)}
                        onChange={(e) => setConfig({
                          ...config,
                          [key]: e.target.value
                        })}
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-restart"
                      checked={autoRestart}
                      onCheckedChange={setAutoRestart}
                    />
                    <Label htmlFor="auto-restart">Auto-restart on failure</Label>
                  </div>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Server Logs</CardTitle>
                    <CardDescription>Real-time logs from the MCP server</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Logs</SelectItem>
                        <SelectItem value="error">Errors Only</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enable-logs"
                        checked={enableLogs}
                        onCheckedChange={setEnableLogs}
                      />
                      <Label htmlFor="enable-logs" className="text-sm">Auto-scroll</Label>
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] rounded-md border bg-black p-4">
                  <div className="font-mono text-xs text-green-400 space-y-1">
                    <div>[2025-01-15 10:23:45] INFO: Server started successfully</div>
                    <div>[2025-01-15 10:23:45] INFO: Listening on port 3001</div>
                    <div>[2025-01-15 10:23:46] INFO: Connected to filesystem at /Users/liamalizadeh/code</div>
                    <div>[2025-01-15 10:23:47] INFO: Loaded 6 tools</div>
                    <div>[2025-01-15 10:24:12] INFO: Tool called: read_file {`{"path": "/src/index.ts"}`}</div>
                    <div>[2025-01-15 10:24:12] INFO: Successfully read file: 2048 bytes</div>
                    <div>[2025-01-15 10:24:34] INFO: Tool called: list_directory {`{"path": "/src/components"}`}</div>
                    <div>[2025-01-15 10:24:34] INFO: Listed 24 items</div>
                    <div>[2025-01-15 10:25:01] WARN: Rate limit approaching: 4500/5000 requests</div>
                    <div>[2025-01-15 10:25:15] INFO: Tool called: write_file {`{"path": "/src/test.ts"}`}</div>
                    <div>[2025-01-15 10:25:15] INFO: File written successfully</div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Security Settings</AlertTitle>
              <AlertDescription>
                Configure advanced security and performance settings for this MCP server.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Resource Limits</CardTitle>
                <CardDescription>
                  Set limits to prevent resource exhaustion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Rate Limiting</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="rate-limit" className="text-sm">
                        Requests per minute
                      </Label>
                      <Input
                        id="rate-limit"
                        type="number"
                        defaultValue="100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="burst-limit" className="text-sm">
                        Burst limit
                      </Label>
                      <Input
                        id="burst-limit"
                        type="number"
                        defaultValue="200"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Resource Limits</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="max-cpu" className="text-sm">
                        Max CPU (%)
                      </Label>
                      <Input
                        id="max-cpu"
                        type="number"
                        defaultValue="50"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-memory" className="text-sm">
                        Max Memory (MB)
                      </Label>
                      <Input
                        id="max-memory"
                        type="number"
                        defaultValue="1024"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Environment Variables</Label>
                  <Textarea
                    placeholder="KEY=value&#10;ANOTHER_KEY=another_value"
                    className="mt-2 font-mono text-sm"
                    rows={5}
                  />
                </div>

                <div className="pt-4">
                  <Button variant="destructive" className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}