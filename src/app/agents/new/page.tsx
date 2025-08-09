'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Bot, 
  ArrowLeft, 
  ArrowRight,
  ArrowUp,
  Plus, 
  X, 
  Loader2,
  Save,
  Sparkles,
  MessageSquare,
  Brain,
  Zap,
  Users,
  Mail,
  Phone,
  Slack,
  Globe,
  FileText,
  Database,
  Code,
  Palette,
  Settings,
  Sliders,
  Paperclip,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Send,
  Check,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Activity,
  Play,
  Square,
  Copy,
  ThumbsDown,
  ThumbsUp,
  Image,
  Terminal,
  ScrollText
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { mockApi } from '@/mock-data'
import { toast } from 'sonner'
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import { DotsLoader } from "@/components/prompt-kit/loader"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/prompt-kit/message"
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"
import { cn } from "@/lib/utils"

const agentSchema = z.object({
  name: z.string().min(2, 'Agent name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  executionMode: z.enum(['ephemeral', 'persistent']).default('ephemeral'),
  channels: z.array(z.string()).min(1, 'Select at least one communication channel'),
  channelConfig: z.record(z.string(), z.any()).optional(),
  knowledgeSources: z.array(z.string()).optional(),
  mcpServers: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  model: z.string().min(1, 'Please select an AI model'),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(4000),
  systemPrompt: z.string().min(20, 'System prompt must be at least 20 characters'),
})

type AgentFormData = z.infer<typeof agentSchema>

const knowledgeSources = [
  { id: 'ks-1', name: 'SharePoint Operations Processes', type: 'sharepoint', icon: FileText, documents: 1247 },
  { id: 'ks-2', name: 'Product Documentation', type: 'confluence', icon: FileText, documents: 892 },
  { id: 'ks-3', name: 'Customer Support FAQs', type: 'database', icon: Database, documents: 445 },
  { id: 'ks-4', name: 'API Reference', type: 'github', icon: Code, documents: 156 },
  { id: 'ks-5', name: 'Company Policies', type: 'google-drive', icon: FileText, documents: 89 },
  { id: 'ks-6', name: 'Technical Specifications', type: 'notion', icon: FileText, documents: 234 },
]

const mcpServers = [
  { id: 'mcp-filesystem', name: 'Filesystem', description: 'File operations (read, write, delete)', icon: FileText },
  { id: 'mcp-github', name: 'GitHub', description: 'Repository interactions', icon: Code },
  { id: 'mcp-postgres', name: 'PostgreSQL', description: 'Database operations', icon: Database },
  { id: 'mcp-slack', name: 'Slack', description: 'Send messages and manage channels', icon: Slack },
  { id: 'mcp-browser', name: 'Web Browser', description: 'Browser automation', icon: Globe },
]

const integrations = [
  { id: 'int-hubspot', name: 'HubSpot', category: 'CRM', icon: Users },
  { id: 'int-salesforce', name: 'Salesforce', category: 'CRM', icon: Users },
  { id: 'int-zendesk', name: 'Zendesk', category: 'Support', icon: MessageSquare },
  { id: 'int-jira', name: 'Jira', category: 'Project Management', icon: Zap },
  { id: 'int-notion', name: 'Notion', category: 'Knowledge Base', icon: FileText },
  { id: 'int-teams', name: 'Microsoft Teams', category: 'Communication', icon: Users },
]

const channels = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'slack', label: 'Slack', icon: Slack },
  { id: 'teams', label: 'Microsoft Teams', icon: Users },
  { id: 'web-chat', label: 'Web Chat', icon: MessageSquare },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'api', label: 'API', icon: Code },
]

