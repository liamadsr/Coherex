'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Globe, Mail, Phone, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function OrganizationSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [orgData, setOrgData] = useState({
    name: 'Acme Corporation',
    slug: 'acme-corp',
    description: 'Leading provider of innovative AI solutions for enterprise customers.',
    website: 'https://acme.com',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, San Francisco, CA 94105',
    industry: 'Technology',
    size: '100-500 employees'
  })

  const handleSave = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Organization settings updated')
    }, 1000)
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your organization's information and settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Organization Status */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Plan</p>
                <p className="text-2xl font-bold">Enterprise</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Members</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Status</p>
                <Badge variant="default" className="mt-1">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Logo</CardTitle>
            <CardDescription>
              Your logo appears in reports and shared content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  PNG or SVG. Max size 2MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={orgData.name}
                  onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">URL Slug</Label>
                <Input
                  id="org-slug"
                  value={orgData.slug}
                  onChange={(e) => setOrgData({ ...orgData, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-description">Description</Label>
              <Textarea
                id="org-description"
                rows={3}
                value={orgData.description}
                onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-industry">Industry</Label>
                <Input
                  id="org-industry"
                  value={orgData.industry}
                  onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-size">Company Size</Label>
                <Input
                  id="org-size"
                  value={orgData.size}
                  onChange={(e) => setOrgData({ ...orgData, size: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              How people can reach your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-website">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </Label>
                <Input
                  id="org-website"
                  type="url"
                  value={orgData.website}
                  onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-email">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="org-email"
                  type="email"
                  value={orgData.email}
                  onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-phone">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone
                </Label>
                <Input
                  id="org-phone"
                  type="tel"
                  value={orgData.phone}
                  onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-address">Address</Label>
                <Input
                  id="org-address"
                  value={orgData.address}
                  onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}