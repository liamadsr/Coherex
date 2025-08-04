import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockApi } from '@/mock-data'
import { Agent } from '@/types'
import { toast } from 'sonner'

// Query keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters?: any) => [...agentKeys.lists(), { filters }] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
}

// Fetch all agents
export function useAgents(filters?: {
  search?: string
  status?: string[]
  capabilities?: string[]
}) {
  return useQuery({
    queryKey: agentKeys.list(filters),
    queryFn: async () => {
      const result = await mockApi.getAgents()
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch agents')
      }
      
      let agents = result.data
      
      // Apply filters
      if (filters?.search) {
        agents = agents.filter(agent => 
          agent.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          agent.email.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
      
      if (filters?.status && filters.status.length > 0) {
        agents = agents.filter(agent => filters.status!.includes(agent.status))
      }
      
      if (filters?.capabilities && filters.capabilities.length > 0) {
        agents = agents.filter(agent => 
          filters.capabilities!.some(cap => agent.capabilities.includes(cap))
        )
      }
      
      return agents
    },
  })
}

// Fetch single agent
export function useAgent(id: string) {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: async () => {
      const result = await mockApi.getAgent(id)
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch agent')
      }
      return result.data
    },
    enabled: !!id,
  })
}

// Create agent mutation
export function useCreateAgent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<Agent>) => {
      const result = await mockApi.createAgent(data)
      if (!result.success || !result.data) {
        throw new Error('Failed to create agent')
      }
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      toast.success(`Agent "${data.name}" created successfully`)
    },
    onError: (error) => {
      toast.error('Failed to create agent')
      console.error('Create agent error:', error)
    },
  })
}

// Update agent mutation
export function useUpdateAgent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Agent> }) => {
      const result = await mockApi.updateAgent(id, data)
      if (!result.success || !result.data) {
        throw new Error('Failed to update agent')
      }
      return result.data
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      toast.success(`Agent "${data.name}" updated successfully`)
    },
    onError: (error) => {
      toast.error('Failed to update agent')
      console.error('Update agent error:', error)
    },
  })
}

// Delete agent mutation
export function useDeleteAgent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await mockApi.deleteAgent(id)
      if (!result.success) {
        throw new Error('Failed to delete agent')
      }
      return id
    },
    onSuccess: (id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: agentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      toast.success('Agent deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete agent')
      console.error('Delete agent error:', error)
    },
  })
}

// Bulk operations
export function useBulkAgentOperation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      ids, 
      operation 
    }: { 
      ids: string[]; 
      operation: 'activate' | 'deactivate' | 'delete' 
    }) => {
      // Simulate bulk operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ids, operation }
    },
    onSuccess: ({ ids, operation }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      
      const message = operation === 'delete' 
        ? `Deleted ${ids.length} agents`
        : `${operation === 'activate' ? 'Activated' : 'Deactivated'} ${ids.length} agents`
      
      toast.success(message)
    },
    onError: (error) => {
      toast.error('Failed to perform bulk operation')
      console.error('Bulk operation error:', error)
    },
  })
}