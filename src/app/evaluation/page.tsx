'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, MoreHorizontal, BarChart3 } from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function EvaluationPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('evaluations')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - would come from API
  const evaluations = []
  const runs = []

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Evaluations</h1>
          <Button onClick={() => router.push('/evaluation/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="evaluations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
              Evaluations
            </TabsTrigger>
            <TabsTrigger value="runs" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
              Runs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evaluations" className="mt-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Empty State */}
            {evaluations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Your evaluations will appear here
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create an evaluation to assess your model's responses
                </p>
                <Button onClick={() => router.push('/evaluation/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="runs" className="mt-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Empty State */}
            {runs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Your evaluation runs will appear here
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Run an evaluation to see results
                </p>
                <Button onClick={() => router.push('/evaluation/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Evaluation
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}