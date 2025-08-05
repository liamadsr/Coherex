'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  MoreHorizontal,
  Users,
  Bot,
  Activity,
  Settings,
  Trash2,
  Edit
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTeams } from '@/hooks/queries'
import { Team } from '@/types'

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

export default function TeamsPage() {
  const router = useRouter()
  const { data: teams = [], isLoading } = useTeams()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')

  // Filter teams based on search and filters
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || team.type === filterType
    
    return matchesSearch && matchesType
  })

  // Sort teams
  const sortedTeams = [...filteredTeams].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'members':
        return (b.memberIds?.length || 0) - (a.memberIds?.length || 0)
      case 'agents':
        return (b.agentIds?.length || 0) - (a.agentIds?.length || 0)
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const TeamGridCard = ({ team }: { team: Team }) => {
    const typeIcon = teamTypeIcons[team.type as keyof typeof teamTypeIcons] || '👥'
    const typeColor = teamTypeColors[team.type as keyof typeof teamTypeColors] || 'bg-gray-500'
    
    return (
      <Card 
        className="group cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={() => router.push(`/teams/${team.id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg ${typeColor} flex items-center justify-center text-2xl`}>
                {typeIcon}
              </div>
              <div>
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {team.type}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/teams/${team.id}/edit`)
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/teams/${team.id}/settings`)
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  Team Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => e.stopPropagation()} 
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {team.description || 'No description provided'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>{team.memberIds?.length || 0} members</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-gray-500" />
              <span>{team.agentIds?.length || 0} agents</span>
            </div>
          </div>

          {/* Member Avatars */}
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-2">
              {team.memberIds?.slice(0, 4).map((memberId, index) => (
                <Avatar key={memberId} className="w-8 h-8 border-2 border-white dark:border-gray-800">
                  <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                    {memberId.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {team.memberIds && team.memberIds.length > 4 && (
              <span className="text-xs text-gray-500 ml-2">
                +{team.memberIds.length - 4} more
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const TeamListItem = ({ team }: { team: Team }) => {
    const typeIcon = teamTypeIcons[team.type as keyof typeof teamTypeIcons] || '👥'
    const typeColor = teamTypeColors[team.type as keyof typeof teamTypeColors] || 'bg-gray-500'
    
    return (
      <Card 
        className="cursor-pointer hover:shadow-sm transition-shadow"
        onClick={() => router.push(`/teams/${team.id}`)}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-lg ${typeColor} flex items-center justify-center text-xl`}>
                {typeIcon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{team.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {team.description || 'No description'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{team.memberIds?.length || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bot className="w-4 h-4" />
                  <span>{team.agentIds?.length || 0}</span>
                </div>
              </div>
              
              <Badge variant="secondary">{team.type}</Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/teams/${team.id}/edit`)
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Team
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your agent teams and collaborations
              </p>
            </div>
            <Button onClick={() => router.push('/teams/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Teams</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {teams.reduce((acc, team) => acc + (team.memberIds?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {teams.reduce((acc, team) => acc + (team.agentIds?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Assigned Agents</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {teams.filter(team => team.agentIds && team.agentIds.length > 0).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Teams</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="members">Members</SelectItem>
                  <SelectItem value="agents">Agents</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Teams Display */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedTeams.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teams found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first team'}
              </p>
              {!searchQuery && filterType === 'all' && (
                <Button onClick={() => router.push('/teams/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Team
                </Button>
              )}
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTeams.map((team) => (
              <TeamGridCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTeams.map((team) => (
              <TeamListItem key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}