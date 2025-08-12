'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Send, Lock, MessageSquare, Star, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PreviewData {
  id: string
  agentVersion: {
    id: string
    name: string
    description: string
    config: any
    versionNumber: number
  }
  agent: {
    id: string
    name: string
  }
  requiresPassword: boolean
  includeFeedback: boolean
  conversationsRemaining: number
  expiresAt: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function PreviewPage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    rating: '',
    feedback_text: ''
  })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // Load preview data
  useEffect(() => {
    loadPreview()
  }, [token])

  const loadPreview = async () => {
    try {
      const res = await fetch(`/api/preview/${token}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to load preview')
        return
      }

      setPreviewData(data.preview)
      
      // If no password required, mark as authenticated
      if (!data.preview.requiresPassword) {
        setIsAuthenticated(true)
      }
    } catch (err) {
      setError('Failed to load preview')
    } finally {
      setLoading(false)
    }
  }

  const verifyPassword = async () => {
    try {
      const res = await fetch(`/api/preview/${token}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Incorrect password')
        return
      }

      setIsAuthenticated(true)
      toast.success('Access granted!')
    } catch (err) {
      toast.error('Failed to verify password')
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      // Simulate agent response (in real implementation, this would call the agent API)
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `This is a preview response from ${previewData?.agentVersion.name}. In production, this would be processed by the actual agent with the configured settings.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsProcessing(false)
      }, 1000)
    } catch (err) {
      toast.error('Failed to send message')
      setIsProcessing(false)
    }
  }

  const submitFeedback = async () => {
    try {
      const res = await fetch(`/api/preview/${token}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedbackData,
          rating: feedbackData.rating ? parseInt(feedbackData.rating) : null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit feedback')
        return
      }

      setFeedbackSubmitted(true)
      toast.success('Thank you for your feedback!')
    } catch (err) {
      toast.error('Failed to submit feedback')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Preview Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!previewData) {
    return null
  }

  // Password protection screen
  if (previewData.requiresPassword && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Required
            </CardTitle>
            <CardDescription>
              This preview is password protected. Please enter the password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                placeholder="Enter password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={verifyPassword} className="w-full">
              Verify Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Main preview interface
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  {previewData.agentVersion.name}
                  <Badge variant="secondary">v{previewData.agentVersion.versionNumber}</Badge>
                  <Badge variant="outline">Preview</Badge>
                </h1>
                <p className="text-sm text-muted-foreground">{previewData.agentVersion.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {previewData.includeFeedback && !feedbackSubmitted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedback(!showFeedback)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Feedback
                </Button>
              )}
              <Badge variant="outline">
                {previewData.conversationsRemaining} conversations remaining
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Chat Preview</CardTitle>
                <CardDescription>
                  Test the agent's responses and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-6">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation to test the agent</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isProcessing && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg px-4 py-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100" />
                              <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
                <Separator />
                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Type a message..."
                      disabled={isProcessing}
                    />
                    <Button onClick={sendMessage} disabled={isProcessing || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Panel */}
          <div>
            {showFeedback && !feedbackSubmitted ? (
              <Card>
                <CardHeader>
                  <CardTitle>Share Your Feedback</CardTitle>
                  <CardDescription>
                    Help us improve this agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (optional)</Label>
                    <Input
                      id="name"
                      value={feedbackData.name}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={feedbackData.email}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <RadioGroup
                      value={feedbackData.rating}
                      onValueChange={(value) => setFeedbackData(prev => ({ ...prev, rating: value }))}
                    >
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div key={rating} className="flex items-center">
                            <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                            <Label
                              htmlFor={`rating-${rating}`}
                              className="cursor-pointer ml-1"
                            >
                              <Star className={`h-5 w-5 ${feedbackData.rating >= rating.toString() ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={feedbackData.feedback_text}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, feedback_text: e.target.value }))}
                      placeholder="Share your thoughts..."
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={submitFeedback} 
                    className="w-full"
                    disabled={!feedbackData.rating && !feedbackData.feedback_text}
                  >
                    Submit Feedback
                  </Button>
                </CardFooter>
              </Card>
            ) : feedbackSubmitted ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Thank you for your feedback! Your input helps us improve.
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Agent Configuration</CardTitle>
                  <CardDescription>
                    Current settings for this preview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Model</p>
                    <p className="text-sm text-muted-foreground">
                      {previewData.agentVersion.config.model || 'gpt-4'}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Temperature</p>
                    <p className="text-sm text-muted-foreground">
                      {previewData.agentVersion.config.temperature || 0.7}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Max Tokens</p>
                    <p className="text-sm text-muted-foreground">
                      {previewData.agentVersion.config.maxTokens || 2000}
                    </p>
                  </div>
                  {previewData.agentVersion.config.systemPrompt && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium">System Prompt</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {previewData.agentVersion.config.systemPrompt}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Expires banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-muted border-t p-2">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center text-muted-foreground">
            This preview expires on {new Date(previewData.expiresAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}