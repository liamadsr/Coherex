'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { SettingsPageLayout } from '@/components/settings/SettingsPageLayout'

export default function NotificationSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    email: {
      newConversation: true,
      agentUpdates: true,
      teamInvites: true,
      weeklyDigest: false,
      productUpdates: true,
    },
    push: {
      enabled: true,
      newConversation: true,
      agentUpdates: false,
      mentions: true,
    },
    frequency: 'realtime'
  })

  const handleSave = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Notification preferences updated')
    }, 1000)
  }

  return (
    <SettingsPageLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure how and when you receive notifications
          </p>
        </div>

        <div className="space-y-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Choose which notifications you'd like to receive via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-conversation">New Conversations</Label>
                <p className="text-sm text-gray-500">Receive emails when new conversations are started</p>
              </div>
              <Switch
                id="new-conversation"
                checked={settings.email.newConversation}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, email: { ...settings.email, newConversation: checked } })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="agent-updates">Agent Updates</Label>
                <p className="text-sm text-gray-500">Get notified when agents are updated or deployed</p>
              </div>
              <Switch
                id="agent-updates"
                checked={settings.email.agentUpdates}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, email: { ...settings.email, agentUpdates: checked } })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="team-invites">Team Invites</Label>
                <p className="text-sm text-gray-500">Receive invitations to join teams</p>
              </div>
              <Switch
                id="team-invites"
                checked={settings.email.teamInvites}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, email: { ...settings.email, teamInvites: checked } })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-gray-500">Receive a weekly summary of activity</p>
              </div>
              <Switch
                id="weekly-digest"
                checked={settings.email.weeklyDigest}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, email: { ...settings.email, weeklyDigest: checked } })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="product-updates">Product Updates</Label>
                <p className="text-sm text-gray-500">Stay informed about new features and improvements</p>
              </div>
              <Switch
                id="product-updates"
                checked={settings.email.productUpdates}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, email: { ...settings.email, productUpdates: checked } })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>
              Manage browser push notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-enabled">Enable Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications in your browser</p>
              </div>
              <Switch
                id="push-enabled"
                checked={settings.push.enabled}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, push: { ...settings.push, enabled: checked } })
                }
              />
            </div>

            {settings.push.enabled && (
              <>
                <div className="flex items-center justify-between pl-6">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-conversation">New Conversations</Label>
                    <p className="text-sm text-gray-500">Browser notifications for new conversations</p>
                  </div>
                  <Switch
                    id="push-conversation"
                    checked={settings.push.newConversation}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, push: { ...settings.push, newConversation: checked } })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pl-6">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-mentions">Mentions</Label>
                    <p className="text-sm text-gray-500">Get notified when you're mentioned</p>
                  </div>
                  <Switch
                    id="push-mentions"
                    checked={settings.push.mentions}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, push: { ...settings.push, mentions: checked } })
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Frequency</CardTitle>
            <CardDescription>
              How often would you like to receive notifications?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={settings.frequency}
              onValueChange={(value) => setSettings({ ...settings, frequency: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="realtime" id="realtime" />
                <Label htmlFor="realtime">Real-time</Label>
                <span className="text-sm text-gray-500">Get notifications as they happen</span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hourly" id="hourly" />
                <Label htmlFor="hourly">Hourly</Label>
                <span className="text-sm text-gray-500">Batch notifications every hour</span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
                <span className="text-sm text-gray-500">Receive a daily summary</span>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
          </div>
        </div>
      </div>
    </SettingsPageLayout>
  )
}