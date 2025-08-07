'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Settings,
  Lightbulb,
  ArrowRight,
  MessageSquare,
  Brain,
  Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { OrchestratorResponse } from '@/types'
import { parseAIResponseToSuggestions, PERSONALITY_TRAITS, CAPABILITIES, CHANNELS } from '@/lib/meta-agent'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MetaAgentChatProps {
  onSuggestionApply?: (suggestions: Partial<OrchestratorResponse>) => void
  initialMessage?: string
  className?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: Partial<OrchestratorResponse>
}

export function MetaAgentChat({ 
  onSuggestionApply, 
  initialMessage,
  className 
}: MetaAgentChatProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [expandedSuggestions, setExpandedSuggestions] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    setMessages
  } = useChat({
    api: '/api/meta-agent/chat',
    initialMessages: initialMessage ? [{
      id: 'initial',
      role: 'user' as const,
      content: initialMessage,
    }] : [],
    onFinish: (message) => {
      // Parse AI response for suggestions
      const suggestions = parseAIResponseToSuggestions(message.content)
      
      // Update the message with suggestions
      setMessages(prev => prev.map(msg => 
        msg.id === message.id 
          ? { ...msg, suggestions } as any
          : msg
      ))
    },
    onError: (error) => {
      toast.error('Failed to get response from Meta Agent. Please try again.')
      console.error('Meta Agent chat error:', error)
    }
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const applySuggestions = (suggestions: Partial<OrchestratorResponse>) => {
    if (onSuggestionApply) {
      onSuggestionApply(suggestions)
      toast.success('Suggestions applied to form')
    }
  }

  const handleQuickQuestion = (question: string) => {
    handleInputChange({ target: { value: question } } as any)
  }

  const quickQuestions = [
    "Help me create a customer support agent",
    "What's the best configuration for a sales assistant?",
    "I need an agent for content creation",
    "How do I set up a data analysis agent?",
    "What personality traits work best for technical support?"
  ]

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-muted/50">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Meta Agent</h3>
          <p className="text-xs text-muted-foreground">AI Assistant for Agent Design</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => reload()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Welcome to Meta Agent</h4>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                I'm here to help you design and configure AI agents. Ask me about agent personalities, 
                capabilities, system prompts, or any other aspect of agent creation.
              </p>
              
              {/* Quick Questions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-3">Try asking:</p>
                <div className="grid gap-2">
                  {quickQuestions.slice(0, 3).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto p-3 text-xs"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={cn(
                  "max-w-[80%] space-y-2",
                  message.role === 'user' ? "items-end" : "items-start"
                )}>
                  {/* Message Content */}
                  <Card className={cn(
                    "relative",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    <CardContent className="p-3">
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      
                      {/* Message Actions */}
                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Suggestions */}
                  {message.role === 'assistant' && (message as any).suggestions && (
                    <Card className="border-primary/20">
                      <Collapsible
                        open={expandedSuggestions === message.id}
                        onOpenChange={(open) => 
                          setExpandedSuggestions(open ? message.id : null)
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <CardHeader className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm">Agent Suggestions</CardTitle>
                              </div>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ArrowRight className={cn(
                                  "h-3 w-3 transition-transform",
                                  expandedSuggestions === message.id && "rotate-90"
                                )} />
                              </Button>
                            </div>
                            <CardDescription className="text-xs">
                              Click to view configuration recommendations
                            </CardDescription>
                          </CardHeader>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <Tabs defaultValue="config" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="config" className="text-xs">Configuration</TabsTrigger>
                                <TabsTrigger value="questions" className="text-xs">Next Steps</TabsTrigger>
                              </TabsList>

                              <TabsContent value="config" className="space-y-3 mt-3">
                                {/* Personality Suggestions */}
                                {(message as any).suggestions.suggestedConfig?.personality?.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                                      <Brain className="h-3 w-3" />
                                      Personality Traits
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                      {(message as any).suggestions.suggestedConfig.personality.map((trait: string) => (
                                        <Badge key={trait} variant="secondary" className="text-xs">
                                          {PERSONALITY_TRAITS.find(t => t.id === trait)?.label || trait}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Capability Suggestions */}
                                {(message as any).suggestions.suggestedConfig?.capabilities?.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                                      <Zap className="h-3 w-3" />
                                      Capabilities
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                      {(message as any).suggestions.suggestedConfig.capabilities.map((capability: string) => (
                                        <Badge key={capability} variant="outline" className="text-xs">
                                          {CAPABILITIES.find(c => c.id === capability)?.label || capability}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Channel Suggestions */}
                                {(message as any).suggestions.suggestedConfig?.integrations?.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                                      <Settings className="h-3 w-3" />
                                      Channels
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                      {(message as any).suggestions.suggestedConfig.integrations.map((channel: string) => (
                                        <Badge key={channel} variant="default" className="text-xs">
                                          {CHANNELS.find(c => c.id === channel)?.label || channel}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {onSuggestionApply && (
                                  <Button
                                    size="sm"
                                    onClick={() => applySuggestions((message as any).suggestions)}
                                    className="w-full mt-3"
                                  >
                                    Apply Suggestions to Form
                                  </Button>
                                )}
                              </TabsContent>

                              <TabsContent value="questions" className="mt-3">
                                {(message as any).suggestions.nextQuestions?.length > 0 ? (
                                  <div className="space-y-2">
                                    {(message as any).suggestions.nextQuestions.map((question: string, index: number) => (
                                      <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-left justify-start h-auto p-2 text-xs"
                                        onClick={() => handleQuickQuestion(question)}
                                      >
                                        <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                                        {question}
                                      </Button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground text-center py-4">
                                    No follow-up questions available
                                  </p>
                                )}
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Meta Agent is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error.message || 'An error occurred while communicating with the Meta Agent.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me about agent design, configuration, or best practices..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        {/* Quick Actions */}
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {quickQuestions.slice(3).map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => handleQuickQuestion(question)}
                disabled={isLoading}
              >
                {question}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
