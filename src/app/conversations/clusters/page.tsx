'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { 
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Palette,
  BarChart3,
  Info,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  Bug,
  Lightbulb,
  ShoppingCart,
  HeadphonesIcon,
  FileQuestion,
  Activity,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Move,
  Focus,
  Network,
  RefreshCw,
  Mail,
  Phone,
  MessageSquare,
  Slack,
  Cloud,
  Type
} from 'lucide-react'
import { MainLayout } from '@/components/layouts/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useConversations } from '@/hooks/queries'
import { Conversation } from '@/types'
import * as d3 from 'd3-force'
import { scaleOrdinal } from 'd3-scale'
import { cn } from '@/lib/utils'

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
})

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

// Categorize conversation based on content
function categorizeConversation(conversation: Conversation): keyof typeof conversationCategories {
  const content = conversation.lastMessage ? conversation.lastMessage.toLowerCase() : ''
  const allContent = conversation.messages 
    ? conversation.messages.map(m => m.content.toLowerCase()).join(' ')
    : content
  
  const combinedContent = `${content} ${allContent}`
  
  for (const [category, config] of Object.entries(conversationCategories)) {
    if (category === 'other') continue
    
    for (const keyword of config.keywords) {
      if (combinedContent.includes(keyword)) {
        return category as keyof typeof conversationCategories
      }
    }
  }
  
  return 'other'
}

