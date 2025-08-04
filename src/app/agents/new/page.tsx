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
  Send
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
  email: z.string().email('Please enter a valid email address'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  personality: z.array(z.string()).min(1, 'Select at least one personality trait'),
  capabilities: z.array(z.string()).min(1, 'Select at least one capability'),
  channels: z.array(z.string()).min(1, 'Select at least one communication channel'),
  model: z.string().min(1, 'Please select an AI model'),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(4000),
  systemPrompt: z.string().min(20, 'System prompt must be at least 20 characters'),
})

type AgentFormData = z.infer<typeof agentSchema>

const personalityTraits = [
  { id: 'professional', label: 'Professional', icon: Users },
  { id: 'friendly', label: 'Friendly', icon: MessageSquare },
  { id: 'technical', label: 'Technical', icon: Code },
  { id: 'empathetic', label: 'Empathetic', icon: Brain },
  { id: 'analytical', label: 'Analytical', icon: Database },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'concise', label: 'Concise', icon: FileText },
  { id: 'detailed', label: 'Detailed', icon: Sparkles },
]

const capabilities = [
  { id: 'customer-support', label: 'Customer Support', icon: MessageSquare },
  { id: 'sales', label: 'Sales & Lead Generation', icon: Users },
  { id: 'data-analysis', label: 'Data Analysis', icon: Database },
  { id: 'content-creation', label: 'Content Creation', icon: FileText },
  { id: 'code-review', label: 'Code Review', icon: Code },
  { id: 'research', label: 'Research & Insights', icon: Brain },
  { id: 'scheduling', label: 'Scheduling & Calendar', icon: Zap },
  { id: 'translation', label: 'Translation', icon: Globe },
]

