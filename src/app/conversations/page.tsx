'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Bot,
  Hash,
  Calendar,
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
  Slack,
  Activity,
  Network,
  Eye
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useConversations } from '@/hooks/queries'
import { Conversation } from '@/types'
import { cn } from '@/lib/utils'

const statusColors = {
  active: 'bg-green-500',
  resolved: 'bg-blue-500',
  escalated: 'bg-orange-500',
  archived: 'bg-gray-500',
}

const statusIcons = {
  active: Clock,
  resolved: CheckCircle,
  escalated: AlertCircle,
  archived: Activity,
}

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  'web-chat': MessageCircle,
  slack: Slack,
  teams: MessageSquare,
  sms: Phone,
  voice: Phone,
}

function ConversationCard({ conversation, onClick }: { conversation: Conversation; onClick: () => void }) {
  const StatusIcon = statusIcons[conversation.status] || Activity
  const ChannelIcon = channelIcons[conversation.channel] || MessageCircle
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 border hover:border-blue-500"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.user?.avatar} />
              <AvatarFallback>
                {conversation.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{conversation.user?.name || 'Unknown User'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{conversation.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary"
              className={cn(
                "text-white",
                statusColors[conversation.status]
              )}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {conversation.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {conversation.lastMessage}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <ChannelIcon className="w-3 h-3" />
                <span>{conversation.channel}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span>{conversation.messageCount} messages</span>
              </div>
              {conversation.tags && conversation.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Hash className="w-3 h-3" />
                  <span>{conversation.tags.join(', ')}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(conversation.updatedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConversationsPage() {
  const router = useRouter()
  const { data: conversations = [], isLoading, refetch } = useConversations()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [currentTab, setCurrentTab] = useState('all')
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)

  // Auto-refresh conversations every 10 seconds
  useEffect(() => {
    if (!isAutoRefresh) return
    
    const interval = setInterval(() => {
      refetch()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [isAutoRefresh, refetch])

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter
    const matchesChannel = channelFilter === 'all' || conv.channel === channelFilter
    
    // Tab filtering
    if (currentTab === 'active') return matchesSearch && matchesStatus && matchesChannel && conv.status === 'active'
    if (currentTab === 'resolved') return matchesSearch && matchesStatus && matchesChannel && conv.status === 'resolved'
    if (currentTab === 'escalated') return matchesSearch && matchesStatus && matchesChannel && conv.status === 'escalated'
    
    return matchesSearch && matchesStatus && matchesChannel
  })

  // Sort conversations by last updated
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  // Get counts for tabs
  const statusCounts = {
    all: conversations.length,
    active: conversations.filter(c => c.status === 'active').length,
    resolved: conversations.filter(c => c.status === 'resolved').length,
    escalated: conversations.filter(c => c.status === 'escalated').length,
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Conversations</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor and manage all agent conversations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isAutoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              >
                <RefreshCw className={cn(
                  "w-4 h-4 mr-2",
                  isAutoRefresh && "animate-spin"
                )} />
                {isAutoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/conversations/clusters')}
              >
                <Network className="w-4 h-4 mr-2" />
                Cluster View
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Channel Filter */}
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[200px]">
                <Phone className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>All Channels</span>
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                </SelectItem>
                <SelectItem value="web-chat">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Web Chat</span>
                  </div>
                </SelectItem>
                <SelectItem value="slack">
                  <div className="flex items-center gap-2">
                    <Slack className="w-4 h-4" />
                    <span>Slack</span>
                  </div>
                </SelectItem>
                <SelectItem value="teams">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Microsoft Teams</span>
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>SMS</span>
                  </div>
                </SelectItem>
                <SelectItem value="voice">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Voice</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs and Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <span>All</span>
              <Badge variant="secondary" className="ml-1 h-5">
                {statusCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <span>Active</span>
              <Badge variant="secondary" className="ml-1 h-5 bg-green-100 text-green-700">
                {statusCounts.active}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center space-x-2">
              <span>Resolved</span>
              <Badge variant="secondary" className="ml-1 h-5 bg-blue-100 text-blue-700">
                {statusCounts.resolved}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="escalated" className="flex items-center space-x-2">
              <span>Escalated</span>
              <Badge variant="secondary" className="ml-1 h-5 bg-orange-100 text-orange-700">
                {statusCounts.escalated}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab} className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : sortedConversations.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversations found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || statusFilter !== 'all' || channelFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Conversations will appear here when agents interact with users'}
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {sortedConversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    onClick={() => router.push(`/conversations/${conversation.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Stats Summary */}
        {conversations.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{conversations.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Conversations</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.active}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Now</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round((statusCounts.resolved / conversations.length) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {conversations.reduce((acc, conv) => acc + conv.messageCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}