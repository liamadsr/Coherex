'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Users,
  Bot,
  Plus,
  X,
  Search,
  Check
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useCreateTeam } from '@/hooks/queries'
import { useAgents } from '@/hooks/queries'
import { useStore } from '@/stores/use-store'

const formSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['support', 'sales', 'operations', 'marketing', 'engineering']),
  agentIds: z.array(z.string()).min(1, 'Select at least one agent'),
  memberIds: z.array(z.string()).min(1, 'Select at least one team member'),
})

type FormData = z.infer<typeof formSchema>

const teamTypeOptions = [
  { value: 'support', label: 'Support Team', icon: '🛟', description: 'Customer support and help desk' },
  { value: 'sales', label: 'Sales Team', icon: '💰', description: 'Sales and business development' },
  { value: 'operations', label: 'Operations Team', icon: '⚙️', description: 'Internal operations and processes' },
  { value: 'marketing', label: 'Marketing Team', icon: '📢', description: 'Marketing and growth initiatives' },
  { value: 'engineering', label: 'Engineering Team', icon: '🔧', description: 'Technical and development tasks' },
]

// Mock team members - in real app would come from API
const mockMembers = [
  { id: 'member-1', name: 'John Doe', email: 'john@blockwork.ai', avatar: '', role: 'Admin' },
  { id: 'member-2', name: 'Jane Smith', email: 'jane@blockwork.ai', avatar: '', role: 'Manager' },
  { id: 'member-3', name: 'Bob Johnson', email: 'bob@blockwork.ai', avatar: '', role: 'Member' },
  { id: 'member-4', name: 'Alice Williams', email: 'alice@blockwork.ai', avatar: '', role: 'Member' },
  { id: 'member-5', name: 'Charlie Brown', email: 'charlie@blockwork.ai', avatar: '', role: 'Member' },
]

export default function CreateTeamPage() {
  const router = useRouter()
  const createTeam = useCreateTeam()
  const { data: agents = [] } = useAgents()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agentSearchQuery, setAgentSearchQuery] = useState('')
  const [memberSearchQuery, setMemberSearchQuery] = useState('')

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'support',
      agentIds: [],
      memberIds: [],
    },
  })

  const selectedAgentIds = form.watch('agentIds')
  const selectedMemberIds = form.watch('memberIds')

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(agentSearchQuery.toLowerCase())
  )

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  )

  const toggleAgent = (agentId: string) => {
    const currentIds = form.getValues('agentIds')
    const newIds = currentIds.includes(agentId)
      ? currentIds.filter(id => id !== agentId)
      : [...currentIds, agentId]
    form.setValue('agentIds', newIds)
  }

  const toggleMember = (memberId: string) => {
    const currentIds = form.getValues('memberIds')
    const newIds = currentIds.includes(memberId)
      ? currentIds.filter(id => id !== memberId)
      : [...currentIds, memberId]
    form.setValue('memberIds', newIds)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await createTeam.mutateAsync(data)
      router.push('/teams')
    } catch (error) {
      console.error('Error creating team:', error)
      toast.error('Failed to create team')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Team</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Build a collaborative team of agents and members
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
                <CardDescription>
                  Basic details about your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Customer Support Team" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for your team
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the team's purpose and responsibilities..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Help others understand what this team does
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamTypeOptions.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{type.icon}</span>
                                <div>
                                  <p className="font-medium">{type.label}</p>
                                  <p className="text-xs text-gray-500">{type.description}</p>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the primary function of this team
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Agent Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Assign Agents</CardTitle>
                <CardDescription>
                  Select AI agents to be part of this team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="agentIds"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search agents..."
                            value={agentSearchQuery}
                            onChange={(e) => setAgentSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        
                        {selectedAgentIds.length > 0 && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Selected agents ({selectedAgentIds.length})
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => form.setValue('agentIds', [])}
                              >
                                Clear all
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedAgentIds.map(id => {
                                const agent = agents.find(a => a.id === id)
                                return agent ? (
                                  <Badge key={id} variant="secondary" className="pl-2 pr-1 py-1">
                                    <Bot className="w-3 h-3 mr-1" />
                                    {agent.name}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="ml-1 h-auto p-0.5"
                                      onClick={() => toggleAgent(id)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </Badge>
                                ) : null
                              })}
                            </div>
                            <Separator />
                          </>
                        )}
                        
                        <ScrollArea className="h-[300px] border rounded-lg p-4">
                          <div className="space-y-2">
                            {filteredAgents.map((agent) => {
                              const isSelected = selectedAgentIds.includes(agent.id)
                              return (
                                <div
                                  key={agent.id}
                                  className={`
                                    flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                                    ${isSelected 
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600' 
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }
                                    border ${isSelected ? 'border-blue-600' : 'border-transparent'}
                                  `}
                                  onClick={() => toggleAgent(agent.id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={agent.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {agent.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{agent.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {agent.capabilities.slice(0, 2).join(', ')}
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Member Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Add human team members who will work with the agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="memberIds"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search members..."
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        
                        {selectedMemberIds.length > 0 && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Selected members ({selectedMemberIds.length})
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => form.setValue('memberIds', [])}
                              >
                                Clear all
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedMemberIds.map(id => {
                                const member = mockMembers.find(m => m.id === id)
                                return member ? (
                                  <Badge key={id} variant="secondary" className="pl-2 pr-1 py-1">
                                    <Users className="w-3 h-3 mr-1" />
                                    {member.name}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="ml-1 h-auto p-0.5"
                                      onClick={() => toggleMember(id)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </Badge>
                                ) : null
                              })}
                            </div>
                            <Separator />
                          </>
                        )}
                        
                        <ScrollArea className="h-[250px] border rounded-lg p-4">
                          <div className="space-y-2">
                            {filteredMembers.map((member) => {
                              const isSelected = selectedMemberIds.includes(member.id)
                              return (
                                <div
                                  key={member.id}
                                  className={`
                                    flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                                    ${isSelected 
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600' 
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }
                                    border ${isSelected ? 'border-blue-600' : 'border-transparent'}
                                  `}
                                  onClick={() => toggleMember(member.id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="text-xs">
                                        {member.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{member.name}</p>
                                      <p className="text-xs text-gray-500">{member.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {member.role}
                                    </Badge>
                                    {isSelected && (
                                      <Check className="w-5 h-5 text-blue-600" />
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

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
                    Creating Team...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Team
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