const channels = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'slack', label: 'Slack', icon: Slack },
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
      personality: [],
      capabilities: [],
      channels: [],
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful AI assistant. Be professional, accurate, and helpful in all your responses.',
    }
  })

  const watchedPersonality = watch('personality') || []
  const watchedCapabilities = watch('capabilities') || []
  const watchedChannels = watch('channels') || []
  const watchedTemperature = watch('temperature')

  const toggleSelection = (field: 'personality' | 'capabilities' | 'channels', value: string) => {
    const currentValues = getValues(field) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value]
    setValue(field, newValues, { shouldValidate: true })
  }

  const onSubmit = async (data: AgentFormData) => {
    setIsLoading(true)
    try {
      // Simulate agent creation
      await mockApi.createAgent(data)
      toast.success('Agent created successfully!')
      router.push('/agents')
    } catch (error) {
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
    // Simulate agent response based on configured personality and capabilities
    const agentName = formData.name || "Your Agent"
    const personality = formData.personality || []
    const capabilities = formData.capabilities || []
    
    // Create a response that reflects the agent's configured personality
    let responseStyle = ""
    if (personality.includes('professional')) {
      responseStyle = "I'd be happy to assist you with that. "
    } else if (personality.includes('friendly')) {
      responseStyle = "Hey there! I'd love to help you with that. "
    } else if (personality.includes('technical')) {
      responseStyle = "Based on my technical analysis, "
    } else {
      responseStyle = "I can help you with that. "
    }
    
    // Add capability-specific responses
    if (capabilities.includes('customer-support')) {
      return `${responseStyle}As a customer support agent, I'm here to resolve any issues you might have. Could you please describe what you're experiencing so I can better assist you?`
    } else if (capabilities.includes('sales')) {
      return `${responseStyle}I'd be delighted to tell you more about our products and services. What specific features or solutions are you looking for?`
    } else if (capabilities.includes('code-review')) {
      return `${responseStyle}I can analyze your code for best practices, potential bugs, and optimization opportunities. Please share the code you'd like me to review.`
    }
    
    // Default response
    return `${responseStyle}I'm ${agentName}, configured with ${personality.join(', ')} traits. How can I assist you today?`
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
                  <TabsList className="grid w-full grid-cols-4 h-10 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
                    <TabsTrigger value="basic" className="text-xs font-medium">Basic</TabsTrigger>
                    <TabsTrigger value="personality" className="text-xs font-medium">Personality</TabsTrigger>
                    <TabsTrigger value="capabilities" className="text-xs font-medium">Capabilities</TabsTrigger>
                    <TabsTrigger value="advanced" className="text-xs font-medium">Advanced</TabsTrigger>
                  </TabsList>

                  {/* Basic Information Tab */}
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
                        <Label htmlFor="email" className="text-sm font-medium">
                          Agent Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="sarah@company.com"
                          className="h-9"
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.email.message}
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
                        <div className="grid grid-cols-2 gap-2">
                          {channels.map((channel) => {
                            const Icon = channel.icon
                            const isSelected = watchedChannels.includes(channel.id)
                            return (
                              <Button
                                key={channel.id}
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                className="justify-start h-9"
                                onClick={() => toggleSelection('channels', channel.id)}
                              >
                                <Icon className="w-3 h-3 mr-2" />
                                <span className="text-xs">{channel.label}</span>
                              </Button>
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

                  {/* Personality Tab */}
                  <TabsContent value="personality" className="space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Personality Traits *
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {personalityTraits.map((trait) => {
                            const Icon = trait.icon
                            const isSelected = watchedPersonality.includes(trait.id)
                            return (
                              <Button
                                key={trait.id}
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                className="h-14 flex-col gap-1"
                                onClick={() => toggleSelection('personality', trait.id)}
                              >
                                <Icon className="w-4 h-4" />
                                <span className="text-xs">{trait.label}</span>
                              </Button>
                            )
                          })}
                        </div>
                        {errors.personality && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.personality.message}
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
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Core Capabilities *
                        </Label>
                        <div className="space-y-2">
                          {capabilities.map((capability) => {
                            const Icon = capability.icon
                            const isSelected = watchedCapabilities.includes(capability.id)
                            return (
                              <Button
                                key={capability.id}
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                className="w-full justify-start h-10"
                                onClick={() => toggleSelection('capabilities', capability.id)}
                              >
                                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                                <span className="text-xs">{capability.label}</span>
                              </Button>
                            )
                          })}
                        </div>
                        {errors.capabilities && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors.capabilities.message}
                          </p>
                        )}
                      </div>

                      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                        <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-xs text-blue-800 dark:text-blue-300">
                          More capabilities can be added after creation
                        </AlertDescription>
                      </Alert>
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
                          <SelectTrigger className="h-9 bg-white dark:bg-gray-900">
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
            <Card className="h-full flex flex-col bg-white dark:bg-gray-950">
              <CardContent className="flex-1 overflow-y-auto p-0 bg-white dark:bg-gray-950">
                <div className="p-6">
                  {messages.map((message, index) => (
                    <div key={index} className="mb-6">
                      {message.role === 'user' ? (
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
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
              <div className="p-4">
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full p-2">
                  {/* Text input */}
                  <Textarea
                    placeholder="Chat with your agent..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="w-full min-h-[40px] resize-none bg-transparent border-0 px-4 py-2 focus:outline-none focus:ring-0 focus:border-0 outline-none placeholder-gray-500 text-sm"
                    rows={1}
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />

                  {/* Controls row */}
                  <div className="flex items-center justify-between px-2 pt-1">
                    {/* Attachment button */}
                    <button
                      type="button"
                      className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>

                    <div className="flex items-center space-x-2">
                      {/* Auto-clear toggle */}
                      <button
                        type="button"
                        className={`flex items-center space-x-1.5 h-8 px-3 rounded-full text-xs font-medium transition-all ${
                          autoClear 
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setAutoClear(!autoClear)}
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Auto-clear</span>
                      </button>

                      {/* Send button */}
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isThinking}
                        className={`h-8 w-8 rounded-full transition-colors flex items-center justify-center ${
                          !inputValue.trim() || isThinking
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-black dark:hover:bg-white'
                        }`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </div>
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