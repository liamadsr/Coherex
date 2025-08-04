'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Send,
  MoreHorizontal,
  User,
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Flag,
  Star,
  Archive,
  MessageSquare,
  Phone,
  Mail,
  Paperclip,
  Smile,
  Info,
  ChevronDown
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
import { ConversationDetail } from '@/components/conversations/ConversationDetail'
import { useConversation } from '@/hooks/queries'
import { toast } from 'sonner'
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
  archived: Archive,
}

export default function ConversationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  const { data: conversation, isLoading, refetch } = useConversation(conversationId)

  // Auto-refresh conversation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [refetch])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [conversation?.messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    setIsTyping(true)
    try {
      // In a real app, this would send the message via API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Message sent')
      setMessage('')
      refetch()
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsTyping(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      // In a real app, this would update via API
      toast.success(`Conversation marked as ${newStatus}`)
      refetch()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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

  if (!conversation) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversation Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The conversation you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/conversations')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Conversations
          </Button>
        </div>
      </MainLayout>
    )
  }

  const StatusIcon = statusIcons[conversation.status] || Clock

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="p-4 border-b bg-white dark:bg-gray-900">
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
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversation.user?.avatar} />
                  <AvatarFallback>
                    {conversation.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{conversation.user?.name || 'Unknown User'}</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{conversation.user?.email}</span>
                    <span>•</span>
                    <span>{conversation.channel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Select value={conversation.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Active</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Resolved</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="escalated">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Escalated</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export Conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag className="mr-2 h-4 w-4" />
                    Flag for Review
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="mr-2 h-4 w-4" />
                    Mark as Important
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Conversation Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ConversationDetail 
                conversation={conversation}
                onClose={() => router.push('/conversations')}
              />
            </div>

            {/* Message Input */}
            {conversation.status === 'active' && (
              <div className="p-4 border-t bg-white dark:bg-gray-900">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[80px] resize-none"
                      disabled={isTyping}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isTyping}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="w-80 border-l p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{conversation.user?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{conversation.user?.email || 'No email'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Customer Since</p>
                    <p className="font-medium">
                      {new Date(conversation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Conversation Details */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Conversation Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Channel</p>
                    <p className="font-medium capitalize">{conversation.channel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Started</p>
                    <p className="font-medium">
                      {new Date(conversation.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Messages</p>
                    <p className="font-medium">{conversation.messageCount}</p>
                  </div>
                  {conversation.satisfaction && (
                    <div>
                      <p className="text-gray-500">Satisfaction</p>
                      <p className="font-medium">{conversation.satisfaction}/5 ⭐</p>
                    </div>
                  )}
                  {conversation.tags && conversation.tags.length > 0 && (
                    <div>
                      <p className="text-gray-500 mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {conversation.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Agent Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Bot className="w-4 h-4 mr-2" />
                  Assigned Agent
                </h3>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Support Agent</p>
                    <p className="text-xs text-gray-500">AI Assistant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}