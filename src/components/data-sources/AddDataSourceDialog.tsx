'use client'

import { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddDataSourceDialogProps {
  onSuccess?: () => void
}

const dataSourceTypes = [
  { value: 'website', label: 'Website', placeholder: 'https://example.com' },
  { value: 'database', label: 'Database', placeholder: 'PostgreSQL, MySQL, etc.' },
  { value: 'git', label: 'Git Repository', placeholder: 'github.com/owner/repo' },
  { value: 'files', label: 'Files', placeholder: 'Local storage path' },
  { value: 'confluence', label: 'Confluence', placeholder: 'Space key (e.g., TECH)' },
  { value: 'api', label: 'API', placeholder: 'https://api.example.com' },
  { value: 'github', label: 'GitHub', placeholder: 'owner/repo' },
  { value: 'gmail', label: 'Gmail', placeholder: 'Gmail account' },
  { value: 'slack', label: 'Slack', placeholder: 'Workspace ID' },
  { value: 'file', label: 'Single File', placeholder: 'Path or URL to file' },
]

export function AddDataSourceDialog({ onSuccess }: AddDataSourceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'website',
    description: '',
    url: '',
    connection: '',
    repository: '',
    location: '',
    space: '',
    syncFrequency: 'Every 6 hours',
    owner: '',
    apiKey: '',
  })

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      toast.error('Please fill in required fields')
      return
    }

    setLoading(true)
    try {
      // Build request matching mock structure
      const requestData: any = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        syncFrequency: formData.syncFrequency,
        owner: formData.owner || 'Current User',
        status: 'active',
        documents: 0,
        size: '0 MB'
      }

      // Add type-specific fields
      switch (formData.type) {
        case 'website':
        case 'api':
          requestData.url = formData.url
          break
        case 'database':
          requestData.connection = formData.connection
          break
        case 'git':
        case 'github':
          requestData.repository = formData.repository
          break
        case 'files':
          requestData.location = formData.location
          break
        case 'confluence':
          requestData.space = formData.space
          break
      }

      // Store API key in config if provided
      if (formData.apiKey) {
        requestData.config = { apiKey: formData.apiKey }
      }

      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Data source "${result.dataSource.name}" created successfully`)
        setOpen(false)
        setFormData({
          name: '',
          type: 'website',
          description: '',
          url: '',
          connection: '',
          repository: '',
          location: '',
          space: '',
          syncFrequency: 'Every 6 hours',
          owner: '',
          apiKey: '',
        })
        onSuccess?.()
      } else {
        toast.error(result.error || 'Failed to create data source')
      }
    } catch (error) {
      console.error('Error creating data source:', error)
      toast.error('Failed to create data source')
    } finally {
      setLoading(false)
    }
  }

  const selectedType = dataSourceTypes.find(t => t.value === formData.type)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Data Source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Data Source</DialogTitle>
          <DialogDescription>
            Connect a new data source to make it available for your agents
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Company Documentation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataSourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic field based on type */}
          {formData.type === 'website' || formData.type === 'api' ? (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder={selectedType?.placeholder}
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
          ) : formData.type === 'database' ? (
            <div className="space-y-2">
              <Label htmlFor="connection">Connection</Label>
              <Input
                id="connection"
                placeholder={selectedType?.placeholder}
                value={formData.connection}
                onChange={(e) => setFormData({ ...formData, connection: e.target.value })}
              />
            </div>
          ) : formData.type === 'git' || formData.type === 'github' ? (
            <div className="space-y-2">
              <Label htmlFor="repository">Repository</Label>
              <Input
                id="repository"
                placeholder={selectedType?.placeholder}
                value={formData.repository}
                onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
              />
            </div>
          ) : formData.type === 'files' ? (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder={selectedType?.placeholder}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          ) : formData.type === 'confluence' ? (
            <div className="space-y-2">
              <Label htmlFor="space">Space</Label>
              <Input
                id="space"
                placeholder={selectedType?.placeholder}
                value={formData.space}
                onChange={(e) => setFormData({ ...formData, space: e.target.value })}
              />
            </div>
          ) : null}

          {['api', 'notion', 'slack'].includes(formData.type) && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key / Token (Optional)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter API key or access token"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="syncFrequency">Sync Frequency</Label>
            <Select
              value={formData.syncFrequency}
              onValueChange={(value) => setFormData({ ...formData, syncFrequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Every hour">Every hour</SelectItem>
                <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Owner (Optional)</Label>
            <Input
              id="owner"
              placeholder="e.g., John Smith, Dev Team"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What kind of data does this source contain?"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Data Source'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}