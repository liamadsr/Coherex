'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Sparkles,
  Brain,
  MessageSquare,
  Zap,
  Globe,
  Settings2,
  AlertCircle
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { useAgent, useUpdateAgent } from '@/hooks/queries'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  personality: z.array(z.string()).min(1, 'Select at least one personality trait'),
  capabilities: z.array(z.string()).min(1, 'Select at least one capability'),
  channels: z.array(z.string()).min(1, 'Select at least one channel'),
  model: z.string(),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(100).max(32000),
  systemPrompt: z.string().min(10, 'System prompt must be at least 10 characters'),
})

type FormData = z.infer<typeof formSchema>

const personalityOptions = [
  { value: 'friendly', label: 'Friendly', icon: '😊' },
  { value: 'professional', label: 'Professional', icon: '👔' },
  { value: 'empathetic', label: 'Empathetic', icon: '🤗' },
  { value: 'analytical', label: 'Analytical', icon: '🔍' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
  { value: 'detail-oriented', label: 'Detail-Oriented', icon: '🔎' },
  { value: 'patient', label: 'Patient', icon: '🧘' },
  { value: 'enthusiastic', label: 'Enthusiastic', icon: '🚀' },
]

const capabilityOptions = [
  { value: 'customer-support', label: 'Customer Support', description: 'Handle customer inquiries and issues' },
  { value: 'sales', label: 'Sales', description: 'Engage in sales conversations and lead qualification' },
  { value: 'technical-support', label: 'Technical Support', description: 'Provide technical assistance and troubleshooting' },
  { value: 'content-creation', label: 'Content Creation', description: 'Generate various types of content' },
  { value: 'data-analysis', label: 'Data Analysis', description: 'Analyze data and provide insights' },
  { value: 'scheduling', label: 'Scheduling', description: 'Manage calendars and appointments' },
  { value: 'research', label: 'Research', description: 'Conduct research and gather information' },
  { value: 'translation', label: 'Translation', description: 'Translate between languages' },
]

const channelOptions = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'slack', label: 'Slack', icon: '💬' },
  { value: 'teams', label: 'Microsoft Teams', icon: '👥' },
  { value: 'web-chat', label: 'Web Chat', icon: '💻' },
  { value: 'sms', label: 'SMS', icon: '📱' },
  { value: 'voice', label: 'Voice', icon: '🎤' },
]

const modelOptions = [
  { value: 'gpt-4', label: 'GPT-4', description: 'Most capable, higher cost' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Advanced reasoning' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: 'Balanced performance' },
]

export default function EditAgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string
  
  const { data: agent, isLoading } = useAgent(agentId)
  const updateAgent = useUpdateAgent()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState('general')

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      description: '',
      personality: [],
      capabilities: [],
      channels: [],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: '',
    },
  })

  // Populate form with agent data
  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        email: agent.email,
        description: agent.description,
        personality: agent.personality,
        capabilities: agent.capabilities,
        channels: agent.channels,
        model: agent.model,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        systemPrompt: agent.systemPrompt,
      })
    }
  }, [agent, form])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await updateAgent.mutateAsync({
        id: agentId,
        data
      })
      
      toast.success('Agent updated successfully!')
      router.push(`/agents/${agentId}`)
    } catch (error) {
      console.error('Error updating agent:', error)
      toast.error('Failed to update agent')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleArrayField = (field: 'personality' | 'capabilities' | 'channels', value: string) => {
    const currentValues = form.getValues(field)
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    form.setValue(field, newValues)
  }

  if (isLoading) {
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

  return (
    <MainLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Agent</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Update your AI agent&apos;s configuration and settings
                </p>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="personality">Personality</TabsTrigger>
                <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                <TabsTrigger value="ai-config">AI Configuration</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Core details about your agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agent Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Support Agent" {...field} />
                          </FormControl>
                          <FormDescription>
                            A friendly name for your agent
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agent Email</FormLabel>
                          <FormControl>
                            <Input placeholder="agent@company.com" type="email" {...field} />
                          </FormControl>
                          <FormDescription>
                            Email address for agent communications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what this agent does..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A brief description of the agent&apos;s purpose and role
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Communication Channels</CardTitle>
                    <CardDescription>
                      Select where this agent will be available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="channels"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {channelOptions.map((channel) => (
                              <div
                                key={channel.value}
                                className={`
                                  flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                                  ${field.value.includes(channel.value)
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                  }
                                `}
                                onClick={() => toggleArrayField('channels', channel.value)}
                              >
                                <span className="text-2xl">{channel.icon}</span>
                                <span className="font-medium">{channel.label}</span>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="personality" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personality Traits</CardTitle>
                    <CardDescription>
                      Define how your agent should interact with users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="personality"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {personalityOptions.map((trait) => (
                              <div
                                key={trait.value}
                                className={`
                                  flex flex-col items-center space-y-2 p-4 rounded-lg border-2 cursor-pointer transition-all
                                  ${field.value.includes(trait.value)
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                  }
                                `}
                                onClick={() => toggleArrayField('personality', trait.value)}
                              >
                                <span className="text-2xl">{trait.icon}</span>
                                <span className="text-sm font-medium text-center">{trait.label}</span>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="capabilities" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Capabilities</CardTitle>
                    <CardDescription>
                      Select what this agent can help with
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="capabilities"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid gap-4">
                            {capabilityOptions.map((capability) => (
                              <div
                                key={capability.value}
                                className={`
                                  p-4 rounded-lg border-2 cursor-pointer transition-all
                                  ${field.value.includes(capability.value)
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                  }
                                `}
                                onClick={() => toggleArrayField('capabilities', capability.value)}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{capability.label}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {capability.description}
                                    </p>
                                  </div>
                                  <div className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                    ${field.value.includes(capability.value)
                                      ? 'border-blue-600 bg-blue-600'
                                      : 'border-gray-300'
                                    }
                                  `}>
                                    {field.value.includes(capability.value) && (
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-config" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Model Configuration</CardTitle>
                    <CardDescription>
                      Fine-tune your agent&apos;s AI settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language Model</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modelOptions.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                  <div>
                                    <p className="font-medium">{model.label}</p>
                                    <p className="text-xs text-gray-500">{model.description}</p>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the AI model that powers your agent
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={2}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            Controls randomness: 0 = focused, 2 = creative
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxTokens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Tokens</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={100}
                              max={32000}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum length of agent responses (1 token ≈ 0.75 words)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="systemPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="You are a helpful assistant..."
                              className="min-h-[200px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The base instructions that guide your agent&apos;s behavior
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  )
}