const aiModels = [
  { id: 'gpt-4', label: 'GPT-4', description: 'Most capable model for complex tasks' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
  { id: 'claude-3', label: 'Claude 3', description: 'Excellent for analysis and reasoning' },
  { id: 'gemini-pro', label: 'Gemini Pro', description: 'Google\'s most capable model' },
]

export default function NewAgentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState('basic')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant' | 'system', content: string, id?: string }>>([])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [autoClear, setAutoClear] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [environmentStatus, setEnvironmentStatus] = useState<'idle' | 'starting' | 'running' | 'stopping'>('idle')
  const [environmentStartTime, setEnvironmentStartTime] = useState<Date | null>(null)
  const [testPanelView, setTestPanelView] = useState<'chat' | 'logs'>('chat')
  const [executionLogs, setExecutionLogs] = useState<Array<{ timestamp: string, type: 'info' | 'error' | 'warning' | 'success', message: string }>>([])
  const [testSessionId, setTestSessionId] = useState<string | null>(null)
  const [runningExecutionMode, setRunningExecutionMode] = useState<'ephemeral' | 'persistent' | null>(null)
  const [runningModel, setRunningModel] = useState<string | null>(null)
  const [runningTemperature, setRunningTemperature] = useState<number | null>(null)
  const [runningMaxTokens, setRunningMaxTokens] = useState<number | null>(null)
  const [showModelMenu, setShowModelMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const logsScrollRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    mode: 'onChange',
    defaultValues: {
      executionMode: 'ephemeral',
      channels: [],
      knowledgeSources: [],
      mcpServers: [],
      integrations: [],
      model: 'gpt-4',  // Add default model
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful AI assistant. Be professional, accurate, and helpful in all your responses.',
    }
  })

  const watchedChannels = watch('channels') || []
  const watchedKnowledgeSources = watch('knowledgeSources') || []
  const watchedMcpServers = watch('mcpServers') || []
  const watchedIntegrations = watch('integrations') || []
  const watchedTemperature = watch('temperature')
  const watchedMaxTokens = watch('maxTokens')
  const watchedExecutionMode = watch('executionMode')
  const watchedModel = watch('model')
  
  // Check if restart is needed
  const restartNeeded = environmentStatus === 'running' && (
    (runningExecutionMode !== null && runningExecutionMode !== watchedExecutionMode) ||
    (runningModel !== null && runningModel !== watchedModel) ||
    (runningTemperature !== null && runningTemperature !== watchedTemperature) ||
    (runningMaxTokens !== null && runningMaxTokens !== watchedMaxTokens)
  )

  const toggleSelection = (field: 'channels' | 'knowledgeSources' | 'mcpServers' | 'integrations', value: string) => {
    const currentValues = getValues(field) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value]
    setValue(field, newValues, { shouldValidate: true })
  }

  const onSubmit = async (data: AgentFormData) => {
    setIsLoading(true)
    try {
      // Create agent configuration that matches both config format AND database columns
      const config = {
        name: data.name,
        description: data.description,
        type: 'custom' as const,
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        systemPrompt: data.systemPrompt,
        tools: [],
        dataSources: data.knowledgeSources || [],
        outputFormat: 'json' as const,
        settings: {
          channels: data.channels,
          mcpServers: data.mcpServers || [],
          integrations: data.integrations || []
        }
      }

      // Save to database via API
      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          config,
          status: 'draft'
        })
      })

      // Actually, let me use the correct endpoint
      const agentResponse = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          execution_mode: data.executionMode,
          channels: data.channels,
          model: data.model,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          systemPrompt: data.systemPrompt,
          knowledgeSources: data.knowledgeSources || [],
          config,
          status: 'draft'
        })
      })

      if (agentResponse.ok) {
        const result = await agentResponse.json()
        toast.success('Agent created successfully!')
        router.push(`/agents/${result.agent.id}`)
      } else {
        const error = await agentResponse.json()
        toast.error(error.error || 'Failed to create agent')
      }
    } catch (error) {
      console.error('Error creating agent:', error)
      toast.error('Failed to create agent. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getTemperatureLabel = (temp: number) => {
    if (temp <= 0.3) return 'Focused & Deterministic'
    if (temp <= 0.7) return 'Balanced'
    if (temp <= 1.2) return 'Creative'
    return 'Very Creative'
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollButton(!isNearBottom)
      }
    }

    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll)
      return () => scrollArea.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-enable clear for ephemeral mode
  useEffect(() => {
    if (watchedExecutionMode === 'ephemeral') {
      setAutoClear(true)
    }
    // Don't automatically disable for persistent mode - let user control it
  }, [watchedExecutionMode])

  // Timer update effect
  useEffect(() => {
    if (environmentStatus === 'running' && environmentStartTime) {
      const interval = setInterval(() => {
        // Force re-render to update timer
        setEnvironmentStartTime(new Date(environmentStartTime))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [environmentStatus, environmentStartTime])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addLog = (type: 'info' | 'error' | 'warning' | 'success', message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false })
    setExecutionLogs(prev => [...prev, { timestamp, type, message }])
    
    // Auto-scroll logs to bottom
    setTimeout(() => {
      if (logsScrollRef.current) {
        logsScrollRef.current.scrollTop = logsScrollRef.current.scrollHeight
      }
    }, 10)
  }

  const startEnvironment = () => {
    if (!watchedModel) {
      toast.error('Please select an AI model first')
      return
    }
    
    // Start the environment
    setEnvironmentStatus('starting')
    setEnvironmentStartTime(new Date())
    setExecutionLogs([]) // Clear previous logs
    setMessages([]) // Clear chat messages
    
    // Generate session ID for conversational mode
    const formData = getValues()
    setRunningExecutionMode(formData.executionMode) // Track what mode is running
    setRunningModel(formData.model) // Track what model is running
    setRunningTemperature(formData.temperature) // Track temperature
    setRunningMaxTokens(formData.maxTokens) // Track max tokens
    
    if (formData.executionMode === 'persistent') {
      const sessionId = `test-session-${Date.now()}`
      setTestSessionId(sessionId)
      addLog('info', `Creating conversation session: ${sessionId}`)
    }
    
    addLog('info', 'Initializing E2B sandbox environment...')
    addLog('info', `Model: ${watchedModel || 'gpt-4'}`)
    addLog('info', `Mode: ${formData.executionMode === 'persistent' ? 'Conversational (maintains context)' : 'Ephemeral (stateless)'}`)
    addLog('info', 'Installing required packages...')
    
    // Simulate environment startup
    setTimeout(() => {
      addLog('success', 'Environment packages installed')
      addLog('info', 'Loading agent configuration...')
      addLog('success', 'Agent environment ready')
      setEnvironmentStatus('running')
      toast.success('Agent environment is ready! Start testing in the panel.')
      
      // Focus on the test panel input
      const testInput = document.querySelector('textarea[placeholder*="Test your agent"]') as HTMLTextAreaElement
      if (testInput) {
        testInput.focus()
      }
    }, 1500)
  }

  const stopEnvironment = (callback?: () => void) => {
    setEnvironmentStatus('stopping')
    addLog('warning', 'Shutting down environment...')
    
    // Clear session for conversational mode
    if (testSessionId) {
      addLog('info', `Clearing conversation session: ${testSessionId}`)
      
      // Call cleanup endpoint to close sandbox
      fetch('/api/agents/test-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: testSessionId })
      }).catch(err => console.error('Cleanup error:', err))
      
      setTestSessionId(null)
    }
    
    setTimeout(() => {
      addLog('info', 'Environment terminated')
      setEnvironmentStatus('idle')
      setEnvironmentStartTime(null)
      setRunningExecutionMode(null) // Clear running mode
      setRunningModel(null) // Clear running model
      setRunningTemperature(null) // Clear running temperature
      setRunningMaxTokens(null) // Clear running max tokens
      toast.info('Agent environment stopped')
      if (callback) callback()
    }, 500)
  }

  const restartEnvironment = () => {
    addLog('info', 'Restarting environment...')
    stopEnvironment(() => {
      setTimeout(() => {
        startEnvironment()
      }, 200)
    })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Check if environment is running
    if (environmentStatus !== 'running') {
      toast.error('Please start the agent environment first')
      return
    }

    // Check if model is selected
    const formData = getValues()
    if (!formData.model) {
      toast.error('Please select an AI model before testing')
      return
    }

    const userMessage = inputValue
    setInputValue('')
    setAttachedFiles([])
    
    // If auto-clear is enabled, start fresh
    if (autoClear) {
      setMessages([{ role: 'user', content: userMessage, id: Date.now().toString() }])
    } else {
      setMessages(prev => [...prev, { role: 'user', content: userMessage, id: Date.now().toString() }])
    }
    
    setIsThinking(true)
    
    // Add log for message sent
    addLog('info', `User message: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`)
    addLog('info', 'Sending to agent for processing...')

    try {      
      // Create a test agent configuration
      const testConfig = {
        name: formData.name || 'Test Agent',
        description: formData.description || 'Test agent for trying configurations',
        type: 'custom' as const,
        model: formData.model,
        temperature: formData.temperature || 0.7,
        maxTokens: formData.maxTokens || 2000,
        systemPrompt: formData.systemPrompt || 'You are a helpful AI assistant.',
        executionMode: formData.executionMode || 'ephemeral'
      }

      // Build conversation history for conversational mode
      const conversationHistory = formData.executionMode === 'persistent' && !autoClear
        ? messages.filter(m => m.role !== 'system')
        : []
      
      // Call the test execution endpoint
      const response = await fetch('/api/agents/test-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: testConfig,
          input: userMessage,
          sessionId: testSessionId,
          conversationHistory: conversationHistory
        })
      })

      const result = await response.json()

      if (result.output) {
        // We got an output (either real or mock)
        addLog('success', 'Response received from agent')
        
        // Log execution time if available
        if (result.executionTime) {
          addLog('info', `Execution time: ${result.executionTime}ms`)
        }
        
        // Add any E2B logs if available
        if (result.logs) {
          if (typeof result.logs === 'object' && result.logs.stdout) {
            result.logs.stdout.forEach((log: string) => {
              addLog('info', `[stdout] ${log}`)
            })
          }
          if (typeof result.logs === 'object' && result.logs.stderr) {
            result.logs.stderr.forEach((log: string) => {
              addLog('warning', `[stderr] ${log}`)
            })
          }
        }
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: typeof result.output === 'string' ? result.output : JSON.stringify(result.output),
          id: Date.now().toString()
        }])
        
        // Show info if it was a mock response
        if (result.error?.includes('E2B sandbox service not configured')) {
          addLog('warning', 'E2B not configured - using mock response')
          setMessages(prev => [...prev, { 
            role: 'system', 
            content: 'Note: E2B sandbox not configured. This was a simulated response. To get real LLM responses, ensure E2B_API_KEY is set in your environment.',
            id: (Date.now() + 1).toString()
          }])
        }
      } else if (response.ok && !result.output) {
        // No output but successful - shouldn't happen
        const aiResponse = generateAIResponse(userMessage, formData)
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse, id: Date.now().toString() }])
      } else {
        // Error case - use fallback
        addLog('error', 'Failed to get response from agent')
        if (result.error) {
          addLog('error', result.error)
        }
        
        const aiResponse = generateAIResponse(userMessage, formData)
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse, id: Date.now().toString() }])
        
        if (result.error) {
          console.warn('Test execution issue:', result.error)
          if (result.details) {
            console.warn('Details:', result.details)
          }
        }
      }
    } catch (error) {
      console.error('Failed to test agent:', error)
      addLog('error', `Failed to test agent: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Fallback to simulated response
      const aiResponse = generateAIResponse(userMessage, getValues())
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse, id: Date.now().toString() }])
    } finally {
      setIsThinking(false)
    }
  }

  const generateAIResponse = (userMessage: string, formData: any) => {
    // Simulate agent response based on configured resources and capabilities
    const agentName = formData.name || "Your Agent"
    const knowledgeSources = formData.knowledgeSources || []
    const mcpServers = formData.mcpServers || []
    const integrations = formData.integrations || []
    
    // Create response based on agent configuration
    let response = `Hello! I'm ${agentName}. `
    
    // Add knowledge source awareness
    if (knowledgeSources.length > 0) {
      const sourceNames = knowledgeSources.map((id: string) => {
        const source = knowledgeSources.find(ks => ks.id === id)
        return source?.name || id
      }).slice(0, 2).join(' and ')
      response += `I have access to ${sourceNames} to help answer your questions. `
    }
    
    // Add MCP capabilities
    if (mcpServers.includes('mcp-filesystem')) {
      response += "I can help you manage files and folders. "
    } else if (mcpServers.includes('mcp-github')) {
      response += "I can interact with GitHub repositories. "
    } else if (mcpServers.includes('mcp-postgres')) {
      response += "I can query and manage PostgreSQL databases. "
    }
    
    // Add integration mentions
    if (integrations.includes('int-hubspot')) {
      response += "I'm connected to HubSpot for CRM operations. "
    } else if (integrations.includes('int-zendesk')) {
      response += "I can help with Zendesk tickets and support issues. "
    }
    
    // Default ending
    return response + "How can I assist you today?"
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Builder</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure, test, and refine your AI assistant before creating
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => toast.info('Save as draft feature coming soon!')}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                title={isValid ? "Save this agent to your workspace" : "Complete all required fields first"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Agent
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
          {/* Left Panel - Configuration */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardContent className="p-6 flex-1 overflow-hidden flex flex-col">
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col min-h-0">
                  <TabsList className="grid w-full grid-cols-3 h-10 bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg mb-6">
                    <TabsTrigger value="basic" className="text-xs font-medium">Interaction</TabsTrigger>
                    <TabsTrigger value="personality" className="text-xs font-medium">Resources</TabsTrigger>
                    <TabsTrigger value="capabilities" className="text-xs font-medium">Capabilities</TabsTrigger>
                  </TabsList>

                  {/* Interaction Tab */}
                  <TabsContent value="basic" className="space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Agent Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g., Customer Support Sarah"
                          className="h-9"
                          {...register('name')}
                        />
                        {errors.name && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                          Description *
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe what this agent does..."
                          rows={3}
                          className="resize-none text-sm"
                          {...register('description')}
                        />
                        {errors.description && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.description.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Execution Mode
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Choose how your agent handles conversations
                        </p>
                        <div className="space-y-3">
                          <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              watchedExecutionMode === 'ephemeral' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setValue('executionMode', 'ephemeral', { shouldValidate: true })}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <Zap className={`w-5 h-5 ${
                                  watchedExecutionMode === 'ephemeral' 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Ephemeral Mode
                                  </h4>
                                  <Badge variant="secondary" className="text-xs">
                                    Recommended for email & webhooks
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  Perfect for single-response scenarios like emails, form submissions, or API calls. 
                                  The agent processes the request, provides a response, and immediately shuts down. 
                                  Cost-efficient and ideal for tasks that don't require conversation history.
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Instant response
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> No state maintained
                                  </span>
                                </div>
                              </div>
                              {watchedExecutionMode === 'ephemeral' && (
                                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          </div>

                          <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              watchedExecutionMode === 'persistent' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setValue('executionMode', 'persistent', { shouldValidate: true })}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <MessageSquare className={`w-5 h-5 ${
                                  watchedExecutionMode === 'persistent' 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Conversational Mode
                                  </h4>
                                  <Badge variant="secondary" className="text-xs">
                                    Best for chat & support
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  Ideal for ongoing conversations like customer support, chatbots, or interactive assistants. 
                                  The agent stays active for up to 1 hour, maintaining conversation context between messages. 
                                  Perfect for multi-turn dialogues where context matters.
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Stays active for 1 hour
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> Maintains context
                                  </span>
                                </div>
                              </div>
                              {watchedExecutionMode === 'persistent' && (
                                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          </div>
                        </div>
                        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <AlertDescription className="text-xs text-gray-700 dark:text-gray-300">
                            You can change the execution mode later in agent settings. Conversational mode uses 
                            more resources but provides a better experience for interactive use cases.
                          </AlertDescription>
                        </Alert>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Communication Channels *
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          Select how this agent will interact with your organization
                        </p>
                        <div className="space-y-3">
                          {channels.map((channel) => {
                            const Icon = channel.icon
                            const isSelected = watchedChannels.includes(channel.id)
                            return (
                              <div key={channel.id} className="space-y-2">
                                <Button
                                  type="button"
                                  variant={isSelected ? 'default' : 'outline'}
                                  size="sm"
                                  className="w-full justify-start h-10"
                                  onClick={() => toggleSelection('channels', channel.id)}
                                >
                                  <Icon className="w-4 h-4 mr-3" />
                                  <span className="text-sm font-medium">{channel.label}</span>
                                  {isSelected && (
                                    <Check className="w-4 h-4 ml-auto" />
                                  )}
                                </Button>
                                
                                {isSelected && (
                                  <div className="ml-7 space-y-2 p-3 bg-gray-50 dark:bg-neutral-900 rounded-md">
                                    {channel.id === 'email' && (
                                      <div className="space-y-2">
                                        <Label htmlFor={`${channel.id}-address`} className="text-xs">
                                          Email Address
                                        </Label>
                                        <div className="flex gap-2">
                                          <Input
                                            id={`${channel.id}-address`}
                                            type="email"
                                            placeholder="agent@yourcompany.com"
                                            className="h-8 text-xs flex-1"
                                            {...register(`channelConfig.${channel.id}.address` as any)}
                                          />
                                          <Button 
                                            type="button" 
                                            size="sm" 
                                            variant="outline"
                                            className="h-8 text-xs"
                                            onClick={() => toast.info('Email provisioning coming soon!')}
                                          >
                                            Generate
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {channel.id === 'phone' && (
                                      <div className="space-y-2">
                                        <Label htmlFor={`${channel.id}-number`} className="text-xs">
                                          Phone Number
                                        </Label>
                                        <div className="flex gap-2">
                                          <Input
                                            id={`${channel.id}-number`}
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            className="h-8 text-xs flex-1"
                                            {...register(`channelConfig.${channel.id}.number` as any)}
                                          />
                                          <Button 
                                            type="button" 
                                            size="sm" 
                                            variant="outline"
                                            className="h-8 text-xs"
                                            onClick={() => toast.info('Phone number provisioning coming soon!')}
                                          >
                                            Assign
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {channel.id === 'slack' && (
                                      <div className="space-y-2">
                                        <Label className="text-xs">Slack Integration</Label>
                                        <Button 
                                          type="button" 
                                          size="sm" 
                                          variant="outline"
                                          className="w-full h-8 text-xs"
                                          onClick={() => toast.info('Slack integration coming soon!')}
                                        >
                                          <Slack className="w-3 h-3 mr-2" />
                                          Connect to Slack Workspace
                                        </Button>
                                        <Input
                                          placeholder="Channel name (optional)"
                                          className="h-8 text-xs"
                                          {...register(`channelConfig.${channel.id}.channel` as any)}
                                        />
                                      </div>
                                    )}
                                    
                                    {channel.id === 'teams' && (
                                      <div className="space-y-2">
                                        <Label className="text-xs">Microsoft Teams Integration</Label>
                                        <Button 
                                          type="button" 
                                          size="sm" 
                                          variant="outline"
                                          className="w-full h-8 text-xs"
                                          onClick={() => toast.info('Teams integration coming soon!')}
                                        >
                                          <Users className="w-3 h-3 mr-2" />
                                          Connect to Teams
                                        </Button>
                                        <Input
                                          placeholder="Team/Channel name (optional)"
                                          className="h-8 text-xs"
                                          {...register(`channelConfig.${channel.id}.channel` as any)}
                                        />
                                      </div>
                                    )}
                                    
                                    {channel.id === 'web-chat' && (
                                      <div className="space-y-2">
                                        <Label className="text-xs">Widget Configuration</Label>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                          Embed code will be generated after agent creation
                                        </div>
                                      </div>
                                    )}
                                    
                                    {channel.id === 'api' && (
                                      <div className="space-y-2">
                                        <Label className="text-xs">API Configuration</Label>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                          API key and endpoint will be generated after agent creation
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {errors.channels && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.channels.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Resources Tab */}
                  <TabsContent value="personality" className="space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Knowledge Sources
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Select knowledge sources this agent can access
                        </p>
                        <div className="space-y-2">
                          {knowledgeSources.map((source) => {
                            const Icon = source.icon
                            const isSelected = watchedKnowledgeSources.includes(source.id)
                            return (
                              <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium">{source.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{source.type} • {source.documents} documents</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant={isSelected ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => toggleSelection('knowledgeSources', source.id)}
                                >
                                  {isSelected ? 'Added' : 'Add'}
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                        {errors.knowledgeSources && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.knowledgeSources.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="systemPrompt" className="text-sm font-medium">
                          System Prompt *
                        </Label>
                        <Textarea
                          id="systemPrompt"
                          placeholder="You are a helpful AI assistant..."
                          rows={5}
                          className="resize-none text-sm"
                          {...register('systemPrompt')}
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          This prompt defines your agent's core behavior
                        </p>
                        {errors.systemPrompt && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.systemPrompt.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Capabilities Tab */}
                  <TabsContent value="capabilities" className="space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          MCP Servers
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Select MCP servers to give your agent additional capabilities
                        </p>
                        <div className="space-y-2">
                          {mcpServers.map((server) => {
                            const Icon = server.icon
                            const isSelected = watchedMcpServers.includes(server.id)
                            return (
                              <div key={server.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium">{server.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{server.description}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant={isSelected ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => toggleSelection('mcpServers', server.id)}
                                >
                                  {isSelected ? 'Enabled' : 'Enable'}
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                        {errors.mcpServers && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.mcpServers.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Integrations
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Connect external services for enhanced functionality
                        </p>
                        <div className="space-y-2">
                          {integrations.map((integration) => {
                            const Icon = integration.icon
                            const isSelected = watchedIntegrations.includes(integration.id)
                            return (
                              <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium">{integration.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{integration.category}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant={isSelected ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => toggleSelection('integrations', integration.id)}
                                >
                                  {isSelected ? 'Connected' : 'Connect'}
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                        {errors.integrations && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.integrations.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - AI Assistant Style Test Panel */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full bg-white dark:bg-[#0c0c0c] rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {/* Minimal Header */}
              <div className="border-b border-gray-200 dark:border-neutral-800/50">
                {/* Top row with title and controls */}
                <div className="flex items-center justify-between px-4 py-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Testing</h3>
                  
                  {/* Environment Controls - more subtle */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={restartEnvironment}
                      disabled={!restartNeeded}
                      className={cn(
                        "h-7 w-7 p-0",
                        restartNeeded 
                          ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 animate-pulse" 
                          : "text-muted-foreground/50 cursor-not-allowed"
                      )}
                      title={
                        restartNeeded 
                          ? "Restart to apply changes" 
                          : "No changes to apply"}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => stopEnvironment()}
                      disabled={environmentStatus !== 'running'}
                      className={cn(
                        "h-7 w-7 p-0",
                        environmentStatus === 'running' 
                          ? "text-red-500 hover:text-red-600 hover:bg-red-500/10" 
                          : "text-muted-foreground/50 cursor-not-allowed"
                      )}
                      title="Stop environment"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={startEnvironment}
                      disabled={environmentStatus !== 'idle' || !watchedModel}
                      className={cn(
                        "h-7 w-7 p-0",
                        environmentStatus === 'idle' && watchedModel 
                          ? "text-green-500 hover:text-green-600 hover:bg-green-500/10" 
                          : "text-muted-foreground/50 cursor-not-allowed"
                      )}
                      title={!watchedModel ? "Select a model first" : "Start environment"}
                    >
                      <Play className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                
                {/* View tabs and status - cleaner style */}
                <div className="flex items-center justify-between px-4 pb-2">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setTestPanelView('chat')}
                      className={cn(
                        "text-sm font-medium transition-colors relative pb-0.5",
                        testPanelView === 'chat' 
                          ? "text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Chat
                      {testPanelView === 'chat' && (
                        <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </button>
                    <button
                      onClick={() => setTestPanelView('logs')}
                      className={cn(
                        "text-sm font-medium transition-colors relative pb-0.5",
                        testPanelView === 'logs' 
                          ? "text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Logs
                      {executionLogs.length > 0 && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          ({executionLogs.length})
                        </span>
                      )}
                      {testPanelView === 'logs' && (
                        <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </button>
                  </div>
                  
                  {/* Environment Status - more subtle */}
                  {environmentStatus !== 'idle' && (
                    <div className="flex items-center gap-3 text-xs">
                      {/* Timer - now on the left */}
                      {environmentStartTime && environmentStatus === 'running' && (
                        <span className="text-muted-foreground">
                          {(() => {
                            const elapsed = Math.floor((Date.now() - environmentStartTime.getTime()) / 1000)
                            const minutes = Math.floor(elapsed / 60)
                            const seconds = elapsed % 60
                            return `${minutes}:${seconds.toString().padStart(2, '0')}`
                          })()}
                        </span>
                      )}
                      {environmentStatus === 'running' && (
                        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-500">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-600"></span>
                          </span>
                          Running
                        </span>
                      )}
                      {environmentStatus === 'starting' && (
                        <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Starting
                        </span>
                      )}
                      {environmentStatus === 'stopping' && (
                        <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Stopping
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Container */}
              {testPanelView === 'chat' ? (
                <ChatContainerRoot ref={scrollAreaRef} className="relative flex-1 space-y-0 overflow-y-auto">
                <ChatContainerContent className="space-y-6 px-4 py-6">
                  {messages.length === 0 && (
                    <div className="mx-auto max-w-3xl space-y-6 py-8">
                      <div className="text-center space-y-2">
                        {environmentStatus === 'idle' ? (
                          <>
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Play className="w-8 h-8 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-semibold">Start Agent Environment</h2>
                            <p className="text-sm text-muted-foreground">
                              Click the play button (▶) in the header to begin testing
                            </p>
                          </>
                        ) : environmentStatus === 'starting' ? (
                          <>
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-yellow-600 dark:text-yellow-400 animate-spin" />
                            </div>
                            <h2 className="text-xl font-semibold">Starting Environment...</h2>
                            <p className="text-sm text-muted-foreground">
                              Setting up your agent's virtual environment
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                              <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-semibold">Environment Ready</h2>
                            <p className="text-sm text-muted-foreground">
                              Your agent is running. Try these suggestions or type your own message
                            </p>
                          </>
                        )}
                      </div>
                      {environmentStatus === 'running' && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          <PromptSuggestion
                            onClick={() => setInputValue("What can you help me with?")}
                          >
                            What can you help me with?
                          </PromptSuggestion>
                          <PromptSuggestion
                            onClick={() => setInputValue("Tell me about your capabilities")}
                          >
                            Tell me about your capabilities
                          </PromptSuggestion>
                          <PromptSuggestion
                            onClick={() => setInputValue("How do you access knowledge?")}
                          >
                            How do you access knowledge?
                          </PromptSuggestion>
                        </div>
                      )}
                    </div>
                  )}

                  {messages.map((message, index) => {
                    const isLastMessage = index === messages.length - 1
                    const isAssistant = message.role === 'assistant'
                    const isSystem = message.role === 'system'

                    if (isSystem) {
                      return (
                        <div key={message.id || index} className="mx-auto max-w-3xl">
                          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-xs">
                              {message.content}
                            </AlertDescription>
                          </Alert>
                        </div>
                      )
                    }

                    return (
                      <Message
                        key={message.id || index}
                        className={cn(
                          "mx-auto flex w-full max-w-3xl flex-col gap-2 px-2",
                          isAssistant ? "items-start" : "items-end"
                        )}
                      >
                        {isAssistant ? (
                          <div className="group flex w-full flex-col gap-2">
                            <MessageContent
                              className="text-foreground prose w-full min-w-0 flex-1 rounded-lg bg-transparent p-0"
                              markdown
                            >
                              {message.content}
                            </MessageContent>
                            <MessageActions
                              className={cn(
                                "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                                isLastMessage && "opacity-100"
                              )}
                            >
                              <MessageAction tooltip="Copy" delayDuration={100}>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                  <Copy />
                                </Button>
                              </MessageAction>
                              <MessageAction tooltip="Upvote" delayDuration={100}>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                  <ThumbsUp />
                                </Button>
                              </MessageAction>
                              <MessageAction tooltip="Downvote" delayDuration={100}>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                  <ThumbsDown />
                                </Button>
                              </MessageAction>
                            </MessageActions>
                          </div>
                        ) : (
                          <div className="group flex w-full flex-col items-end gap-1">
                            <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 whitespace-pre-wrap">
                              {message.content}
                            </MessageContent>
                            <MessageActions
                              className={cn(
                                "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                              )}
                            >
                              <MessageAction tooltip="Copy" delayDuration={100}>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                  <Copy />
                                </Button>
                              </MessageAction>
                            </MessageActions>
                          </div>
                        )}
                      </Message>
                    )
                  })}

                  {isThinking && (
                    <Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-2">
                      <div className="group flex w-full flex-col gap-0">
                        <div className="text-foreground prose w-full min-w-0 flex-1 rounded-lg bg-transparent p-0">
                          <DotsLoader />
                        </div>
                      </div>
                    </Message>
                  )}
                </ChatContainerContent>

                {/* Scroll to bottom button */}
                {showScrollButton && (
                  <button
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 p-2 bg-background border border-border rounded-full shadow-lg hover:shadow-xl transition-all"
                    aria-label="Scroll to bottom"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
              </ChatContainerRoot>
              ) : (
                /* Logs View */
                <div ref={logsScrollRef} className="flex-1 overflow-y-auto bg-white dark:bg-[#0c0c0c] p-4 font-mono text-xs">
                  {executionLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Terminal className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                      <p className="text-gray-600 dark:text-gray-400">No logs yet</p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                        Start the environment and send messages to see execution logs
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {executionLogs.map((log, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "flex items-start gap-3 py-1",
                            log.type === 'error' && "text-red-600 dark:text-red-400",
                            log.type === 'warning' && "text-yellow-600 dark:text-yellow-400",
                            log.type === 'success' && "text-green-600 dark:text-green-400",
                            log.type === 'info' && "text-gray-700 dark:text-gray-300"
                          )}
                        >
                          <span className="text-gray-400 dark:text-gray-600 select-none">
                            [{log.timestamp}]
                          </span>
                          <span className="flex-1 break-all">
                            {log.message}
                          </span>
                        </div>
                      ))}
                      
                      {/* Show a blinking cursor at the end */}
                      <div className="flex items-start gap-3 py-1">
                        <span className="text-gray-400 dark:text-gray-600 select-none">
                          [--:--:--]
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 animate-pulse">
                          █
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Input Area - Only show for chat view */}
              {testPanelView === 'chat' && (
              <div className="inset-x-0 bottom-0 mx-auto w-full shrink-0 px-3 pb-3">
                {/* File attachments display */}
                {attachedFiles.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                        {file.type.startsWith('image/') ? (
                          <Image className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <PromptInput
                  isLoading={isThinking}
                  value={inputValue}
                  onValueChange={setInputValue}
                  onSubmit={handleSendMessage}
                  className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
                >
                  <div className="flex flex-col">
                    <PromptInputTextarea
                      placeholder={
                        !watchedModel ? "Select an AI model to start testing..." :
                        environmentStatus === 'idle' ? "Start the agent environment to begin testing..." :
                        environmentStatus === 'starting' ? "Environment is starting up..." :
                        environmentStatus === 'stopping' ? "Environment is shutting down..." :
                        "Test your agent configuration..."
                      }
                      className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3]"
                      disabled={environmentStatus !== 'running'}
                    />

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.txt,.doc,.docx"
                    />

                    <PromptInputActions className="mt-3 flex w-full items-center justify-between gap-2 p-2">
                      <div className="flex items-center gap-1">
                        {/* File upload button - Plus icon on far left */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
                          title="Attach files"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        {/* Model selector - matching main AI panel style */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowModelMenu(!showModelMenu)}
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              {aiModels.find(m => m.id === watchedModel)?.label || 'Select model'}
                            </span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        
                          {showModelMenu && (
                            <div className="absolute bottom-full left-0 mb-2 w-56 bg-popover rounded-lg shadow-lg border border-border overflow-hidden z-50">
                              <div className="p-1">
                                {aiModels.map(model => (
                                  <button
                                    key={model.id}
                                    type="button"
                                    onClick={() => {
                                      setValue('model', model.id, { shouldValidate: true })
                                      setShowModelMenu(false)
                                      // Show restart needed indicator if environment is running
                                      if (environmentStatus === 'running' && model.id !== runningModel) {
                                        toast.info('Model changed - restart required to apply changes')
                                      }
                                    }}
                                    className={cn(
                                      "w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors flex items-center justify-between",
                                      watchedModel === model.id && "bg-muted"
                                    )}
                                  >
                                    <div>
                                      <p className="text-sm font-medium">{model.label}</p>
                                      <p className="text-xs text-muted-foreground">{model.description}</p>
                                    </div>
                                    {watchedModel === model.id && (
                                      <div className="w-2 h-2 rounded-full bg-primary" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Settings Popover */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
                              title="Model settings"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" align="start">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="temperature-slider" className="text-sm font-medium">
                                  Temperature: {watchedTemperature?.toFixed(1)}
                                </Label>
                                <Slider
                                  id="temperature-slider"
                                  min={0}
                                  max={2}
                                  step={0.1}
                                  value={[watchedTemperature]}
                                  onValueChange={(value) => {
                                    setValue('temperature', value[0])
                                    if (environmentStatus === 'running' && value[0] !== runningTemperature) {
                                      toast.info('Temperature changed - restart required to apply changes')
                                    }
                                  }}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Focused</span>
                                  <span>Creative</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="maxTokens-input" className="text-sm font-medium">
                                  Max Tokens
                                </Label>
                                <Input
                                  id="maxTokens-input"
                                  type="number"
                                  min="1"
                                  max="4000"
                                  className="h-9"
                                  {...register('maxTokens', { 
                                    valueAsNumber: true,
                                    onChange: (e) => {
                                      const value = parseInt(e.target.value)
                                      if (environmentStatus === 'running' && value !== runningMaxTokens) {
                                        toast.info('Max tokens changed - restart required to apply changes')
                                      }
                                    }
                                  })}
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Maximum response length (1-4000)
                                </p>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Auto-clear toggle - only show in persistent mode */}
                        {watchedExecutionMode !== 'ephemeral' && (
                          <button
                            type="button"
                            onClick={() => setAutoClear(!autoClear)}
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
                              autoClear 
                                ? "bg-primary/10 text-primary hover:bg-primary/20" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                            title="Toggle auto-clear messages"
                          >
                            <RefreshCw className="w-4 h-4" />
                            {autoClear && (
                              <span className="text-xs font-medium">Auto-clear</span>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          disabled={!inputValue.trim() || isThinking || !watchedModel || environmentStatus !== 'running'}
                          onClick={handleSendMessage}
                          className="size-9 rounded-full"
                          title={
                            environmentStatus !== 'running' ? "Start the environment first" :
                            !watchedModel ? "Select a model first" :
                            !inputValue.trim() ? "Type a message" :
                            "Send message"
                          }
                        >
                          {isThinking ? (
                            <span className="size-3 rounded-xs bg-white" />
                          ) : (
                            <ArrowUp size={18} />
                          )}
                        </Button>
                      </div>
                    </PromptInputActions>
                  </div>
                </PromptInput>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}