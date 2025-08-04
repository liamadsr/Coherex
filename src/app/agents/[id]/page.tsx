'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Bot, 
  ArrowLeft, 
  Settings, 
  Play, 
  Pause, 
  MoreHorizontal,
  MessageSquare,
  BarChart3,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Copy,
  Download,
  Mail,
  Phone,
  Slack,
  Globe,
  Activity,
  Calendar,
  Zap
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Agent, Conversation, AgentMetrics } from '@/types'
import { toast } from 'sonner'
import { useAgent, useUpdateAgent, useDeleteAgent, useConversations } from '@/hooks/queries'
import { mockApi } from '@/mock-data'
import { MetricsChart } from '@/components/charts/MetricsChart'
import { ConversationDetail } from '@/components/conversations/ConversationDetail'

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  slack: Slack,
  'web-chat': MessageSquare,
  phone: Phone,
  api: Globe,
}

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  error: 'bg-red-500',
  training: 'bg-yellow-500',
}

const statusIcons = {
  active: CheckCircle,
  inactive: XCircle,
  error: AlertCircle,
  training: Clock,
}

export default function AgentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string

  const [currentTab, setCurrentTab] = useState('overview')
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  
  const { data: agent, isLoading: loading } = useAgent(agentId)
  const { data: conversations = [] } = useConversations({ agentId })
  const updateAgent = useUpdateAgent()
  const deleteAgent = useDeleteAgent()

  useEffect(() => {
    const loadMetrics = async () => {
      if (agentId) {
        try {
          const metricsData = await mockApi.getAgentMetrics(agentId)
          setMetrics(metricsData)
        } catch (error) {
          console.error('Error loading metrics:', error)
        }
      }
    }
    loadMetrics()
  }, [agentId])

  const handleToggleStatus = async () => {
    if (!agent) return
    
    const newStatus = agent.status === 'active' ? 'inactive' : 'active'
    await updateAgent.mutateAsync({ 
      id: agent.id, 
      data: { status: newStatus } 
    })
  }

  const handleDeleteAgent = async () => {
    if (!agent) return
    
    if (confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      await deleteAgent.mutateAsync(agent.id)
      router.push('/agents')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!agent) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The agent you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/agents')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agents
          </Button>
        </div>
      </MainLayout>
    )
  }

  const StatusIcon = statusIcons[agent.status]

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
                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  {agent.avatar ? (
                    <span className="text-3xl">{agent.avatar}</span>
                  ) : (
                    <span className="text-xl font-medium">{agent.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">{agent.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{agent.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Created {new Date(agent.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant={agent.status === 'active' ? 'destructive' : 'default'}
                onClick={handleToggleStatus}
              >
                {agent.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/agents/${agent.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Agent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(agent.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Agent ID
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export Configuration
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteAgent} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Agent
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-12 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="overview" className="h-10">Overview</TabsTrigger>
            <TabsTrigger value="conversations" className="h-10">Conversations</TabsTrigger>
            <TabsTrigger value="analytics" className="h-10">Analytics</TabsTrigger>
            <TabsTrigger value="configuration" className="h-10">Configuration</TabsTrigger>
            <TabsTrigger value="logs" className="h-10">Activity Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalConversations || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.successRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.avgResponseTime || 0}s</div>
                  <p className="text-xs text-muted-foreground">
                    -0.5s from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +8 this week
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Agent Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                  <CardDescription>Current agent settings and capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Channels</h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.channels.map((channel) => {
                        const Icon = channelIcons[channel] || Globe
                        return (
                          <Badge key={channel} variant="secondary" className="flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {channel.replace('-', ' ')}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Capabilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline">
                          {capability.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Model Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span className="font-medium">{agent.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span className="font-medium">{agent.temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Tokens:</span>
                        <span className="font-medium">{agent.maxTokens}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest interactions and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conversations.slice(0, 5).map((conversation) => (
                      <div key={conversation.id} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {conversation.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {conversation.user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-6">
            {selectedConversation ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Conversation Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to List
                  </Button>
                </div>
                <div className="h-[600px]">
                  <ConversationDetail 
                    conversation={selectedConversation}
                    onClose={() => setSelectedConversation(null)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Conversations</h3>
                  <Badge variant="secondary">{conversations.length} total</Badge>
                </div>
                <div className="grid gap-4">
                  {conversations.map((conversation) => (
                    <Card 
                      key={conversation.id} 
                      className="cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{conversation.user.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{conversation.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={conversation.status === 'resolved' ? 'secondary' : 'default'}>
                              {conversation.status}
                            </Badge>
                            <div className="text-sm text-gray-500">
                              {new Date(conversation.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {conversation.lastMessage}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span>{conversation.messageCount} messages</span>
                            <span>•</span>
                            <span>Channel: {conversation.channel}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <MetricsChart agentId={agent.id} metrics={metrics} />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>
                  Detailed configuration settings for this agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{agent.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{agent.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">AI Model Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span>{agent.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span>{agent.temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Tokens:</span>
                        <span>{agent.maxTokens}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">System Prompt</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm font-mono whitespace-pre-wrap">{agent.systemPrompt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Recent agent activities and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Activity className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Agent activated</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Processed 15 new conversations</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Settings className="w-4 h-4 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Configuration updated</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}