'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Copy, MoreHorizontal, CheckCircle, XCircle, BarChart3 } from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export default function EvaluationCriteriaPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data
  const criteria = [
    {
      id: '1',
      name: 'Response Accuracy',
      description: 'Evaluates if the response contains accurate and factual information',
      type: 'accuracy',
      weight: 30,
      isActive: true,
      usageCount: 145,
      passThreshold: 90
    },
    {
      id: '2',
      name: 'Response Relevance',
      description: 'Checks if the response directly addresses the user query',
      type: 'relevance',
      weight: 25,
      isActive: true,
      usageCount: 142,
      passThreshold: 85
    },
    {
      id: '3',
      name: 'Tone Appropriateness',
      description: 'Evaluates if the response tone matches the context',
      type: 'tone',
      weight: 20,
      isActive: true,
      usageCount: 98,
      passThreshold: 80
    },
    {
      id: '4',
      name: 'Response Completeness',
      description: 'Checks if the response provides comprehensive information',
      type: 'completeness',
      weight: 15,
      isActive: false,
      usageCount: 67,
      passThreshold: 75
    },
    {
      id: '5',
      name: 'Grammar & Clarity',
      description: 'Evaluates the grammatical correctness and clarity of the response',
      type: 'grammar',
      weight: 10,
      isActive: true,
      usageCount: 134,
      passThreshold: 95
    }
  ]

  const filteredCriteria = criteria.filter(criterion =>
    criterion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    criterion.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleActive = (id: string) => {
    toast.success('Criterion status updated')
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this criterion?')) {
      toast.success('Criterion deleted')
    }
  }

  const handleDuplicate = (id: string) => {
    toast.success('Criterion duplicated')
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Evaluation Criteria</h1>
            <Button onClick={() => router.push('/evaluation/criteria/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Criterion
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Define and manage criteria for evaluating agent responses
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search criteria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Criteria</p>
                  <p className="text-2xl font-bold">{criteria.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold">{criteria.filter(c => c.isActive).length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Weight</p>
                  <p className="text-2xl font-bold">{criteria.filter(c => c.isActive).reduce((sum, c) => sum + c.weight, 0)}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Criteria List */}
        <div className="space-y-4">
          {filteredCriteria.map((criterion) => (
            <Card key={criterion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{criterion.name}</h3>
                      <Badge variant={criterion.isActive ? 'default' : 'secondary'}>
                        {criterion.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{criterion.type}</Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {criterion.description}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Weight:</span>
                        <span className="font-medium">{criterion.weight}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Pass threshold:</span>
                        <span className="font-medium">{criterion.passThreshold}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Used in:</span>
                        <span className="font-medium">{criterion.usageCount} evaluations</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push(`/evaluation/criteria/${criterion.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(criterion.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(criterion.id)}>
                        {criterion.isActive ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(criterion.id)} 
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCriteria.length === 0 && (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No criteria found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Create your first evaluation criterion'}
            </p>
            <Button onClick={() => router.push('/evaluation/criteria/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Criterion
            </Button>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}