// Categorize conversation based on resolution status
function categorizeByResolution(conversation: Conversation): keyof typeof resolutionCategories {
  if (conversation.status === 'resolved') {
    // Check satisfaction score
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

// Get a shortened version of the message for display
function getShortMessage(message: string, maxLength: number = 40): string {
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
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

export default function ConversationsClustersPage() {
  const router = useRouter()
  const fgRef = useRef<any>()
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [hoveredNode, setHoveredNode] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'category' | 'resolution' | 'channel' | 'wordcloud' | 'phrasecloud'>('category')
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const linkDistance = 200
  const chargeStrength = -3000
  const showConversationDetails = true
  const showConnections = true
  const nodeSize = 'uniform'
  
  const { data: conversations = [], isLoading, refetch } = useConversations()

  // Calculate word and phrase data
  const wordData = useMemo(() => {
    if (viewMode !== 'wordcloud' || conversations.length === 0) return []
    return extractWords(conversations)
  }, [conversations, viewMode])

  const phraseData = useMemo(() => {
    if (viewMode !== 'phrasecloud' || conversations.length === 0) return []
    return extractPhrases(conversations)
  }, [conversations, viewMode])

  // Auto-refresh conversations every 10 seconds
  useEffect(() => {
    if (!isAutoRefresh) return
    
    const interval = setInterval(() => {
      refetch()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [isAutoRefresh, refetch])

  // Transform conversations into graph data with category grouping
  const graphData = useMemo(() => {
    // Get the appropriate categories based on view mode
    const categories = viewMode === 'category' ? conversationCategories : 
                      viewMode === 'resolution' ? resolutionCategories : 
                      channelCategories
    
    // Create nodes for conversations
    const nodes = conversations.map(conv => ({
      id: conv.id,
      name: conv.user.name,
      category: viewMode === 'category' ? categorizeConversation(conv) : 
                viewMode === 'resolution' ? categorizeByResolution(conv) : 
                conv.channel,
      agentId: conv.agentId,
      sentiment: conv.metadata?.sentiment || 'neutral',
      messageCount: conv.messageCount,
      lastMessage: conv.lastMessage,
      shortMessage: getShortMessage(conv.lastMessage),
      status: conv.status,
      channel: conv.channel,
      satisfaction: conv.satisfaction,
      val: nodeSize === 'uniform' ? 6 : 
           nodeSize === 'messages' ? Math.max(4, Math.min(10, Math.sqrt(conv.messageCount || 1) * 2)) :
           nodeSize === 'satisfaction' && conv.satisfaction ? conv.satisfaction * 1.5 : 6,
      conversation: conv
    }))

    // Create category center nodes (invisible anchors)
    const categoryNodes = Object.entries(categories).map(([key, config], index) => ({
      id: `category-${key}`,
      name: config.label,
      category: key,
      isCategory: true,
      val: 0.1, // Very small, essentially invisible
      fx: null, // Will be set by force simulation
      fy: null
    }))

    // Create links
    const links: any[] = []
    const linkMap = new Map()

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
          const linkId = `${node1.id}-${node2.id}`
          if (!linkMap.has(linkId)) {
            links.push({
              source: node1.id,
              target: node2.id,
              value: 0.5,
              type: 'same-category'
            })
            linkMap.set(linkId, true)
          }
        }
      })
    })

    return { 
      nodes: [...nodes, ...categoryNodes], 
      links 
    }
  }, [conversations, nodeSize, viewMode])

  // Filter nodes based on search and category
  const filteredData = useMemo(() => {
    let filteredNodes = graphData.nodes.filter(n => !n.isCategory)
    let categoryNodes = graphData.nodes.filter(n => n.isCategory)

    if (searchQuery) {
      filteredNodes = filteredNodes.filter(node => 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filteredNodes = filteredNodes.filter(node => node.category === selectedCategory)
      // Keep only the selected category's center node
      categoryNodes = categoryNodes.filter(node => node.id === `category-${selectedCategory}`)
    }

    // Get unique categories that are actually in the filtered data
    const activeCategories = new Set(filteredNodes.map(n => n.category))
    categoryNodes = categoryNodes.filter(node => {
      const categoryKey = node.id.replace('category-', '')
      return activeCategories.has(categoryKey)
    })

    const allNodes = [...filteredNodes, ...categoryNodes]
    const nodeIds = new Set(allNodes.map(n => n.id))
    const filteredLinks = graphData.links.filter(link => 
      nodeIds.has(link.source.id || link.source) && 
      nodeIds.has(link.target.id || link.target)
    )

    return { nodes: allNodes, links: filteredLinks }
  }, [graphData, searchQuery, selectedCategory])

  // Node color function
  const getNodeColor = useCallback((node: any) => {
    if (node.isCategory) return 'transparent'
    const categories = viewMode === 'category' ? conversationCategories : 
                      viewMode === 'resolution' ? resolutionCategories : 
                      channelCategories
    return categories[node.category as keyof typeof categories]?.color || '#94a3b8'
  }, [viewMode])

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    if (node.isCategory) return
    setSelectedNode(node)
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
      // Account for the 320px (w-80) categories panel on the right
      const centerX = 160 // Shift right to account for left panel
      fgRef.current.centerAt(centerX, 0, 400)
      fgRef.current.zoomToFit(400, 100)
    }
  }

  // Center view when data changes
  useEffect(() => {
    if (fgRef.current && filteredData.nodes.length > 0) {
      // Small delay to ensure the graph has rendered
      const timer = setTimeout(() => {
        // Account for the 320px (w-80) categories panel on the right
        const centerX = 160 // Shift right to account for left panel
        fgRef.current.centerAt(centerX, 0, 400)
        fgRef.current.zoomToFit(400, 100)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [filteredData.nodes.length])

  // Enable trackpad gestures
  useEffect(() => {
    if (fgRef.current && fgRef.current._canvas) {
      const canvas = fgRef.current._canvas
      
      // Prevent default browser zoom on trackpad pinch
      const preventDefaultWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
        }
      }
      
      canvas.addEventListener('wheel', preventDefaultWheel, { passive: false })
      
      return () => {
        canvas.removeEventListener('wheel', preventDefaultWheel)
      }
    }
  }, [fgRef.current])

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const categories = viewMode === 'category' ? conversationCategories : 
                      viewMode === 'resolution' ? resolutionCategories : 
                      channelCategories
    const stats = Object.keys(categories).reduce((acc, category) => {
      acc[category] = 0
      return acc
    }, {} as Record<string, number>)

    graphData.nodes.filter(n => !n.isCategory).forEach(node => {
      if (stats.hasOwnProperty(node.category)) {
        stats[node.category]++
      }
    })

    return stats
  }, [graphData, viewMode])

  // Calculate category positions for background drawing
  const getCategoryPositions = useCallback(() => {
    const positions: Record<string, { x: number, y: number, nodes: any[] }> = {}
    
    filteredData.nodes.filter(n => !n.isCategory).forEach(node => {
      if (!positions[node.category]) {
        positions[node.category] = { x: 0, y: 0, nodes: [] }
      }
      positions[node.category].nodes.push(node)
    })

    // Calculate center and bounds for each category
    Object.entries(positions).forEach(([category, data]) => {
      if (data.nodes.length > 0) {
        data.x = data.nodes.reduce((sum, n) => sum + n.x, 0) / data.nodes.length
        data.y = data.nodes.reduce((sum, n) => sum + n.y, 0) / data.nodes.length
      }
    })

    return positions
  }, [filteredData])

  // Define d3Force configuration
  const d3ForceConfig = useCallback((engine: any) => {
    engine
      .force('link')
      ?.distance((link: any) => link.invisible ? 50 : linkDistance)
      ?.strength((link: any) => link.invisible ? 0.5 : 0.1)
    engine
      .force('charge')
      ?.strength((node: any) => node.isCategory ? -100 : chargeStrength)
      ?.distanceMax(400)
    engine
      .force('collision', d3.forceCollide().radius((d: any) => d.isCategory ? 100 : d.val + 3))
    // Position category centers in a circle
    const categories = viewMode === 'category' ? conversationCategories : 
                      viewMode === 'resolution' ? resolutionCategories : 
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
  }, [viewMode])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white dark:bg-gray-950">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversation Clusters</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visualizing {filteredData.nodes.filter(n => !n.isCategory).length} of {conversations.length} conversations
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
                onClick={() => router.push('/conversations')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                List View
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

            {/* View Mode Toggle */}
            <Select value={viewMode} onValueChange={(value: 'category' | 'resolution' | 'channel' | 'wordcloud' | 'phrasecloud') => {
              setViewMode(value)
              setSelectedCategory('all') // Reset filter when changing view mode
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

          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
          {viewMode === 'wordcloud' || viewMode === 'phrasecloud' ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="w-full h-full max-w-6xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {viewMode === 'wordcloud' ? 'Most Common Words' : 'Most Common Phrases'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {viewMode === 'wordcloud' 
                      ? `Analyzing ${wordData.length} unique words from ${conversations.length} conversations`
                      : `Found ${phraseData.length} common phrases from ${conversations.length} conversations`}
                  </p>
                </div>
                <div className="h-[calc(100%-100px)] overflow-auto">
                  {/* Custom word/phrase cloud */}
                  <div className="flex flex-wrap gap-4 justify-center items-center p-8">
                    {(viewMode === 'wordcloud' ? wordData : phraseData).map((item, index) => {
                      const maxValue = Math.max(...(viewMode === 'wordcloud' ? wordData : phraseData).map(d => d.value))
                      const minValue = Math.min(...(viewMode === 'wordcloud' ? wordData : phraseData).map(d => d.value))
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
                  {(viewMode === 'wordcloud' ? wordData : phraseData).length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {viewMode === 'wordcloud' 
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
              graphData={filteredData}
              nodeLabel={node => node.isCategory ? '' : `${node.name}: ${node.shortMessage}`}
              nodeColor={getNodeColor}
              nodeVal="val"
              linkColor={link => 
                link.invisible ? 'transparent' : 
                showConnections ? 'rgba(148, 163, 184, 0.1)' : 'transparent'
              }
              linkWidth={link => link.invisible ? 0 : 1}
              backgroundColor="transparent"
              linkDirectionalArrowLength={0}
              linkDirectionalArrowRelPos={0}
              linkCurvature={0.2}
              onNodeClick={handleNodeClick}
              onNodeHover={node => setHoveredNode(node?.isCategory ? null : node)}
              enableNodeDrag={true}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              cooldownTicks={100}
              warmupTicks={100}
              onEngineStop={() => {
                if (fgRef.current && filteredData.nodes.length > 0) {
                  setTimeout(() => {
                    // Account for the 320px (w-80) categories panel on the right
                    const centerX = 160 // Shift right to account for left panel
                    fgRef.current.centerAt(centerX, 0, 400)
                    fgRef.current.zoomToFit(400, 100)
                  }, 100)
                }
              }}
              d3Force={d3ForceConfig}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                if (!node.x || !node.y || !isFinite(node.x) || !isFinite(node.y)) return
                if (node.isCategory) return // Don't render category anchor nodes

                const categories = viewMode === 'category' ? conversationCategories : 
                                  viewMode === 'resolution' ? resolutionCategories : 
                                  channelCategories
                const category = categories[node.category as keyof typeof categories]
                
                // Draw node with gradient effect
                ctx.fillStyle = category.color + 'cc'
                ctx.beginPath()
                ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI)
                ctx.fill()

                // Subtle glow effect for hovered node
                if (hoveredNode?.id === node.id) {
                  ctx.shadowColor = category.color
                  ctx.shadowBlur = 20
                  ctx.shadowOffsetX = 0
                  ctx.shadowOffsetY = 0
                  ctx.strokeStyle = category.color
                  ctx.lineWidth = 2
                  ctx.stroke()
                  ctx.shadowBlur = 0
                }

                // Draw conversation details when zoomed in
                if (showConversationDetails && globalScale > 2) {
                  const padding = 4
                  const fontSize = 10 / globalScale
                  ctx.font = `${fontSize}px Sans-Serif`
                  
                  const label = node.name
                  const message = node.shortMessage
                  const nameWidth = ctx.measureText(label).width
                  const messageWidth = ctx.measureText(message).width
                  const maxWidth = Math.max(nameWidth, messageWidth)
                  
                  // Modern card-style background
                  const bgHeight = fontSize * 2.5 + padding * 2
                  const bgY = node.y + node.val + 4
                  
                  // Card shadow
                  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
                  ctx.shadowBlur = 8 / globalScale
                  ctx.shadowOffsetX = 0
                  ctx.shadowOffsetY = 2 / globalScale
                  
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)'
                  ctx.beginPath()
                  ctx.roundRect(
                    node.x - maxWidth / 2 - padding,
                    bgY,
                    maxWidth + padding * 2,
                    bgHeight,
                    4 / globalScale
                  )
                  ctx.fill()
                  
                  // Reset shadow
                  ctx.shadowBlur = 0

                  // Name
                  ctx.fillStyle = '#0f172a'
                  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
                  ctx.textAlign = 'center'
                  ctx.textBaseline = 'top'
                  ctx.fillText(label, node.x, bgY + padding)

                  // Message
                  ctx.font = `400 ${fontSize * 0.9}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
                  ctx.fillStyle = '#64748b'
                  ctx.fillText(message, node.x, bgY + padding + fontSize * 1.2)
                }
              }}
              nodeCanvasObjectMode={() => 'after'}
              onRenderFramePost={(ctx, globalScale) => {
                // Draw category backgrounds and labels
                const categoryPositions = getCategoryPositions()
                
                Object.entries(categoryPositions).forEach(([categoryKey, data]) => {
                  if (data.nodes.length === 0) return
                  
                  // Check if positions are valid
                  if (!isFinite(data.x) || !isFinite(data.y)) return
                  
                  const categories = viewMode === 'category' ? conversationCategories : 
                                    viewMode === 'resolution' ? resolutionCategories : 
                                    channelCategories
                  const category = categories[categoryKey as keyof typeof categories]
                  
                  // Calculate convex hull or bounding circle for the category
                  const radius = Math.sqrt(data.nodes.length) * 60
                  
                  // Draw modern category region with subtle gradient
                  const gradient = ctx.createRadialGradient(data.x, data.y, 0, data.x, data.y, radius)
                  gradient.addColorStop(0, category.bgColor)
                  gradient.addColorStop(0.7, category.bgColor)
                  gradient.addColorStop(1, 'transparent')
                  
                  ctx.fillStyle = gradient
                  ctx.beginPath()
                  ctx.arc(data.x, data.y, radius, 0, 2 * Math.PI)
                  ctx.fill()
                  
                  // Subtle dashed border
                  ctx.strokeStyle = category.borderColor
                  ctx.lineWidth = 1
                  ctx.setLineDash([5, 5])
                  ctx.beginPath()
                  ctx.arc(data.x, data.y, radius, 0, 2 * Math.PI)
                  ctx.stroke()
                  ctx.setLineDash([])
                  
                  // Draw modern category label
                  const fontSize = Math.min(14, 12 / globalScale)
                  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
                  ctx.fillStyle = category.color
                  ctx.textAlign = 'center'
                  ctx.textBaseline = 'middle'
                  
                  // Position label above the cluster
                  ctx.fillText(category.label, data.x, data.y - radius - 25)
                  
                  // Draw count with modern styling
                  const countSize = fontSize * 0.85
                  ctx.font = `400 ${countSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
                  ctx.fillStyle = '#64748b'
                  ctx.fillText(`${data.nodes.length} conversations`, data.x, data.y - radius - 10)
                })
              }}
              linkDirectionalParticles={0}
            />
          )}

          {/* Hover Details - Only show for force graph views */}
          {(viewMode !== 'wordcloud' && viewMode !== 'phrasecloud') && hoveredNode && !hoveredNode.isCategory && (
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl p-5 max-w-md border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{hoveredNode.name}</h3>
                  <Badge style={{ 
                    backgroundColor: (viewMode === 'category' ? conversationCategories : 
                                      viewMode === 'resolution' ? resolutionCategories : 
                                      channelCategories)[hoveredNode.category]?.color 
                  }}>
                    {(viewMode === 'category' ? conversationCategories : 
                      viewMode === 'resolution' ? resolutionCategories : 
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

            {/* Categories Panel - Left Side - Only show for cluster views */}
            {(viewMode !== 'wordcloud' && viewMode !== 'phrasecloud') && (
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 w-80">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">
                    {viewMode === 'category' ? 'Conversation Categories' : 
                     viewMode === 'resolution' ? 'Resolution Status' : 
                     'Communication Channels'}
                  </h3>
                  <span className="text-xs text-gray-500">{conversations.length} total</span>
                </div>
                <div className="space-y-2">
                  {/* Show All button */}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full flex items-center justify-between py-2 px-2 rounded-lg transition-colors ${
                      selectedCategory === 'all' 
                        ? 'bg-gray-100 dark:bg-gray-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">Show All</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{conversations.length}</span>
                      <span className="text-xs text-gray-500 w-10 text-right">100%</span>
                    </div>
                  </button>
                  
                  {/* Category buttons */}
                  {Object.entries(viewMode === 'category' ? conversationCategories : 
                                   viewMode === 'resolution' ? resolutionCategories : 
                                   channelCategories).map(([key, config]) => {
                    const Icon = config.icon
                    const count = categoryStats[key]
                    const percentage = ((count / conversations.length) * 100).toFixed(1)
                    
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
                        className={`w-full flex items-center justify-between py-2 px-2 rounded-lg transition-colors ${
                          selectedCategory === key 
                            ? 'bg-gray-100 dark:bg-gray-800' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full shadow-sm" 
                            style={{ backgroundColor: config.color }}
                          />
                          <Icon className="w-4 h-4" style={{ color: config.color }} />
                          <span className="text-sm font-medium">{config.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">{count}</span>
                          <span className="text-xs text-gray-500 w-10 text-right">{percentage}%</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Filtered: {filteredData.nodes.filter(n => !n.isCategory).length}</span>
                    <span>{new Set(filteredData.nodes.filter(n => !n.isCategory).map(n => n.category)).size} {viewMode === 'category' ? 'categories' : viewMode === 'resolution' ? 'statuses' : 'channels'}</span>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Floating Controls - Top Right - Only show for cluster views */}
            {(viewMode !== 'wordcloud' && viewMode !== 'phrasecloud') && (
              <div className="absolute top-4 right-4 flex items-start gap-2" style={{ zIndex: 100 }}>
              {/* Pan/Drag Indicator */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Click + drag</span>
              </div>
              
              {/* Zoom Controls */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex overflow-hidden">
                <button
                  onClick={handleZoomIn}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 flex items-center justify-center"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="border-l border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleZoomReset}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 flex items-center justify-center"
                  title="Recenter view"
                >
                  <Focus className="w-3.5 h-3.5" />
                </button>
                <div className="border-l border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleZoomOut}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 flex items-center justify-center"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            )}
        </div>
      </div>
    </MainLayout>
  )
}