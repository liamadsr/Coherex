'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
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
  Eye,
  LayoutList,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  Focus,
  Move,
  Cloud,
  Type,
  HelpCircle,
  Bug,
  Lightbulb,
  HeadphonesIcon,
  ShoppingCart,
  FileQuestion
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
import * as d3 from 'd3-force'

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#0c0c0c]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
})

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

// Define conversation categories with modern, clean design
const conversationCategories = {
  issue: { 
    label: 'Issues & Problems', 
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    icon: AlertCircle,
    keywords: ['problem', 'issue', 'error', 'broken', 'fix', 'bug', 'crash', 'fail', 'wrong', 'not working']
  },
  question: { 
    label: 'Questions', 
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    icon: HelpCircle,
    keywords: ['how', 'what', 'when', 'where', 'why', 'can', 'should', 'would', '?', 'help me understand']
  },
  bug: { 
    label: 'Bug Reports', 
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.08)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
    icon: Bug,
    keywords: ['bug', 'glitch', 'defect', 'fault', 'flaw', 'malfunction', 'report']
  },
  feature: { 
    label: 'Feature Requests', 
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    icon: Lightbulb,
    keywords: ['feature', 'request', 'enhance', 'improve', 'add', 'new', 'want', 'need', 'would love', 'suggestion']
  },
  support: { 
    label: 'Support', 
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    icon: HeadphonesIcon,
    keywords: ['help', 'support', 'assist', 'guide', 'tutorial', 'documentation', 'setup', 'configure']
  },
  sales: { 
    label: 'Sales & Pricing', 
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.08)',
    borderColor: 'rgba(236, 72, 153, 0.2)',
    icon: ShoppingCart,
    keywords: ['buy', 'purchase', 'price', 'cost', 'subscription', 'plan', 'upgrade', 'quote', 'demo']
  },
  feedback: { 
    label: 'Feedback', 
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.08)',
    borderColor: 'rgba(6, 182, 212, 0.2)',
    icon: MessageCircle,
    keywords: ['feedback', 'review', 'opinion', 'suggest', 'think', 'feel', 'experience', 'improvement']
  },
  other: { 
    label: 'Other', 
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.08)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    icon: FileQuestion,
    keywords: []
  }
}

// Categorize conversation based on content
function categorizeConversation(conversation: Conversation): keyof typeof conversationCategories {
  const content = conversation.lastMessage ? conversation.lastMessage.toLowerCase() : ''
  
  for (const [category, config] of Object.entries(conversationCategories)) {
    if (category === 'other') continue
    
    for (const keyword of config.keywords) {
      if (content.includes(keyword)) {
        return category as keyof typeof conversationCategories
      }
    }
  }
  
  return 'other'
}

// Get a shortened version of the message for display
function getShortMessage(message: string, maxLength: number = 40): string {
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
}

// Define resolution categories
const resolutionCategories = {
  resolved_satisfied: {
    label: 'Resolved - Satisfied',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    icon: CheckCircle
  },
  resolved_unsatisfied: {
    label: 'Resolved - Unsatisfied',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.08)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
    icon: AlertCircle
  },
  active: {
    label: 'Active - In Progress',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    icon: Clock
  },
  escalated: {
    label: 'Escalated',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    icon: AlertCircle
  }
}

// Define channel categories
const channelCategories = {
  email: {
    label: 'Email',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    icon: Mail
  },
  'web-chat': {
    label: 'Web Chat',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    icon: MessageCircle
  },
  slack: {
    label: 'Slack',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.08)',
    borderColor: 'rgba(236, 72, 153, 0.2)',
    icon: Slack
  },
  teams: {
    label: 'Microsoft Teams',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.08)',
    borderColor: 'rgba(6, 182, 212, 0.2)',
    icon: MessageSquare
  },
  sms: {
    label: 'SMS',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    icon: Phone
  },
  voice: {
    label: 'Voice',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.08)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
    icon: Phone
  }
}

// Categorize conversation based on resolution status
function categorizeByResolution(conversation: Conversation): keyof typeof resolutionCategories {
  if (conversation.status === 'resolved') {
    // Check satisfaction score if available
    if (conversation.satisfaction && conversation.satisfaction >= 4) {
      return 'resolved_satisfied'
    } else {
      return 'resolved_unsatisfied'
    }
  } else if (conversation.status === 'escalated') {
    return 'escalated'
  } else {
    return 'active'
  }
}

