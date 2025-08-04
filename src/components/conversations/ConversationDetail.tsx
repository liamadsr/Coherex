'use client'

import React, { useState } from 'react'
import { 
  MessageSquare, 
  User, 
  Bot, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreHorizontal,
  Download,
  Flag,
  Star,
  ChevronDown,
  ChevronUp,
  Hash,
  Mail,
  Phone,
  Globe,
  Slack,
  MessageCircle
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Conversation, ConversationMessage } from '@/types'
import { cn } from '@/lib/utils'

interface ConversationDetailProps {
  conversation: Conversation
  onClose?: () => void
}

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  'web-chat': MessageCircle,
  slack: Slack,
  teams: MessageSquare,
  sms: Phone,
  voice: Phone,
}

const statusColors = {
  active: 'bg-green-500',
  resolved: 'bg-blue-500',
  escalated: 'bg-orange-500',
  archived: 'bg-gray-500',
}

export function ConversationDetail({ conversation, onClose }: ConversationDetailProps) {
  const [expandedSections, setExpandedSections] = useState({
    metadata: true,
    messages: true,
    details: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const ChannelIcon = channelIcons[conversation.channel] || Globe

  // Format timestamp
  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Group messages by date
  const groupMessagesByDate = (messages: ConversationMessage[]) => {
    const groups: Record<string, ConversationMessage[]> = {}
    
    messages.forEach(message => {
      const date = formatDate(message.timestamp)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }

  const messageGroups = conversation.messages ? groupMessagesByDate(conversation.messages) : {}

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.user?.avatar} />
              <AvatarFallback>
                {conversation.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{conversation.user?.name || 'Unknown User'}</h3>
              <p className="text-sm text-gray-500">{conversation.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <ChannelIcon className="w-3 h-3" />
              {conversation.channel}
            </Badge>
            <Badge 
              variant="secondary"
              className={cn(
                "text-white",
                statusColors[conversation.status]
              )}
            >
              {conversation.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Metadata */}
        <Collapsible
          open={expandedSections.metadata}
          onOpenChange={() => toggleSection('metadata')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 -mx-2">
            <span className="text-sm font-medium">Conversation Details</span>
            {expandedSections.metadata ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Conversation ID</p>
                <p className="font-mono text-xs">{conversation.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium">
                  {conversation.endedAt ? (
                    `${Math.round((new Date(conversation.endedAt).getTime() - new Date(conversation.startedAt).getTime()) / 60000)} min`
                  ) : (
                    'Ongoing'
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Messages</p>
                <p className="font-medium">{conversation.messageCount}</p>
              </div>
              <div>
                <p className="text-gray-500">Satisfaction</p>
                <p className="font-medium">
                  {conversation.satisfaction ? (
                    <span className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3 h-3",
                            i < (conversation.satisfaction || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </span>
                  ) : (
                    'Not rated'
                  )}
                </p>
              </div>
              {conversation.tags && conversation.tags.length > 0 && (
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {conversation.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6">
        <div className="py-4 space-y-6">
          {Object.entries(messageGroups).map(([date, messages]) => (
            <div key={date}>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-xs text-gray-600 dark:text-gray-400">
                  {date}
                </div>
              </div>
              
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isAgent = message.sender === 'agent'
                  const isFirstInGroup = index === 0 || messages[index - 1].sender !== message.sender
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isAgent ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-start space-x-2 max-w-[70%]",
                          !isAgent && "flex-row-reverse space-x-reverse"
                        )}
                      >
                        {isFirstInGroup && (
                          <Avatar className="h-8 w-8 mt-0.5">
                            {isAgent ? (
                              <>
                                <AvatarFallback className="bg-blue-600 text-white">
                                  <Bot className="w-4 h-4" />
                                </AvatarFallback>
                              </>
                            ) : (
                              <>
                                <AvatarImage src={conversation.user?.avatar} />
                                <AvatarFallback>
                                  {conversation.user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </>
                            )}
                          </Avatar>
                        )}
                        
                        {!isFirstInGroup && <div className="w-8" />}
                        
                        <div className="flex-1">
                          <div
                            className={cn(
                              "rounded-lg px-4 py-2",
                              isAgent
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                : "bg-blue-600 text-white"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            
                            {message.metadata && Object.keys(message.metadata).length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="space-y-1">
                                  {Object.entries(message.metadata).map(([key, value]) => (
                                    <div key={key} className="flex items-center text-xs">
                                      <span className="opacity-70">{key}:</span>
                                      <span className="ml-1 font-medium">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                            {isAgent && (
                              <CheckCircle2 className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Additional Details */}
      <div className="border-t p-6">
        <Collapsible
          open={expandedSections.details}
          onOpenChange={() => toggleSection('details')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 -mx-2">
            <span className="text-sm font-medium">Additional Information</span>
            {expandedSections.details ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="space-y-3 text-sm">
              {conversation.metadata && (
                <>
                  {conversation.metadata.sentiment && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sentiment</span>
                      <Badge
                        variant={
                          conversation.metadata.sentiment === 'positive'
                            ? 'default'
                            : conversation.metadata.sentiment === 'negative'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {conversation.metadata.sentiment}
                      </Badge>
                    </div>
                  )}
                  {conversation.metadata.language && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Language</span>
                      <span className="font-medium uppercase">{conversation.metadata.language}</span>
                    </div>
                  )}
                  {conversation.metadata.platform && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Platform</span>
                      <span className="font-medium capitalize">{conversation.metadata.platform}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}