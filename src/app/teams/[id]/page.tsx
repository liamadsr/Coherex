'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Settings, 
  MoreHorizontal,
  Users,
  UserPlus,
  Bot,
  Activity,
  Calendar,
  Edit,
  Trash2,
  Mail,
  Shield,
  Target
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TeamAgentManager } from '@/components/teams/TeamAgentManager'
import { useTeam, useUpdateTeam, useDeleteTeam, useAgents } from '@/hooks/queries'
import { toast } from 'sonner'

const teamTypeColors = {
  support: 'bg-blue-500',
  sales: 'bg-green-500',
  operations: 'bg-purple-500',
  marketing: 'bg-orange-500',
  engineering: 'bg-red-500',
}

const teamTypeIcons = {
  support: '🛟',
  sales: '💰',
  operations: '⚙️',
  marketing: '📢',
  engineering: '🔧',
}

// Mock team members - in real app would come from API
const mockMembers = [
  { id: 'member-1', name: 'John Doe', email: 'john@blockwork.ai', avatar: '', role: 'Team Lead' },
  { id: 'member-2', name: 'Jane Smith', email: 'jane@blockwork.ai', avatar: '', role: 'Senior Member' },
  { id: 'member-3', name: 'Bob Johnson', email: 'bob@blockwork.ai', avatar: '', role: 'Member' },
  { id: 'member-4', name: 'Alice Williams', email: 'alice@blockwork.ai', avatar: '', role: 'Member' },
]

export default function TeamDetailPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = params.id as string

  const [currentTab, setCurrentTab] = useState('overview')
  
  const { data: team, isLoading: teamLoading } = useTeam(teamId)
  const { data: agents = [], isLoading: agentsLoading } = useAgents()
  const updateTeam = useUpdateTeam()
  const deleteTeam = useDeleteTeam()

  const loading = teamLoading || agentsLoading

  const handleUpdateAgents = async (agentIds: string[]) => {
    if (!team) return
    
    try {
      await updateTeam.mutateAsync({
        id: team.id,
        data: { agentIds }
      })
    } catch (error) {
      console.error('Error updating team agents:', error)
      toast.error('Failed to update team agents')
    }
  }

  const handleDeleteTeam = async () => {
    if (!team) return
    
    if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await deleteTeam.mutateAsync(team.id)
        router.push('/teams')
      } catch (error) {
        console.error('Error deleting team:', error)
      }
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

  if (!team) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The team you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/teams')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>
        </div>
      </MainLayout>
    )
  }

  const typeIcon = teamTypeIcons[team.type as keyof typeof teamTypeIcons] || '👥'
  const typeColor = teamTypeColors[team.type as keyof typeof teamTypeColors] || 'bg-gray-500'
  const teamMembers = team.memberIds?.map(id => mockMembers.find(m => m.id === id)).filter(Boolean) || []
  const teamAgents = team.agentIds?.map(id => agents.find(a => a.id === id)).filter(Boolean) || []

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
                <div className={`w-16 h-16 rounded-lg ${typeColor} flex items-center justify-center text-3xl`}>
                  {typeIcon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {team.description || 'No description provided'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary" className="capitalize">
                      {team.type} Team
                    </Badge>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={() => router.push(`/teams/${team.id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Team
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
                  <DropdownMenuItem onClick={() => router.push(`/teams/${team.id}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Team Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteTeam} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="overview" className="h-10">Overview</TabsTrigger>
            <TabsTrigger value="agents" className="h-10">Agents</TabsTrigger>
            <TabsTrigger value="members" className="h-10">Members</TabsTrigger>
            <TabsTrigger value="activity" className="h-10">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <p className="text-xs text-muted-foreground">Active members</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned Agents</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamAgents.length}</div>
                  <p className="text-xs text-muted-foreground">AI agents</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Activity</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-xs text-muted-foreground">Status</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Team Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Team Goals</span>
                  </CardTitle>
                  <CardDescription>Current objectives and KPIs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <p className="font-medium">Response Time</p>
                        <p className="text-sm text-gray-500">Average &lt; 2 minutes</p>
                      </div>
                      <Badge variant="default">On Track</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <p className="font-medium">Customer Satisfaction</p>
                        <p className="text-sm text-gray-500">Maintain &gt; 4.5/5</p>
                      </div>
                      <Badge variant="default">Achieved</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <p className="font-medium">Resolution Rate</p>
                        <p className="text-sm text-gray-500">First contact &gt; 80%</p>
                      </div>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>Latest team actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm">Agent <strong>Support Bot</strong> joined the team</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm">Team goal <strong>Response Time</strong> updated</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm">New member <strong>Alice Williams</strong> added</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <TeamAgentManager
              team={team}
              availableAgents={agents}
              onUpdate={handleUpdateAgents}
            />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage human team members and their roles
                    </CardDescription>
                  </div>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => member && (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{member.role}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Remove from Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Activity Log</CardTitle>
                <CardDescription>
                  Complete history of team actions and changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Agent Configuration Updated</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Support Bot&apos;s capabilities were updated by John Doe
                      </p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Team Member Added</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Alice Williams joined the team as a Member
                      </p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Team Goal Achieved</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Customer Satisfaction goal of 4.5/5 was achieved
                      </p>
                      <p className="text-xs text-gray-500 mt-1">3 days ago</p>
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