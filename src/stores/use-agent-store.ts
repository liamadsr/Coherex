import { useStore } from './use-store'
import { Agent } from '@/types'
import { toast } from 'sonner'

// Hook for agent-related operations
export const useAgentStore = () => {
  const store = useStore()

  // Load agents from API
  const loadAgents = async () => {
    store.setLoadingAgents(true)
    try {
      const response = await fetch('/api/agents')
      const result = await response.json()
      if (result.success && result.data) {
        store.setAgents(result.data)
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
      toast.error('Failed to load agents')
    } finally {
      store.setLoadingAgents(false)
    }
  }

  // Create a new agent
  const createAgent = async (agentData: Partial<Agent>) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      })
      const result = await response.json()
      if (result.success && result.data) {
        store.addAgent(result.data)
        toast.success('Agent created successfully')
        return result.data
      }
    } catch (error) {
      console.error('Failed to create agent:', error)
      toast.error('Failed to create agent')
      throw error
    }
  }

  // Update an existing agent
  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    try {
      // Optimistic update
      store.updateAgent(id, updates)
      
      const response = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success && result.data) {
        store.updateAgent(id, result.data)
        toast.success('Agent updated successfully')
        return result.data
      }
    } catch (error) {
      console.error('Failed to update agent:', error)
      toast.error('Failed to update agent')
      // Revert optimistic update on error
      await loadAgents()
      throw error
    }
  }

  // Delete an agent
  const deleteAgent = async (id: string) => {
    try {
      // Optimistic delete
      store.deleteAgent(id)
      
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        toast.success('Agent deleted successfully')
      } else {
        // Revert if failed
        await loadAgents()
      }
    } catch (error) {
      console.error('Failed to delete agent:', error)
      toast.error('Failed to delete agent')
      // Revert optimistic delete on error
      await loadAgents()
      throw error
    }
  }

  // Get filtered agents
  const getFilteredAgents = () => {
    const { agents, agentFilters } = store
    let filtered = [...agents]

    // Filter by status
    if (agentFilters.status.length > 0) {
      filtered = filtered.filter(agent => 
        agentFilters.status.includes(agent.status)
      )
    }

    // Filter by capabilities
    if (agentFilters.capabilities.length > 0) {
      filtered = filtered.filter(agent =>
        agentFilters.capabilities.some(cap => 
          agent.capabilities.includes(cap)
        )
      )
    }

    // Filter by search
    if (agentFilters.search) {
      const search = agentFilters.search.toLowerCase()
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(search) ||
        agent.description.toLowerCase().includes(search) ||
        agent.email.toLowerCase().includes(search)
      )
    }

    return filtered
  }

  return {
    agents: store.agents,
    selectedAgent: store.selectedAgent,
    isLoading: store.isLoadingAgents,
    filters: store.agentFilters,
    
    // Actions
    loadAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent: store.selectAgent,
    setFilters: store.setAgentFilters,
    getFilteredAgents,
  }
}