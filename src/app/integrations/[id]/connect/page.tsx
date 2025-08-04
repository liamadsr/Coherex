'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  HelpCircle,
  Eye,
  EyeOff,
  Shield,
  Link,
  Key,
  Settings2,
  TestTube,
  ExternalLink
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

// Integration configurations
const integrationConfigs: Record<string, any> = {
  slack: {
    name: 'Slack',
    icon: '💜',
    description: 'Connect Blockwork to your Slack workspace',
    fields: [
      { id: 'workspace', label: 'Workspace URL', type: 'text', placeholder: 'your-workspace.slack.com', required: true },
      { id: 'token', label: 'Bot User OAuth Token', type: 'password', placeholder: 'xoxb-...', required: true },
      { id: 'channels', label: 'Default Channels', type: 'text', placeholder: '#general, #support', hint: 'Comma-separated list' },
    ],
    permissions: [
      'Read messages in public channels',
      'Send messages',
      'Access user profiles',
      'Create and manage webhooks',
    ],
    oauth: true,
    webhooks: true,
    testEndpoint: '/api/integrations/slack/test',
  },
  zendesk: {
    name: 'Zendesk',
    icon: '🟢',
    description: 'Sync tickets and customer data with Zendesk',
    fields: [
      { id: 'subdomain', label: 'Subdomain', type: 'text', placeholder: 'yourcompany', required: true, hint: 'From yourcompany.zendesk.com' },
      { id: 'email', label: 'Email', type: 'email', placeholder: 'admin@company.com', required: true },
      { id: 'apiToken', label: 'API Token', type: 'password', required: true },
      { id: 'syncInterval', label: 'Sync Interval', type: 'select', options: [
        { value: '300', label: 'Every 5 minutes' },
        { value: '900', label: 'Every 15 minutes' },
        { value: '1800', label: 'Every 30 minutes' },
        { value: '3600', label: 'Every hour' },
      ], default: '900' },
    ],
    permissions: [
      'Read and write tickets',
      'Access customer data',
      'Manage tags and custom fields',
      'View analytics and reports',
    ],
    oauth: false,
    webhooks: true,
    testEndpoint: '/api/integrations/zendesk/test',
  },
  'google-drive': {
    name: 'Google Drive',
    icon: '🔷',
    description: 'Access and sync files from Google Drive',
    fields: [],
    permissions: [
      'View and manage files',
      'Create and delete files',
      'Share files and manage permissions',
      'Access file metadata',
    ],
    oauth: true,
    webhooks: false,
    testEndpoint: '/api/integrations/google-drive/test',
  },
}

export default function IntegrationConnectPage() {
  const router = useRouter()
  const params = useParams()
  const integrationId = params.id as string
  const config = integrationConfigs[integrationId] || {}

  const [formData, setFormData] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [acceptedPermissions, setAcceptedPermissions] = useState(false)

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock success/failure
      const success = Math.random() > 0.3
      setTestResult({
        success,
        message: success 
          ? 'Connection test successful! Your credentials are valid.' 
          : 'Connection failed. Please check your credentials and try again.'
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: 'An error occurred while testing the connection.'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleConnect = async () => {
    // Validate required fields
    const missingFields = config.fields
      ?.filter((field: any) => field.required && !formData[field.id])
      .map((field: any) => field.label)

    if (missingFields?.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`)
      return
    }

    if (!acceptedPermissions) {
      toast.error('Please accept the required permissions')
      return
    }

    setIsConnecting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`${config.name} connected successfully!`)
      router.push('/integrations/connected')
    } catch (error) {
      toast.error('Failed to connect integration')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleOAuthConnect = () => {
    // In real app, would redirect to OAuth flow
    toast.info('Redirecting to authentication...')
    setTimeout(() => {
      toast.success('Authentication successful!')
      router.push('/integrations/connected')
    }, 2000)
  }

  if (!config.name) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
          <h1 className="text-2xl font-bold">Integration Not Found</h1>
          <p className="text-gray-600">The integration you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/integrations')}>
            Browse Integrations
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-4xl">
              {config.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Connect {config.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {config.description}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="configure" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="webhooks" disabled={!config.webhooks}>Webhooks</TabsTrigger>
          </TabsList>

          {/* Configure Tab */}
          <TabsContent value="configure" className="space-y-6">
            {config.oauth ? (
              <Card>
                <CardHeader>
                  <CardTitle>OAuth Authentication</CardTitle>
                  <CardDescription>
                    Connect using your {config.name} account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Secure Authentication</AlertTitle>
                    <AlertDescription>
                      You'll be redirected to {config.name} to authorize Blockwork. 
                      We never store your {config.name} password.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleOAuthConnect}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Link className="mr-2 h-4 w-4" />
                    Connect with {config.name}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>
                    Enter your {config.name} API credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.fields?.map((field: any) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      
                      {field.type === 'select' ? (
                        <Select
                          value={formData[field.id] || field.default}
                          onValueChange={(value) => handleInputChange(field.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option: any) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="relative">
                          <Input
                            id={field.id}
                            type={field.type === 'password' && !showPassword[field.id] ? 'password' : 'text'}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            required={field.required}
                          />
                          {field.type === 'password' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(prev => ({ 
                                ...prev, 
                                [field.id]: !prev[field.id] 
                              }))}
                            >
                              {showPassword[field.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {field.hint && (
                        <p className="text-sm text-gray-500">{field.hint}</p>
                      )}
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="flex-1"
                    >
                      {isTesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="mr-2 h-4 w-4" />
                      )}
                      Test Connection
                    </Button>
                    
                    <Button
                      onClick={handleConnect}
                      disabled={isConnecting || !acceptedPermissions}
                      className="flex-1"
                    >
                      {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Connect
                    </Button>
                  </div>

                  {testResult && (
                    <Alert variant={testResult.success ? 'default' : 'destructive'}>
                      {testResult.success ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>{testResult.message}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Required Permissions</CardTitle>
                <CardDescription>
                  {config.name} will need access to the following
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {config.permissions?.map((permission: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="accept-permissions"
                    checked={acceptedPermissions}
                    onCheckedChange={(checked) => setAcceptedPermissions(checked as boolean)}
                  />
                  <label
                    htmlFor="accept-permissions"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I understand and accept these permissions
                  </label>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Data Security</AlertTitle>
                  <AlertDescription>
                    Your data is encrypted and stored securely. You can revoke access at any time from the integrations page.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  Set up webhooks to receive real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={`https://app.blockwork.ai/webhooks/${integrationId}`}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://app.blockwork.ai/webhooks/${integrationId}`)
                        toast.success('Webhook URL copied!')
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Add this URL to your {config.name} webhook settings
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      value="whsec_1234567890abcdef"
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText('whsec_1234567890abcdef')
                        toast.success('Webhook secret copied!')
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Use this secret to verify webhook signatures
                  </p>
                </div>

                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertTitle>Setup Instructions</AlertTitle>
                  <AlertDescription>
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                      <li>Copy the webhook URL and secret above</li>
                      <li>Go to your {config.name} webhook settings</li>
                      <li>Create a new webhook with the URL</li>
                      <li>Select the events you want to receive</li>
                      <li>Save and test the webhook</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <Button variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open {config.name} Webhook Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}