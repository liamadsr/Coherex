import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockApi } from '@/mock-data'
import { Conversation, Message } from '@/types'
import { toast } from 'sonner'

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters?: any) => [...conversationKeys.lists(), { filters }] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  messages: (id: string) => [...conversationKeys.detail(id), 'messages'] as const,
}

// Fetch all conversations
export function useConversations(filters?: {
  search?: string
  status?: string[]
  agentId?: string
  userId?: string
  channel?: string[]
}) {
  return useQuery({
    queryKey: conversationKeys.list(filters),
    queryFn: async () => {
      const result = await mockApi.getConversations()
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch conversations')
      }
      
      let conversations = result.data
      
      // Apply filters
      if (filters?.search) {
        conversations = conversations.filter(conv => 
          conv.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
          conv.user.name.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
      
      if (filters?.status && filters.status.length > 0) {
        conversations = conversations.filter(conv => filters.status!.includes(conv.status))
      }
      
      if (filters?.agentId) {
        conversations = conversations.filter(conv => conv.agentId === filters.agentId)
      }
      
      if (filters?.userId) {
        conversations = conversations.filter(conv => conv.userId === filters.userId)
      }
      
      if (filters?.channel && filters.channel.length > 0) {
        conversations = conversations.filter(conv => filters.channel!.includes(conv.channel))
      }
      
      return conversations
    },
  })
}

// Fetch single conversation
export function useConversation(id: string) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: async () => {
      const result = await mockApi.getConversation(id)
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch conversation')
      }
      return result.data
    },
    enabled: !!id,
  })
}

// Fetch conversation messages
export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: async () => {
      const result = await mockApi.getMessages(conversationId)
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch messages')
      }
      return result.data
    },
    enabled: !!conversationId,
    // Refetch messages every 5 seconds
    refetchInterval: 5000,
  })
}

// Send message mutation
export function useSendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      content, 
      attachments 
    }: { 
      conversationId: string
      content: string
      attachments?: any[]
    }) => {
      const result = await mockApi.sendMessage(conversationId, content)
      if (!result.success || !result.data) {
        throw new Error('Failed to send message')
      }
      return result.data
    },
    onSuccess: (data, variables) => {
      // Invalidate messages to refetch
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.messages(variables.conversationId) 
      })
      // Update conversation list to reflect new message
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.lists() 
      })
    },
    onError: (error) => {
      toast.error('Failed to send message')
      console.error('Send message error:', error)
    },
  })
}

// Update conversation status
export function useUpdateConversationStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string
      status: 'active' | 'resolved' | 'archived' 
    }) => {
      const result = await mockApi.updateConversation(id, { status })
      if (!result.success || !result.data) {
        throw new Error('Failed to update conversation status')
      }
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.detail(data.id) 
      })
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.lists() 
      })
      toast.success('Conversation status updated')
    },
    onError: (error) => {
      toast.error('Failed to update conversation status')
      console.error('Update conversation status error:', error)
    },
  })
}

// Archive conversation
export function useArchiveConversation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await mockApi.updateConversation(id, { status: 'archived' })
      if (!result.success || !result.data) {
        throw new Error('Failed to archive conversation')
      }
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.detail(data.id) 
      })
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.lists() 
      })
      toast.success('Conversation archived')
    },
    onError: (error) => {
      toast.error('Failed to archive conversation')
      console.error('Archive conversation error:', error)
    },
  })
}

// Mark messages as read
export function useMarkMessagesRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      messageIds 
    }: { 
      conversationId: string
      messageIds: string[] 
    }) => {
      // Simulate marking messages as read
      await new Promise(resolve => setTimeout(resolve, 500))
      return { conversationId, messageIds }
    },
    onSuccess: ({ conversationId }) => {
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.messages(conversationId) 
      })
    },
  })
}