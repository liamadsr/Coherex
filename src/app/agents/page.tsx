'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Grid3X3,
  List,
  Download,
  Upload,
  Settings,
  Play,
  Pause,
  Trash2,
  Copy,
  Edit,
  Activity,
  Clock,
  Star,
  Users,
  MessageCircle
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Agent } from '@/types'
import { toast } from 'sonner'
import { useAgents, useBulkAgentOperation } from '@/hooks/queries'

type ViewMode = 'grid' | 'list'
type FilterStatus = 'all' | 'active' | 'inactive' | 'training' | 'error'

export default function AgentsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
  })
  const itemsPerPage = 12

  const { data: agents = [], isLoading } = useAgents(filters)
  const bulkOperation = useBulkAgentOperation()

  const filteredAgents = agents

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage)
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAgents.length === paginatedAgents.length) {
      setSelectedAgents([])
    } else {
      setSelectedAgents(paginatedAgents.map(agent => agent.id))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (action === 'Start' || action === 'Pause' || action === 'Delete') {
      const operation = action === 'Start' ? 'activate' : action === 'Pause' ? 'deactivate' : 'delete'
      await bulkOperation.mutateAsync({ ids: selectedAgents, operation: operation as any })
      setSelectedAgents([])
    } else {
      toast.info(`${action} action for ${selectedAgents.length} agents - Coming soon!`)
      setSelectedAgents([])
    }
  }

  const handleAgentAction = (action: string, agentName: string) => {
    toast.info(`${action} action for ${agentName} - Coming soon!`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'training': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const AgentCard = ({ agent }: { agent: Agent }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="h-full hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
        onClick={() => router.push(`/agents/${agent.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg truncate">{agent.name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm truncate" title={agent.email}>
                {agent.email}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-shrink-0 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleAgentAction('Edit', agent.name)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAgentAction('Duplicate', agent.name)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAgentAction('Configure', agent.name)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleAgentAction(agent.status === 'active' ? 'Pause' : 'Start', agent.name)}
                >
                  {agent.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Agent
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Agent
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleAgentAction('Delete', agent.name)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Badge className={`${getStatusColor(agent.status)} text-xs`}>
              {agent.status}
            </Badge>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{agent.metrics.satisfactionScore.toFixed(1)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">Conversations</span>
              <span className="font-medium">{agent.metrics.totalConversations}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">Avg Response</span>
              <span className="font-medium">{agent.metrics.avgResponseTime}s</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
              <span className="font-medium">{agent.metrics.successRate}%</span>
            </div>
          </div>

          <div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Capabilities</div>
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 2).map((capability, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                  <span className="truncate max-w-[100px] sm:max-w-[120px]">{capability}</span>
                </Badge>
              ))}
              {agent.capabilities.length > 2 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{agent.capabilities.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const AgentListItem = ({ agent }: { agent: Agent }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => router.push(`/agents/${agent.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedAgents.includes(agent.id)}
                onChange={() => handleSelectAgent(agent.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4"
              />
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-medium">
                {agent.avatar ? (
                  <span className="text-xl">{agent.avatar}</span>
                ) : (
                  agent.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                  <Badge className={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{agent.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">{agent.metrics.totalConversations}</div>
                <div className="text-gray-500">Conversations</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">{agent.metrics.avgResponseTime}s</div>
                <div className="text-gray-500">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">{agent.metrics.satisfactionScore.toFixed(1)}</div>
                <div className="text-gray-500">Rating</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">{agent.metrics.successRate}%</div>
                <div className="text-gray-500">Success</div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleAgentAction('Edit', agent.name)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAgentAction('Duplicate', agent.name)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAgentAction('Configure', agent.name)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleAgentAction(agent.status === 'active' ? 'Pause' : 'Start', agent.name)}
                >
                  {agent.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Agent
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Agent
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleAgentAction('Delete', agent.name)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 md:p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">AI Agents</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and monitor your AI workforce
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => toast.info('Import agents feature coming soon!')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button 
              variant="outline"
              onClick={() => toast.info('Export agents feature coming soon!')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => router.push('/agents/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Agent Builder
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Agents</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{agents.length}</p>
                </div>
                <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {agents.filter(a => a.status === 'active').length}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Training</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {agents.filter(a => a.status === 'training').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(agents.reduce((sum, a) => sum + a.metrics.satisfactionScore, 0) / agents.length).toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search agents..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select 
              value={filters.status.length === 0 ? 'all' : filters.status[0]} 
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev,
                status: value === 'all' ? [] : [value] 
              }))}
            >
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAgents([])}
                  className="text-blue-700 dark:text-blue-300"
                >
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('Start')}
                  className="text-green-700 border-green-300 hover:bg-green-50"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('Pause')}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('Delete')}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {paginatedAgents.length} of {filteredAgents.length} agents
          </span>
          {viewMode === 'list' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedAgents.length === paginatedAgents.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>

        {/* Agents Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {paginatedAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedAgents.map((agent) => (
              <AgentListItem key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
              if (page > totalPages) return null
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredAgents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No agents found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filters.search || filters.status.length > 0
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first AI agent'
              }
            </p>
            <Button onClick={() => router.push('/agents/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Open Agent Builder
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}