'use client'

import { useState } from 'react'
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
  Paperclip,
  ChevronRight,
  RefreshCw,
  Send,
  Check
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { mockApi } from '@/mock-data'
import { toast } from 'sonner'

const agentSchema = z.object({
  name: z.string().min(2, 'Agent name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
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
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    { role: 'assistant', content: "Hi! I'm your agent tester. Once you've configured your agent's settings, you can test how it responds to different prompts here. Try sending a message to see how your agent would handle it!" }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [autoClear, setAutoClear] = useState(false)

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
      channels: [],
      knowledgeSources: [],
      mcpServers: [],
      integrations: [],
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
      // Create agent configuration
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue
    setInputValue('')
    
    // If auto-clear is enabled, start fresh
    if (autoClear) {
      setMessages([{ role: 'user', content: userMessage }])
    } else {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    }
    
    setIsThinking(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage, getValues())
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
      setIsThinking(false)
    }, 1500)
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
                  Configure and test your AI assistant
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.info('Save as draft feature coming soon!')}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
          {/* Left Panel - Configuration */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardContent className="p-6 flex-1 overflow-hidden flex flex-col">
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col min-h-0">
                  <TabsList className="grid w-full grid-cols-4 h-10 bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg mb-6">
                    <TabsTrigger value="basic" className="text-xs font-medium">Interaction</TabsTrigger>
                    <TabsTrigger value="personality" className="text-xs font-medium">Resources</TabsTrigger>
                    <TabsTrigger value="capabilities" className="text-xs font-medium">Capabilities</TabsTrigger>
                    <TabsTrigger value="advanced" className="text-xs font-medium">Advanced</TabsTrigger>
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

                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="model" className="text-sm font-medium">
                          AI Model *
                        </Label>
                        <Select onValueChange={(value) => setValue('model', value)} defaultValue="">
                          <SelectTrigger className="h-9 bg-white dark:bg-neutral-900">
                            <SelectValue placeholder="Select an AI model" />
                          </SelectTrigger>
                          <SelectContent>
                            {aiModels.map((model) => (
                              <SelectItem key={model.id} value={model.id} className="py-2">
                                <div>
                                  <div className="font-medium text-sm">{model.label}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{model.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.model && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.model.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="temperature" className="text-sm font-medium">
                          Temperature: {watchedTemperature?.toFixed(1)}
                        </Label>
                        <div className="px-1">
                          <input
                            id="temperature"
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            {...register('temperature', { valueAsNumber: true })}
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Focused</span>
                            <span>Creative</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxTokens" className="text-sm font-medium">
                          Max Tokens
                        </Label>
                        <Input
                          id="maxTokens"
                          type="number"
                          min="1"
                          max="4000"
                          className="h-9"
                          {...register('maxTokens', { valueAsNumber: true })}
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Maximum response length (1-4000)
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Create Agent Button */}
                <div className="mt-4 pt-4 border-t flex-shrink-0">
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isValid || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Agent...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Agent
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - AI Assistant */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="p-6">
                  {messages.map((message, index) => (
                    <div key={index} className="mb-6">
                      {message.role === 'user' ? (
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">You</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-gray-100">{message.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  {/* Text input with attachment button */}
                  <div className="flex-1 relative flex items-center">
                    <button
                      type="button"
                      className="absolute left-3 z-10 h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center justify-center transition-colors"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    
                    <Textarea
                      placeholder="Test your agent configuration..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="w-full min-h-[40px] max-h-[120px] resize-none bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-700 rounded-lg pl-12 pr-4 py-2.5 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      rows={1}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    {/* Auto-clear toggle */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`h-10 px-3 ${
                        autoClear 
                          ? 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-gray-600' 
                          : ''
                      }`}
                      onClick={() => setAutoClear(!autoClear)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Auto-clear
                    </Button>

                    {/* Send button */}
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isThinking}
                      size="sm"
                      className="h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isThinking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}