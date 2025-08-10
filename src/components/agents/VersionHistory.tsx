'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  GitBranch, 
  MoreVertical, 
  Rocket, 
  RotateCcw, 
  Trash2, 
  Eye, 
  Share2,
  Clock,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface AgentVersion {
  id: string
  agent_id: string
  version_number: number
  status: 'draft' | 'production' | 'archived'
  name: string
  description: string | null
  config: any
  published_at: string | null
  published_by: string | null
  created_at: string
  created_by: string | null
  updated_at: string
}

interface VersionHistoryProps {
  agentId: string
  currentVersionId?: string | null
  draftVersionId?: string | null
  onVersionSelect?: (version: AgentVersion) => void
  onRefresh?: () => void
}

export function VersionHistory({ 
  agentId, 
  currentVersionId,
  draftVersionId,
  onVersionSelect,
  onRefresh 
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<AgentVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<AgentVersion | null>(null)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showRollbackDialog, setShowRollbackDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionVersion, setActionVersion] = useState<AgentVersion | null>(null)

  useEffect(() => {
    loadVersions()
  }, [agentId])

  const loadVersions = async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}/versions`)
      const data = await res.json()
      
      if (res.ok) {
        setVersions(data.versions)
      } else {
        toast.error('Failed to load version history')
      }
    } catch (error) {
      toast.error('Failed to load version history')
    } finally {
      setLoading(false)
    }
  }

  const publishVersion = async (versionId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/versions/${versionId}/publish`, {
        method: 'POST'
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Version published successfully')
        loadVersions()
        onRefresh?.()
      } else {
        toast.error(data.error || 'Failed to publish version')
      }
    } catch (error) {
      toast.error('Failed to publish version')
    }
    setShowPublishDialog(false)
    setActionVersion(null)
  }

  const rollbackToVersion = async (versionId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/versions/${versionId}/rollback`, {
        method: 'POST'
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Rollback successful')
        loadVersions()
        onRefresh?.()
      } else {
        toast.error(data.error || 'Failed to rollback')
      }
    } catch (error) {
      toast.error('Failed to rollback')
    }
    setShowRollbackDialog(false)
    setActionVersion(null)
  }

  const deleteVersion = async (versionId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/versions/${versionId}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (res.ok) {
        toast.success('Version deleted successfully')
        loadVersions()
        onRefresh?.()
      } else {
        toast.error(data.error || 'Failed to delete version')
      }
    } catch (error) {
      toast.error('Failed to delete version')
    }
    setShowDeleteDialog(false)
    setActionVersion(null)
  }

  const getStatusBadge = (version: AgentVersion) => {
    if (version.id === currentVersionId) {
      return <Badge className="bg-green-500">Production</Badge>
    }
    if (version.id === draftVersionId) {
      return <Badge variant="secondary">Draft</Badge>
    }
    if (version.status === 'archived') {
      return <Badge variant="outline">Archived</Badge>
    }
    return <Badge variant="outline">{version.status}</Badge>
  }

  const getStatusIcon = (version: AgentVersion) => {
    if (version.id === currentVersionId) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (version.id === draftVersionId) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>Loading versions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            Manage and track all versions of your agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div key={version.id}>
                  <div
                    className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                      selectedVersion?.id === version.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => {
                      setSelectedVersion(version)
                      onVersionSelect?.(version)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(version)}
                          <span className="font-medium">Version {version.version_number}</span>
                          {getStatusBadge(version)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {version.name}
                        </p>
                        {version.description && (
                          <p className="text-xs text-muted-foreground">
                            {version.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                          </span>
                          {version.published_at && (
                            <span className="flex items-center gap-1">
                              <Rocket className="h-3 w-3" />
                              Published {formatDistanceToNow(new Date(version.published_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onVersionSelect?.(version)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          {version.status === 'draft' && version.id === draftVersionId && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setActionVersion(version)
                                setShowPublishDialog(true)
                              }}
                            >
                              <Rocket className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          
                          {version.status !== 'draft' && version.id !== currentVersionId && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setActionVersion(version)
                                setShowRollbackDialog(true)
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Rollback to This Version
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Preview
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {version.status === 'draft' && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setActionVersion(version)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {index < versions.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Version {actionVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make version {actionVersion?.version_number} the live production version. 
              The current production version will be archived. This action cannot be undone immediately, 
              but you can rollback to a previous version if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => actionVersion && publishVersion(actionVersion.id)}>
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rollback Confirmation Dialog */}
      <AlertDialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rollback to Version {actionVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new draft version based on version {actionVersion?.version_number}. 
              You can then review and publish it when ready.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => actionVersion && rollbackToVersion(actionVersion.id)}>
              Create Draft from Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Version {actionVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this draft version. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => actionVersion && deleteVersion(actionVersion.id)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}