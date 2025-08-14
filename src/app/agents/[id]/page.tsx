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
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Copy,
  Download,
  Activity,
  Calendar,
  RefreshCw,
  Info
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Agent, Conversation, AgentMetrics, ExecutionResult, DataSource, ActiveSession } from '@/types'
import { toast } from 'sonner'
import { useAgent, useUpdateAgent, useDeleteAgent, useConversations } from '@/hooks/queries'
import { MetricsChart } from '@/components/charts/MetricsChart'
import { ConversationDetail } from '@/components/conversations/ConversationDetail'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'


const statusColors: Record<Agent['status'] | 'draft' | 'paused' | 'archived', string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  error: 'bg-red-500',
  training: 'bg-yellow-500',
  draft: 'bg-blue-500',
  paused: 'bg-orange-500',
  archived: 'bg-gray-400',
}

const statusIcons: Record<Agent['status'] | 'draft' | 'paused' | 'archived', React.ComponentType<{ className?: string }>> = {
  active: CheckCircle,
  inactive: XCircle,
  error: AlertCircle,
  training: Clock,
  draft: Edit,
  paused: Pause,
  archived: Clock,
}

export default function AgentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string

  const [currentTab, setCurrentTab] = useState('overview')
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [testInput, setTestInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([])
  const [availableDataSources, setAvailableDataSources] = useState<DataSource[]>([])
  const [connectedDataSources, setConnectedDataSources] = useState<string[]>([])
  const [loadingDataSources, setLoadingDataSources] = useState(false)
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([])
  
  const { data: agent, isLoading: loading } = useAgent(agentId)
  const { data: conversations = [] } = useConversations({ agentId })
  const updateAgent = useUpdateAgent()
  const deleteAgent = useDeleteAgent()

  useEffect(() => {
    const loadMetrics = async () => {
      if (agentId) {
        try {
          // TODO: Replace with real metrics API when available
          // For now, use mock metrics
          setMetrics({
            totalConversations: 0,
            activeConversations: 0,
            avgResponseTime: 0,
            satisfactionScore: 0,
            successRate: 0,
            uptime: 100,
            errorsCount: 0,
            lastActive: new Date(),
          })
        } catch (error) {
          console.error('Error loading metrics:', error)
        }
      }
    }
    loadMetrics()
  }, [agentId])

  useEffect(() => {
    const loadExecutionHistory = async () => {
      if (agentId && currentTab === 'test') {
        try {
          const response = await fetch(`/api/agents/${agentId}/execute`)
          if (response.ok) {
            const data = await response.json()
            setExecutionHistory(data.executions || [])
          }
        } catch (error) {
          console.error('Error loading execution history:', error)
        }
      }
    }
    loadExecutionHistory()
  }, [agentId, currentTab, executionResult]) // Reload when new execution completes

  useEffect(() => {
    const loadDataSources = async () => {
      if (agentId && currentTab === 'configuration') {
        setLoadingDataSources(true)
        try {
          // Load available data sources
          const dsResponse = await fetch('/api/data-sources')
          if (dsResponse.ok) {
            const dsData = await dsResponse.json()
            setAvailableDataSources(dsData.dataSources || [])
          }

          // Load connected data sources for this agent
          const connResponse = await fetch(`/api/agents/${agentId}/data-sources`)
          if (connResponse.ok) {
            const connData = await connResponse.json()
            setConnectedDataSources(connData.dataSourceIds || [])
          }
        } catch (error) {
          console.error('Error loading data sources:', error)
        } finally {
          setLoadingDataSources(false)
        }
      }
    }
    loadDataSources()
  }, [agentId, currentTab])

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

  const handleExecuteAgent = async () => {
    if (!agent || !testInput.trim()) {
      toast.error('Please enter test input')
      return
    }

    setIsExecuting(true)
    setExecutionResult(null)

    try {
      // Include session ID if in persistent mode
      const requestBody: { input: string; options: Record<string, unknown>; sessionId?: string } = {
        input: testInput,
        options: {}
      }

      // If agent is in persistent mode and has an active session, include session ID
      if (agent.executionMode === 'persistent' && activeSession) {
        requestBody.sessionId = activeSession.id
      }

      const response = await fetch(`/api/agents/${agent.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (response.ok) {
        setExecutionResult(result)
        
        // Update conversation history for persistent mode
        if (agent.executionMode === 'persistent') {
          // Note: This would need proper conversation objects in a real implementation
          // For now, we'll skip updating conversation history to avoid type errors
          
          // Store session info if it's a new session
          if (!activeSession && result.sessionId) {
            setActiveSession({ 
              id: result.sessionId, 
              agentId: agentId,
              status: 'active',
              createdAt: new Date(),
              lastActivity: new Date()
            })
          }
          
          // Clear input for next message in persistent mode
          setTestInput('')
        }
        
        toast.success('Agent executed successfully')
      } else {
        toast.error(result.error || 'Failed to execute agent')
        setExecutionResult({ error: result.error, details: result.details })
      }
    } catch (error) {
      console.error('Execution error:', error)
      toast.error('Failed to execute agent')
      setExecutionResult({ error: 'Execution failed', details: error })
    } finally {
      setIsExecuting(false)
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

  const StatusIcon = statusIcons[agent.status as keyof typeof statusIcons] || statusIcons.draft || Bot

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
                      <div className={`w-2 h-2 rounded-full ${statusColors[agent.status as keyof typeof statusColors] || statusColors.draft}`} />
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
                  <DropdownMenuItem onClick={() => router.push(`/agents/new?edit=${agent.id}`)}>
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
          <TabsList className="grid w-full grid-cols-6 h-12 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="overview" className="h-10">Overview</TabsTrigger>
            <TabsTrigger value="test" className="h-10">Test Agent</TabsTrigger>
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
                    <h4 className="text-sm font-medium mb-3">Type</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        {(agent as any).config?.type || agent.type || 'custom'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Capabilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {(agent.capabilities || []).map((capability: string) => (
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
                        <span className="font-medium">{(agent as any).config?.model || agent.model || 'gpt-4'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span className="font-medium">{(agent as any).config?.temperature || agent.temperature || 0.7}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Tokens:</span>
                        <span className="font-medium">{(agent as any).config?.maxTokens || agent.maxTokens || 2000}</span>
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

          {/* Test Agent Tab */}
          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Test Agent Execution</CardTitle>
                    <CardDescription>
                      {agent?.executionMode === 'persistent' 
                        ? 'Have a conversation with your agent - context is maintained between messages'
                        : 'Test your agent by providing input and seeing the output'}
                    </CardDescription>
                  </div>
                  {agent?.executionMode === 'persistent' && (
                    <div className="flex items-center gap-2">
                      {activeSession ? (
                        <>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Session Active
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveSession(null)
                              setConversationHistory([])
                              toast.info('Session cleared. Next message will start a new session.')
                            }}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            New Session
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary">No Active Session</Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {agent?.executionMode === 'persistent' && (
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription>
                      <strong>Conversational Mode:</strong> Your agent maintains context for up to 1 hour. 
                      {activeSession 
                        ? 'Continue your conversation below or start a new session.'
                        : 'Send your first message to start a conversation.'}
                    </AlertDescription>
                  </Alert>
                )}

                {agent?.executionMode === 'persistent' && conversationHistory.length > 0 && (
                  <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900/50">
                    {conversationHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                          msg.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {agent?.executionMode === 'persistent' ? 'Message' : 'Input'}
                    </label>
                    <Textarea
                      placeholder={agent?.executionMode === 'persistent' 
                        ? "Type your message..." 
                        : "Enter your test input here..."}
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      className="min-h-[120px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && agent?.executionMode === 'persistent') {
                          e.preventDefault()
                          handleExecuteAgent()
                        }
                      }}
                    />
                  </div>

                  <Button
                    onClick={handleExecuteAgent}
                    disabled={isExecuting || !testInput.trim() || agent?.status === 'inactive'}
                    className="w-full"
                  >
                    {isExecuting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        {agent?.executionMode === 'persistent' ? 'Sending...' : 'Executing...'}
                      </>
                    ) : (
                      <>
                        {agent?.executionMode === 'persistent' ? (
                          <>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Run Agent
                          </>
                        )}
                      </>
                    )}
                  </Button>

                  {agent.status === 'inactive' && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        This agent is currently inactive. Activate it to run tests.
                      </p>
                    </div>
                  )}
                </div>

                {executionResult && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Execution Result</h4>
                      
                      {executionResult.error ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-red-800 dark:text-red-200">
                                {executionResult.error}
                              </p>
                              {executionResult.details && (
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                  {typeof executionResult.details === 'string' 
                                    ? executionResult.details 
                                    : JSON.stringify(executionResult.details, null, 2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              <span className="font-medium text-green-800 dark:text-green-200">
                                Execution Successful
                              </span>
                            </div>
                            {executionResult.duration && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Duration: {executionResult.duration}ms
                              </p>
                            )}
                          </div>

                          {executionResult.output && (
                            <div>
                              <h5 className="text-sm font-medium mb-2">Output</h5>
                              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <pre className="text-sm whitespace-pre-wrap font-mono">
                                  {typeof executionResult.output === 'string' 
                                    ? executionResult.output 
                                    : JSON.stringify(executionResult.output, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}

                          {executionResult.logs && executionResult.logs.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium mb-2">Logs</h5>
                              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-1">
                                {executionResult.logs.map((log: string, index: number) => (
                                  <p key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                    {log}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {executionResult.executionId && (
                            <p className="text-xs text-gray-500">
                              Execution ID: {executionResult.executionId}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Execution History */}
            {executionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Execution History</CardTitle>
                  <CardDescription>
                    Recent executions of this agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {executionHistory.map((execution) => (
                      <div
                        key={execution.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setExecutionResult({
                            success: execution.status === 'completed',
                            executionId: execution.id,
                            output: execution.output,
                            error: execution.status === 'failed' ? 'Execution failed' : null,
                            logs: execution.logs,
                            duration: execution.duration_ms,
                            timestamp: execution.completed_at || execution.started_at
                          })
                          setTestInput(execution.input || '')
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge
                                variant={
                                  execution.status === 'completed' ? 'default' :
                                  execution.status === 'failed' ? 'destructive' :
                                  execution.status === 'running' ? 'secondary' :
                                  'outline'
                                }
                              >
                                {execution.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(execution.created_at).toLocaleString()}
                              </span>
                              {execution.duration_ms && (
                                <span className="text-xs text-gray-500">
                                  ({execution.duration_ms}ms)
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              <span className="font-medium">Input:</span> {execution.input}
                            </p>
                            {execution.output && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                <span className="font-medium">Output:</span> {typeof execution.output === 'string' ? execution.output : JSON.stringify(execution.output)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
                        <span>{(agent as any).config?.model || agent.model || 'gpt-4'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span>{(agent as any).config?.temperature || agent.temperature || 0.7}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Tokens:</span>
                        <span>{(agent as any).config?.maxTokens || agent.maxTokens || 2000}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">System Prompt</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm font-mono whitespace-pre-wrap">{(agent as any).config?.systemPrompt || agent.systemPrompt || 'No system prompt configured'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Connected Data Sources</h4>
                  <div className="space-y-3">
                    {loadingDataSources ? (
                      <div className="text-sm text-gray-500">Loading data sources...</div>
                    ) : availableDataSources.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No data sources available. <a href="/knowledge/sources" className="text-blue-600 hover:underline">Create one</a>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableDataSources.map((source) => {
                          const isConnected = connectedDataSources.includes(source.id)
                          return (
                            <div key={source.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50">
                              <Checkbox
                                checked={isConnected}
                                onCheckedChange={async (checked) => {
                                  try {
                                    const method = checked ? 'POST' : 'DELETE'
                                    const response = await fetch(`/api/agents/${agentId}/data-sources`, {
                                      method,
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ dataSourceId: source.id })
                                    })
                                    
                                    if (response.ok) {
                                      if (checked) {
                                        setConnectedDataSources([...connectedDataSources, source.id])
                                        toast.success(`Connected to ${source.name}`)
                                      } else {
                                        setConnectedDataSources(connectedDataSources.filter(id => id !== source.id))
                                        toast.success(`Disconnected from ${source.name}`)
                                      }
                                    } else {
                                      toast.error('Failed to update data source connection')
                                    }
                                  } catch (error) {
                                    console.error('Error updating data source:', error)
                                    toast.error('Failed to update data source connection')
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{source.name}</p>
                                <p className="text-xs text-gray-500">
                                  {source.type} • {source.description || 'No description'}
                                </p>
                              </div>
                              <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                                {source.status}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    )}
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