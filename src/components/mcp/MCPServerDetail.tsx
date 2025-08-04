import React, { useState } from 'react'
import { 
  X,
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
  Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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

interface MCPServer {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'running' | 'stopped' | 'error' | 'starting'
  version: string
  endpoint: string
  args?: string[]
  tools: { name: string; description: string }[]
  resources: {
    cpu: number
    memory: number
    requests: number
    errors: number
  }
  config?: Record<string, any>
  error?: string
  lastActive: Date
}

interface MCPServerDetailProps {
  server: MCPServer
  onClose: () => void
}

export function MCPServerDetail({ server, onClose }: MCPServerDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [config, setConfig] = useState(server.config || {})
  const [args, setArgs] = useState(server.args?.join(' ') || '')
  const [autoRestart, setAutoRestart] = useState(true)
  const [enableLogs, setEnableLogs] = useState(true)

  const handleSave = () => {
    toast.success('Server configuration saved')
    onClose()
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const Icon = server.icon

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">{server.name}</DialogTitle>
              <DialogDescription>{server.description}</DialogDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </DialogHeader>

      <div className="mt-6">
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
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={cn(
                      "capitalize",
                      server.status === 'running' && "bg-green-500",
                      server.status === 'stopped' && "bg-gray-500",
                      server.status === 'error' && "bg-red-500"
                    )}>
                      {server.status === 'running' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {server.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {server.status}
                    </Badge>
                    {server.status === 'running' && (
                      <span className="text-sm text-gray-500">
                        Running for 2h 34m
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-500">Version</Label>
                  <p className="font-medium">v{server.version}</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-500">Last Active</Label>
                  <p className="font-medium">{server.lastActive.toLocaleString()}</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-500">Total Requests</Label>
                  <p className="font-medium">{server.resources.requests.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500 mb-2 block">Resource Usage</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CPU</span>
                      <span className="font-medium">{server.resources.cpu}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory</span>
                      <span className="font-medium">{server.resources.memory} MB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Errors (24h)</span>
                      <span className={cn(
                        "font-medium",
                        server.resources.errors > 0 && "text-red-600"
                      )}>
                        {server.resources.errors}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {server.status === 'stopped' && (
                    <Button className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  )}
                  {server.status === 'running' && (
                    <>
                      <Button variant="outline" className="flex-1">
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restart
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {server.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{server.error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This server provides {server.tools.length} tools for AI agents
                </p>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  View API Docs
                </Button>
              </div>

              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Usage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {server.tools.map((tool, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center space-x-2">
                            <Code className="w-4 h-4 text-gray-500" />
                            <span>{tool.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{tool.description}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {Math.floor(Math.random() * 100)} calls
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Tool Usage</AlertTitle>
                <AlertDescription>
                  These tools are automatically available to AI agents when this server is running. 
                  Agents can call these tools to perform actions on your behalf.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6 mt-6">
            <div className="space-y-4">
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
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
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
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <ScrollArea className="h-[400px] rounded-md border bg-black p-4">
                <div className="font-mono text-xs text-green-400 space-y-1">
                  <div>[2024-01-15 10:23:45] INFO: Server started successfully</div>
                  <div>[2024-01-15 10:23:45] INFO: Listening on port 3001</div>
                  <div>[2024-01-15 10:23:46] INFO: Connected to filesystem at /Users/liamalizadeh/code</div>
                  <div>[2024-01-15 10:23:47] INFO: Loaded 6 tools</div>
                  <div>[2024-01-15 10:24:12] INFO: Tool called: read_file {`{"path": "/src/index.ts"}`}</div>
                  <div>[2024-01-15 10:24:12] INFO: Successfully read file: 2048 bytes</div>
                  <div>[2024-01-15 10:24:34] INFO: Tool called: list_directory {`{"path": "/src/components"}`}</div>
                  <div>[2024-01-15 10:24:34] INFO: Listed 24 items</div>
                  <div>[2024-01-15 10:25:01] WARN: Rate limit approaching: 4500/5000 requests</div>
                  <div>[2024-01-15 10:25:15] INFO: Tool called: write_file {`{"path": "/src/test.ts"}`}</div>
                  <div>[2024-01-15 10:25:15] INFO: File written successfully</div>
                </div>
              </ScrollArea>
            </div>
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

            <div className="space-y-4">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}