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
  { value: 'database', label: 'Database', placeholder: 'postgresql://...' },
  { value: 'api', label: 'API', placeholder: 'https://api.example.com' },
  { value: 'file', label: 'File/Document', placeholder: 'Path or URL to file' },
  { value: 'google_drive', label: 'Google Drive', placeholder: 'Drive folder ID' },
  { value: 'github', label: 'GitHub Repository', placeholder: 'owner/repo' },
  { value: 'slack', label: 'Slack', placeholder: 'Workspace ID' },
  { value: 'notion', label: 'Notion', placeholder: 'Database ID' },
]

export function AddDataSourceDialog({ onSuccess }: AddDataSourceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'website',
    description: '',
    url: '',
    apiKey: '',
  })

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      toast.error('Please fill in required fields')
      return
    }

    setLoading(true)
    try {
      const config: any = {}
      
      // Build config based on type
      if (formData.url) config.url = formData.url
      if (formData.apiKey) config.apiKey = formData.apiKey

      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          config
        })
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

          <div className="space-y-2">
            <Label htmlFor="url">
              {formData.type === 'database' ? 'Connection String' : 'URL/Path'}
            </Label>
            <Input
              id="url"
              placeholder={selectedType?.placeholder}
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

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