'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Link2, 
  Copy, 
  Mail, 
  Shield, 
  Clock, 
  MessageSquare,
  CheckCircle,
  Users,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface PreviewLink {
  id: string
  token: string
  url: string
  expires_at: string
  password_hash: string | null
  max_conversations: number
  conversation_count: number
  include_feedback: boolean
  created_at: string
  last_accessed_at: string | null
  revoked_at: string | null
  isExpired: boolean
  isActive: boolean
}

interface SharePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentId: string
  versionId: string
  versionNumber: number
}

export function SharePreviewModal({
  open,
  onOpenChange,
  agentId,
  versionId,
  versionNumber
}: SharePreviewModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('create')
  const [existingLinks, setExistingLinks] = useState<PreviewLink[]>([])
  const [generatedLink, setGeneratedLink] = useState<PreviewLink | null>(null)
  
  // Form state
  const [settings, setSettings] = useState({
    expirationHours: 72,
    password: '',
    maxConversations: 100,
    includeFeedback: true
  })

  // Load existing preview links when modal opens
  useEffect(() => {
    if (open) {
      loadExistingLinks()
    }
  }, [open])

  const loadExistingLinks = async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}/versions/${versionId}/preview`)
      const data = await res.json()
      
      if (res.ok) {
        setExistingLinks(data.previewLinks)
      }
    } catch (error) {
      console.error('Failed to load preview links:', error)
    }
  }

  const generatePreviewLink = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/agents/${agentId}/versions/${versionId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setGeneratedLink(data.previewLink)
        toast.success('Preview link generated successfully')
        loadExistingLinks()
      } else {
        toast.error(data.error || 'Failed to generate preview link')
      }
    } catch (error) {
      toast.error('Failed to generate preview link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const revokeLink = async (token: string) => {
    try {
      const res = await fetch(`/api/preview/${token}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast.success('Preview link revoked')
        loadExistingLinks()
      } else {
        toast.error('Failed to revoke link')
      }
    } catch (error) {
      toast.error('Failed to revoke link')
    }
  }

  const shareViaEmail = (link: string) => {
    const subject = encodeURIComponent(`Preview: Agent Version ${versionNumber}`)
    const body = encodeURIComponent(`
Hi,

I'd like to share a preview of our agent (Version ${versionNumber}) with you.

You can test it here: ${link}

${settings.password ? `Password: ${settings.password}` : ''}

This link expires in ${settings.expirationHours} hours.

Best regards
    `.trim())
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Share Preview - Version {versionNumber}</DialogTitle>
          <DialogDescription>
            Generate shareable preview links for stakeholder testing
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New Link</TabsTrigger>
            <TabsTrigger value="manage">Manage Links ({existingLinks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            {!generatedLink ? (
              <>
                <div className="space-y-4">
                  {/* Expiration Settings */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Link Expiration
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.expirationHours]}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, expirationHours: value[0] }))}
                        min={1}
                        max={168}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-20 text-sm text-muted-foreground">
                        {settings.expirationHours} hours
                      </span>
                    </div>
                  </div>

                  {/* Password Protection */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Password Protection (optional)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Leave blank for no password"
                      value={settings.password}
                      onChange={(e) => setSettings(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>

                  {/* Conversation Limit */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Maximum Conversations
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.maxConversations]}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, maxConversations: value[0] }))}
                        min={1}
                        max={500}
                        step={10}
                        className="flex-1"
                      />
                      <span className="w-20 text-sm text-muted-foreground">
                        {settings.maxConversations}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Collection */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="feedback" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Collect Feedback
                    </Label>
                    <Switch
                      id="feedback"
                      checked={settings.includeFeedback}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeFeedback: checked }))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={generatePreviewLink} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Preview Link'}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Preview link generated successfully!
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Your Preview Link</CardTitle>
                    <CardDescription>Share this link with stakeholders</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input value={generatedLink.url} readOnly />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedLink.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => shareViaEmail(generatedLink.url)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>

                    {settings.password && (
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <div className="flex gap-2">
                          <Input value={settings.password} readOnly />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyToClipboard(settings.password)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Expires</p>
                        <p>{new Date(generatedLink.expires_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversations</p>
                        <p>{generatedLink.max_conversations} allowed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setGeneratedLink(null)}>
                    Generate Another
                  </Button>
                  <Button onClick={() => onOpenChange(false)}>
                    Done
                  </Button>
                </DialogFooter>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            {existingLinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No preview links created yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {existingLinks.map((link) => (
                  <Card key={link.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={link.isActive ? 'default' : 'secondary'}>
                              {link.isActive ? 'Active' : link.isExpired ? 'Expired' : 'Revoked'}
                            </Badge>
                            {link.password_hash && (
                              <Badge variant="outline">
                                <Shield className="h-3 w-3 mr-1" />
                                Protected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-mono">{link.token.substring(0, 16)}...</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Created {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}</span>
                            <span>{link.conversation_count}/{link.max_conversations} conversations</span>
                            {link.last_accessed_at && (
                              <span>Last accessed {formatDistanceToNow(new Date(link.last_accessed_at), { addSuffix: true })}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(link.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {link.isActive && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => revokeLink(link.token)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}