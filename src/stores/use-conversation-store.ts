import { useStore } from './use-store'
import { Conversation } from '@/types'
import { mockApi } from '@/mock-data'
import { toast } from 'sonner'

// Hook for conversation-related operations
export const useConversationStore = () => {
  const store = useStore()

  // Load conversations from API
  const loadConversations = async (agentId?: string) => {
    store.setLoadingConversations(true)
    try {
      const result = await mockApi.getConversations(agentId)
      if (result.success && result.data) {
        store.setConversations(result.data)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      store.setLoadingConversations(false)
    }
  }

  // Get a single conversation
  const getConversation = async (id: string) => {
    try {
      const result = await mockApi.getConversation(id)
      if (result.success && result.data) {
        return result.data
      }
    } catch (error) {
      console.error('Failed to get conversation:', error)
      toast.error('Failed to load conversation')
      throw error
    }
  }

  // Update conversation status
  const updateConversationStatus = async (id: string, status: Conversation['status']) => {
    try {
      // Optimistic update
      store.updateConversation(id, { status })
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success(`Conversation marked as ${status}`)
    } catch (error) {
      console.error('Failed to update conversation:', error)
      toast.error('Failed to update conversation')
      // Revert on error
      await loadConversations()
      throw error
    }
  }

  // Get filtered conversations
  const getFilteredConversations = () => {
    const { conversations, conversationFilters } = store
    let filtered = [...conversations]

    // Filter by status
    if (conversationFilters.status.length > 0) {
      filtered = filtered.filter(conv => 
        conversationFilters.status.includes(conv.status)
      )
    }

    // Filter by channel
    if (conversationFilters.channel.length > 0) {
      filtered = filtered.filter(conv =>
        conversationFilters.channel.includes(conv.channel)
      )
    }

    // Filter by agent
    if (conversationFilters.agentId) {
      filtered = filtered.filter(conv =>
        conv.agentId === conversationFilters.agentId
      )
    }

    // Filter by search
    if (conversationFilters.search) {
      const search = conversationFilters.search.toLowerCase()
      filtered = filtered.filter(conv =>
        conv.user.name.toLowerCase().includes(search) ||
        conv.user.email.toLowerCase().includes(search) ||
        conv.lastMessage.toLowerCase().includes(search) ||
        conv.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }

    return filtered
  }

  // Get conversation statistics
  const getConversationStats = () => {
    const conversations = getFilteredConversations()
    
    return {
      total: conversations.length,
      active: conversations.filter(c => c.status === 'active').length,
      resolved: conversations.filter(c => c.status === 'resolved').length,
      escalated: conversations.filter(c => c.status === 'escalated').length,
      avgSatisfaction: conversations.reduce((acc, c) => acc + (c.satisfaction || 0), 0) / conversations.length || 0,
      byChannel: conversations.reduce((acc, c) => {
        acc[c.channel] = (acc[c.channel] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  return {
    conversations: store.conversations,
    selectedConversation: store.selectedConversation,
    isLoading: store.isLoadingConversations,
    filters: store.conversationFilters,
    
    // Actions
    loadConversations,
    getConversation,
    updateConversationStatus,
    selectConversation: store.selectConversation,
    setFilters: store.setConversationFilters,
    
    // Computed
    getFilteredConversations,
    getConversationStats,
  }
}