// Extract words from conversations
function extractWords(conversations: Conversation[]): Array<{text: string, value: number}> {
  const wordCounts: Record<string, number> = {}
  const commonStopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were',
    'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their',
    'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each',
    'every', 'some', 'any', 'few', 'more', 'most', 'other', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while', 'of',
    'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through'
  ])
  
  conversations.forEach(conv => {
    const text = conv.lastMessage.toLowerCase()
    const words = text.split(/\s+/)
    
    words.forEach(word => {
      const cleaned = word.replace(/[^a-z0-9]/g, '')
      if (cleaned.length > 2 && !commonStopWords.has(cleaned)) {
        wordCounts[cleaned] = (wordCounts[cleaned] || 0) + 1
      }
    })
  })
  
  return Object.entries(wordCounts)
    .map(([text, count]) => ({ text, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50)
}

// Extract phrases from conversations
function extractPhrases(conversations: Conversation[]): Array<{text: string, value: number}> {
  const phraseCounts: Record<string, number> = {}
  
  const phrasePatterns = [
    /how (do|can|to|does|should) \w+ \w+/gi,
    /what (is|are|does|do) \w+ \w+/gi,
    /when (is|are|does|will) \w+ \w+/gi,
    /where (is|are|does|can) \w+ \w+/gi,
    /why (is|are|does|do) \w+ \w+/gi,
    /can (i|you|we) \w+ \w+/gi,
    /problem with \w+ \w+/gi,
    /issue with \w+ \w+/gi,
    /error (in|with) \w+ \w+/gi,
  ]
  
  conversations.forEach(conv => {
    const text = conv.lastMessage.toLowerCase()
    
    phrasePatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim()
          if (cleaned.length > 5) {
            phraseCounts[cleaned] = (phraseCounts[cleaned] || 0) + 1
          }
        })
      }
    })
  })
  
  return Object.entries(phraseCounts)
    .filter(([_, count]) => count >= 2)
    .map(([text, count]) => ({ text, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 30)
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
  const fgRef = useRef<any>()
  const { data: conversations = [], isLoading, refetch } = useConversations()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [currentTab, setCurrentTab] = useState('all')
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'cluster'>('cluster')
  const [clusterViewMode, setClusterViewMode] = useState<'category' | 'resolution' | 'channel' | 'wordcloud' | 'phrasecloud'>('category')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredNode, setHoveredNode] = useState<any>(null)

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

  // Calculate word and phrase data
  const wordData = useMemo(() => {
    if (clusterViewMode !== 'wordcloud' || conversations.length === 0) return []
    return extractWords(conversations)
  }, [conversations, clusterViewMode])

  const phraseData = useMemo(() => {
    if (clusterViewMode !== 'phrasecloud' || conversations.length === 0) return []
    return extractPhrases(conversations)
  }, [conversations, clusterViewMode])

  // Transform conversations into graph data
  const graphData = useMemo(() => {
    // Get the appropriate categories based on view mode
    const categories = clusterViewMode === 'category' ? conversationCategories : 
                      clusterViewMode === 'resolution' ? resolutionCategories : 
                      channelCategories
    
    // Create nodes for conversations
    const nodes = sortedConversations.map(conv => ({
      id: conv.id,
      name: conv.user.name,
      category: clusterViewMode === 'category' ? categorizeConversation(conv) : 
                clusterViewMode === 'resolution' ? categorizeByResolution(conv) : 
                conv.channel,
      agentId: conv.agentId,
      sentiment: conv.metadata?.sentiment || 'neutral',
      messageCount: conv.messageCount,
      lastMessage: conv.lastMessage,
      shortMessage: getShortMessage(conv.lastMessage),
      status: conv.status,
      channel: conv.channel,
      satisfaction: conv.satisfaction,
      val: 6,
      conversation: conv
    }))

    // Create category center nodes (invisible anchors)
    const categoryNodes = Object.entries(categories).map(([key, config]) => ({
      id: `category-${key}`,
      name: config.label,
      category: key,
      isCategory: true,
      val: 0.1,
      fx: null,
      fy: null
    }))

    // Create links
    const links: any[] = []

    // Link conversations to their category centers
    nodes.forEach(node => {
      links.push({
        source: node.id,
        target: `category-${node.category}`,
        value: 0.1,
        type: 'category-anchor',
        invisible: true
      })
    })

    // Link conversations within same category
    nodes.forEach((node1, i) => {
      nodes.slice(i + 1).forEach(node2 => {
        if (node1.category === node2.category) {
          links.push({
            source: node1.id,
            target: node2.id,
            value: 0.5,
            type: 'same-category'
          })
        }
      })
    })

    return { 
      nodes: [...nodes, ...categoryNodes], 
      links 
    }
  }, [sortedConversations, clusterViewMode])

  // Filter nodes based on selected category
  const filteredGraphData = useMemo(() => {
    if (selectedCategory === 'all') return graphData

    const filteredNodes = graphData.nodes.filter(n => 
      n.isCategory ? n.id === `category-${selectedCategory}` : n.category === selectedCategory
    )
    
    const nodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredLinks = graphData.links.filter(link => 
      nodeIds.has(link.source.id || link.source) && 
      nodeIds.has(link.target.id || link.target)
    )

    return { nodes: filteredNodes, links: filteredLinks }
  }, [graphData, selectedCategory])

  // Node color function
  const getNodeColor = useCallback((node: any) => {
    if (node.isCategory) return 'transparent'
    const categories = clusterViewMode === 'category' ? conversationCategories : 
                      clusterViewMode === 'resolution' ? resolutionCategories : 
                      channelCategories
    return categories[node.category as keyof typeof categories]?.color || '#94a3b8'
  }, [clusterViewMode])

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    if (node.isCategory) return
    router.push(`/conversations/${node.conversation.id}`)
  }, [router])

  // Zoom controls
  const handleZoomIn = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 1.2, 300)
    }
  }

  const handleZoomOut = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() / 1.2, 300)
    }
  }

  const handleZoomReset = () => {
    if (fgRef.current) {
      fgRef.current.centerAt(0, 0, 400)
      fgRef.current.zoomToFit(400, 100)
    }
  }

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const categories = clusterViewMode === 'category' ? conversationCategories : 
                      clusterViewMode === 'resolution' ? resolutionCategories : 
                      channelCategories
    const stats = Object.keys(categories).reduce((acc, category) => {
      acc[category] = 0
      return acc
    }, {} as Record<string, number>)

    sortedConversations.forEach(conv => {
      const category = clusterViewMode === 'category' ? categorizeConversation(conv) : 
                      clusterViewMode === 'resolution' ? categorizeByResolution(conv) : 
                      conv.channel
      if (stats.hasOwnProperty(category)) {
        stats[category]++
      }
    })

    return stats
  }, [sortedConversations, clusterViewMode])

  // Define d3Force configuration
  const d3ForceConfig = useCallback((engine: any) => {
    engine
      .force('link')
      ?.distance((link: any) => link.invisible ? 50 : 200)
      ?.strength((link: any) => link.invisible ? 0.5 : 0.1)
    engine
      .force('charge')
      ?.strength((node: any) => node.isCategory ? -100 : -3000)
      ?.distanceMax(400)
    engine
      .force('collision', d3.forceCollide().radius((d: any) => d.isCategory ? 100 : d.val + 3))
    
    const categories = clusterViewMode === 'category' ? conversationCategories : 
                      clusterViewMode === 'resolution' ? resolutionCategories : 
                      channelCategories
    const categoryKeys = Object.keys(categories)
    engine
      .force('x', d3.forceX((d: any) => {
        if (d.isCategory) {
          const index = categoryKeys.indexOf(d.category)
          const angle = (index / categoryKeys.length) * 2 * Math.PI
          return Math.cos(angle) * 400
        }
        return 0
      }).strength((d: any) => d.isCategory ? 0.3 : 0.05))
      .force('y', d3.forceY((d: any) => {
        if (d.isCategory) {
          const index = categoryKeys.indexOf(d.category)
          const angle = (index / categoryKeys.length) * 2 * Math.PI
          return Math.sin(angle) * 400
        }
        return 0
      }).strength((d: any) => d.isCategory ? 0.3 : 0.05))
  }, [clusterViewMode])

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
              <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 flex">
                <Button
                  variant={viewMode === 'cluster' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cluster')}
                  className="gap-2"
                >
                  <Network className="w-4 h-4" />
                  Cluster
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <LayoutList className="w-4 h-4" />
                  List
                </Button>
              </div>
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

            {/* View Mode Filter - Only show in cluster view */}
            {viewMode === 'cluster' && (
              <Select value={clusterViewMode} onValueChange={(value: 'category' | 'resolution' | 'channel' | 'wordcloud' | 'phrasecloud') => {
                setClusterViewMode(value)
                setSelectedCategory('all')
              }}>
                <SelectTrigger className="w-[200px]">
                  <Eye className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>By Category</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="resolution">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>By Resolution</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="channel">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>By Channel</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="wordcloud">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      <span>Word Cloud</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="phrasecloud">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      <span>Phrase Cloud</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Channel Filter - Only show in list view */}
            {viewMode === 'list' && (
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
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === 'list' ? (
          <>
            {/* List View */}
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
                {sortedConversations.length === 0 ? (
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
          </>
        ) : (
          /* Cluster View */
          <div className="h-[calc(100vh-280px)] relative bg-gray-50 dark:bg-[#0c0c0c] rounded-xl overflow-hidden">
            {clusterViewMode === 'wordcloud' || clusterViewMode === 'phrasecloud' ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="w-full h-full max-w-6xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {clusterViewMode === 'wordcloud' ? 'Most Common Words' : 'Most Common Phrases'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {clusterViewMode === 'wordcloud' 
                        ? `Analyzing ${wordData.length} unique words from ${conversations.length} conversations`
                        : `Found ${phraseData.length} common phrases from ${conversations.length} conversations`}
                    </p>
                  </div>
                  <div className="h-[calc(100%-100px)] overflow-auto">
                    {/* Custom word/phrase cloud */}
                    <div className="flex flex-wrap gap-4 justify-center items-center p-8">
                      {(clusterViewMode === 'wordcloud' ? wordData : phraseData).map((item, index) => {
                        const maxValue = Math.max(...(clusterViewMode === 'wordcloud' ? wordData : phraseData).map(d => d.value))
                        const minValue = Math.min(...(clusterViewMode === 'wordcloud' ? wordData : phraseData).map(d => d.value))
                        const normalizedValue = (item.value - minValue) / (maxValue - minValue || 1)
                        const fontSize = 0.8 + normalizedValue * 2.5 // 0.8rem to 3.3rem
                        const opacity = 0.6 + normalizedValue * 0.4 // 0.6 to 1
                        const colors = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4']
                        const color = colors[index % colors.length]
                        
                        return (
                          <div
                            key={item.text}
                            className="hover:scale-110 transition-transform cursor-pointer"
                            style={{
                              fontSize: `${fontSize}rem`,
                              opacity,
                              color,
                              fontWeight: normalizedValue > 0.5 ? 600 : 400,
                            }}
                            title={`${item.text}: ${item.value} occurrences`}
                          >
                            {item.text}
                          </div>
                        )
                      })}
                    </div>
                    {(clusterViewMode === 'wordcloud' ? wordData : phraseData).length === 0 && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            {clusterViewMode === 'wordcloud' 
                              ? 'No words to display. Conversations may be loading...'
                              : 'No phrases found. Try adding more conversations.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <ForceGraph2D
              ref={fgRef}
              graphData={filteredGraphData}
              nodeLabel={node => node.isCategory ? '' : `${node.name}: ${node.shortMessage}`}
              nodeColor={getNodeColor}
              nodeVal="val"
              linkColor={link => link.invisible ? 'transparent' : 'rgba(148, 163, 184, 0.1)'}
              linkWidth={link => link.invisible ? 0 : 1}
              backgroundColor="#0c0c0c"
              onNodeClick={handleNodeClick}
              onNodeHover={node => setHoveredNode(node?.isCategory ? null : node)}
              enableNodeDrag={true}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              cooldownTicks={100}
              warmupTicks={100}
              onEngineStop={() => {
                if (fgRef.current && filteredGraphData.nodes.length > 0) {
                  setTimeout(() => {
                    fgRef.current.centerAt(0, 0, 400)
                    fgRef.current.zoomToFit(400, 100)
                  }, 100)
                }
              }}
              d3Force={d3ForceConfig}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                if (!node.x || !node.y || node.isCategory) return

                const categories = clusterViewMode === 'category' ? conversationCategories : 
                                  clusterViewMode === 'resolution' ? resolutionCategories : 
                                  channelCategories
                const category = categories[node.category as keyof typeof categories]
                
                // Draw node
                ctx.fillStyle = category.color + 'cc'
                ctx.beginPath()
                ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI)
                ctx.fill()

                // Hover effect
                if (hoveredNode?.id === node.id) {
                  ctx.shadowColor = category.color
                  ctx.shadowBlur = 20
                  ctx.strokeStyle = category.color
                  ctx.lineWidth = 2
                  ctx.stroke()
                  ctx.shadowBlur = 0
                }

                // Show details when zoomed
                if (globalScale > 2) {
                  ctx.font = `${10 / globalScale}px Sans-Serif`
                  ctx.fillStyle = '#000'
                  ctx.textAlign = 'center'
                  ctx.fillText(node.name, node.x, node.y + node.val + 15 / globalScale)
                }
              }}
            />)}

            {/* Categories Panel - Only show for non-cloud views */}
            {(clusterViewMode !== 'wordcloud' && clusterViewMode !== 'phrasecloud') && (
            <div className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 w-80">
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-4">
                  {clusterViewMode === 'category' ? 'Conversation Categories' : 
                   clusterViewMode === 'resolution' ? 'Resolution Status' : 
                   'Communication Channels'}
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full flex items-center justify-between py-2 px-2 rounded-lg transition-colors ${
                      selectedCategory === 'all' ? 'bg-gray-100 dark:bg-neutral-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">Show All</span>
                    </div>
                    <span className="text-sm font-semibold">{sortedConversations.length}</span>
                  </button>
                  
                  {Object.entries(clusterViewMode === 'category' ? conversationCategories : 
                                   clusterViewMode === 'resolution' ? resolutionCategories : 
                                   channelCategories).map(([key, config]) => {
                    const Icon = config.icon
                    const count = categoryStats[key]
                    
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
                        className={`w-full flex items-center justify-between py-2 px-2 rounded-lg transition-colors ${
                          selectedCategory === key ? 'bg-gray-100 dark:bg-neutral-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                          <Icon className="w-4 h-4" style={{ color: config.color }} />
                          <span className="text-sm font-medium">{config.label}</span>
                        </div>
                        <span className="text-sm font-semibold">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>)}

            {/* Zoom Controls - Only show for non-cloud views */}
            {(clusterViewMode !== 'wordcloud' && clusterViewMode !== 'phrasecloud') && (
            <div className="absolute top-4 right-4 flex items-start gap-2">
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Click + drag</span>
              </div>
              
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex overflow-hidden">
                <button
                  onClick={handleZoomIn}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="border-l border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleZoomReset}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5"
                >
                  <Focus className="w-3.5 h-3.5" />
                </button>
                <div className="border-l border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleZoomOut}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            )}

            {/* Hover Details - Only show for non-cloud views */}
            {(clusterViewMode !== 'wordcloud' && clusterViewMode !== 'phrasecloud') && hoveredNode && !hoveredNode.isCategory && (
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-xl shadow-2xl p-5 max-w-md border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{hoveredNode.name}</h3>
                  <Badge style={{ 
                    backgroundColor: (clusterViewMode === 'category' ? conversationCategories : 
                                      clusterViewMode === 'resolution' ? resolutionCategories : 
                                      channelCategories)[hoveredNode.category]?.color 
                  }}>
                    {(clusterViewMode === 'category' ? conversationCategories : 
                      clusterViewMode === 'resolution' ? resolutionCategories : 
                      channelCategories)[hoveredNode.category]?.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {hoveredNode.lastMessage}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{hoveredNode.messageCount} messages</span>
                  <span>•</span>
                  <span>{hoveredNode.channel}</span>
                  <span>•</span>
                  <span>{hoveredNode.status}</span>
                  {hoveredNode.satisfaction && (
                    <>
                      <span>•</span>
                      <span>Satisfaction: {hoveredNode.satisfaction}/5</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}