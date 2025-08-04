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
  Palette
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

  return (
    <MainLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
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
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create New Agent</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Build your AI assistant with custom personality and capabilities
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger value="basic" className="h-10 text-sm font-medium">Basic Info</TabsTrigger>
              <TabsTrigger value="personality" className="h-10 text-sm font-medium">Personality</TabsTrigger>
              <TabsTrigger value="capabilities" className="h-10 text-sm font-medium">Capabilities</TabsTrigger>
              <TabsTrigger value="advanced" className="h-10 text-sm font-medium">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-8">
              <Card className="shadow-sm border-0 bg-card">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                    Set up the fundamental details for your AI agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Agent Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Customer Support Sarah"
                        className="h-11"
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Agent Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="sarah@company.com"
                        className="h-11"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this agent does and how it helps users..."
                      rows={4}
                      className="resize-none"
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Communication Channels *
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {channels.map((channel) => {
                        const Icon = channel.icon
                        const isSelected = watchedChannels.includes(channel.id)
                        return (
                          <Button
                            key={channel.id}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            className="justify-start h-12 px-4 transition-all duration-200"
                            onClick={() => toggleSelection('channels', channel.id)}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            <span className="font-medium">{channel.label}</span>
                          </Button>
                        )
                      })}
                    </div>
                    {errors.channels && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.channels.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-8">
              <Card className="shadow-sm border-0 bg-card">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Personality & Tone</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                    Define how your agent communicates and interacts with users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Personality Traits *
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {personalityTraits.map((trait) => {
                        const Icon = trait.icon
                        const isSelected = watchedPersonality.includes(trait.id)
                        return (
                          <Button
                            key={trait.id}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            className="h-20 flex-col space-y-2 transition-all duration-200"
                            onClick={() => toggleSelection('personality', trait.id)}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{trait.label}</span>
                          </Button>
                        )
                      })}
                    </div>
                    {errors.personality && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.personality.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="systemPrompt" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      System Prompt *
                    </Label>
                    <Textarea
                      id="systemPrompt"
                      placeholder="You are a helpful AI assistant..."
                      rows={6}
                      className="resize-none"
                      {...register('systemPrompt')}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This prompt defines your agent&apos;s core behavior and instructions
                    </p>
                    {errors.systemPrompt && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.systemPrompt.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Capabilities Tab */}
            <TabsContent value="capabilities" className="space-y-8">
              <Card className="shadow-sm border-0 bg-card">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Agent Capabilities</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                    Select the skills and functions your agent will have
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Core Capabilities *
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {capabilities.map((capability) => {
                        const Icon = capability.icon
                        const isSelected = watchedCapabilities.includes(capability.id)
                        return (
                          <Button
                            key={capability.id}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            className="justify-start h-16 px-4 transition-all duration-200"
                            onClick={() => toggleSelection('capabilities', capability.id)}
                          >
                            <Icon className="w-5 h-5 mr-4 flex-shrink-0" />
                            <div className="text-left flex-1">
                              <div className="font-medium text-sm">{capability.label}</div>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                    {errors.capabilities && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.capabilities.message}
                      </p>
                    )}
                  </div>

                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300">
                      More capabilities can be added after creation. Start with the core functions 
                      your agent needs most.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-8">
              <Card className="shadow-sm border-0 bg-card">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Advanced Configuration</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                    Fine-tune your agent&apos;s AI model and behavior settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="model" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      AI Model *
                    </Label>
                    <Select onValueChange={(value) => setValue('model', value)} defaultValue="">
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select an AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        {aiModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="py-2">
                              <div className="font-medium">{model.label}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{model.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.model && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.model.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label htmlFor="temperature" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Temperature: {watchedTemperature?.toFixed(1)} - {getTemperatureLabel(watchedTemperature || 0.7)}
                      </Label>
                      <div className="px-2">
                        <input
                          id="temperature"
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          {...register('temperature', { valueAsNumber: true })}
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <span>Conservative</span>
                          <span>Creative</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="maxTokens" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Max Tokens
                      </Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        min="1"
                        max="4000"
                        className="h-11"
                        {...register('maxTokens', { valueAsNumber: true })}
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Maximum response length (1-4000)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => toast.info('Save as draft feature coming soon!')}
                className="px-6 py-2.5"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700"
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
          </div>
        </form>
      </div>
    </MainLayout>
  )
}