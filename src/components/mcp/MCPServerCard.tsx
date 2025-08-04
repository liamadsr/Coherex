import React from 'react'
import { 
  Power,
  RefreshCw,
  Settings,
  Trash2,
  MoreHorizontal,
  Terminal,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Cpu,
  HardDrive,
  Zap,
  Code
} from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface MCPServer {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'running' | 'stopped' | 'error' | 'starting'
  version: string
  endpoint: string
  tools: { name: string; description: string }[]
  resources: {
    cpu: number
    memory: number
    requests: number
    errors: number
  }
  error?: string
  lastActive: Date
}

interface MCPServerCardProps {
  server: MCPServer
  onAction: (serverId: string, action: string) => void
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

export function MCPServerCard({ server, onAction }: MCPServerCardProps) {
  const StatusIcon = statusIcons[server.status]
  const Icon = server.icon

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-all duration-200 cursor-pointer",
        server.status === 'error' && "border-red-500"
      )}
      onClick={() => onAction(server.id, 'configure')}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{server.name}</h3>
                <Badge variant="outline" className="text-xs">
                  v{server.version}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{server.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={cn("capitalize", statusColors[server.status])}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {server.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {server.status === 'stopped' && (
                  <DropdownMenuItem onClick={() => onAction(server.id, 'start')}>
                    <Power className="mr-2 h-4 w-4" />
                    Start Server
                  </DropdownMenuItem>
                )}
                {server.status === 'running' && (
                  <>
                    <DropdownMenuItem onClick={() => onAction(server.id, 'stop')}>
                      <Power className="mr-2 h-4 w-4" />
                      Stop Server
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(server.id, 'restart')}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restart Server
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => onAction(server.id, 'configure')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction(server.id, 'logs')}>
                  <Terminal className="mr-2 h-4 w-4" />
                  View Logs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onAction(server.id, 'remove')}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Server
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {server.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              {server.error}
            </p>
          </div>
        )}

        {/* Resource Usage */}
        {server.status === 'running' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <Cpu className="w-4 h-4 mr-1" />
                CPU
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{server.resources.cpu}%</span>
                <Progress value={server.resources.cpu} className="flex-1 h-1" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <HardDrive className="w-4 h-4 mr-1" />
                Memory
              </div>
              <span className="font-medium">{server.resources.memory} MB</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <Zap className="w-4 h-4 mr-1" />
                Requests
              </div>
              <span className="font-medium">{server.resources.requests.toLocaleString()}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <AlertCircle className="w-4 h-4 mr-1" />
                Errors
              </div>
              <span className={cn(
                "font-medium",
                server.resources.errors > 0 && "text-red-600"
              )}>
                {server.resources.errors}
              </span>
            </div>
          </div>
        )}

        {/* Tools */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Available Tools ({server.tools.length})
            </p>
            <span className="text-xs text-gray-500">
              Last active {formatLastActive(server.lastActive)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {server.tools.slice(0, 3).map((tool, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Code className="w-3 h-3 mr-1" />
                {tool.name}
              </Badge>
            ))}
            {server.tools.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{server.tools.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Endpoint */}
        <div className="pt-2 border-t">
          <code className="text-xs text-gray-500 dark:text-gray-400 block truncate">
            {server.endpoint}
          </code>
        </div>
      </CardContent>
    </Card>
  )
}