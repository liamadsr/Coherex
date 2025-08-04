import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockApi } from '@/mock-data'
import { KnowledgeSource, KnowledgeDocument } from '@/types'
import { toast } from 'sonner'

// Query keys
export const knowledgeKeys = {
  all: ['knowledge'] as const,
  sources: () => [...knowledgeKeys.all, 'sources'] as const,
  sourceList: (filters?: any) => [...knowledgeKeys.sources(), { filters }] as const,
  sourceDetail: (id: string) => [...knowledgeKeys.sources(), id] as const,
  documents: () => [...knowledgeKeys.all, 'documents'] as const,
  documentList: (filters?: any) => [...knowledgeKeys.documents(), { filters }] as const,
  documentDetail: (id: string) => [...knowledgeKeys.documents(), id] as const,
}

// Fetch all knowledge sources
export function useKnowledgeSources(filters?: {
  search?: string
  type?: string[]
  status?: string[]
}) {
  return useQuery({
    queryKey: knowledgeKeys.sourceList(filters),
    queryFn: async () => {
      const result = await mockApi.getKnowledgeSources()
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch knowledge sources')
      }
      
      let sources = result.data
      
      // Apply filters
      if (filters?.search) {
        sources = sources.filter(source => 
          source.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          source.description.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
      
      if (filters?.type && filters.type.length > 0) {
        sources = sources.filter(source => filters.type!.includes(source.type))
      }
      
      if (filters?.status && filters.status.length > 0) {
        sources = sources.filter(source => filters.status!.includes(source.status))
      }
      
      return sources
    },
  })
}

// Fetch single knowledge source
export function useKnowledgeSource(id: string) {
  return useQuery({
    queryKey: knowledgeKeys.sourceDetail(id),
    queryFn: async () => {
      const result = await mockApi.getKnowledgeSource(id)
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch knowledge source')
      }
      return result.data
    },
    enabled: !!id,
  })
}

// Fetch all documents
export function useKnowledgeDocuments(filters?: {
  search?: string
  sourceId?: string
  type?: string[]
  status?: string[]
}) {
  return useQuery({
    queryKey: knowledgeKeys.documentList(filters),
    queryFn: async () => {
      const result = await mockApi.getKnowledgeDocuments()
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch documents')
      }
      
      let documents = result.data
      
      // Apply filters
      if (filters?.search) {
        documents = documents.filter(doc => 
          doc.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
          doc.content.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
      
      if (filters?.sourceId) {
        documents = documents.filter(doc => doc.sourceId === filters.sourceId)
      }
      
      if (filters?.type && filters.type.length > 0) {
        documents = documents.filter(doc => filters.type!.includes(doc.type))
      }
      
      if (filters?.status && filters.status.length > 0) {
        documents = documents.filter(doc => filters.status!.includes(doc.status))
      }
      
      return documents
    },
  })
}

// Create knowledge source
export function useCreateKnowledgeSource() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<KnowledgeSource>) => {
      const result = await mockApi.createKnowledgeSource(data)
      if (!result.success || !result.data) {
        throw new Error('Failed to create knowledge source')
      }
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.sources() })
      toast.success(`Knowledge source "${data.name}" created successfully`)
    },
    onError: (error) => {
      toast.error('Failed to create knowledge source')
      console.error('Create knowledge source error:', error)
    },
  })
}

// Sync knowledge source
export function useSyncKnowledgeSource() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000))
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.sourceDetail(id) })
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents() })
      toast.success('Knowledge source sync started')
    },
    onError: (error) => {
      toast.error('Failed to sync knowledge source')
      console.error('Sync knowledge source error:', error)
    },
  })
}

// Upload document
export function useUploadDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      sourceId, 
      file 
    }: { 
      sourceId: string
      file: File 
    }) => {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newDocument: KnowledgeDocument = {
        id: `doc-${Date.now()}`,
        sourceId,
        title: file.name,
        content: 'Document content would be extracted here',
        type: file.type.includes('pdf') ? 'pdf' : 'text',
        status: 'processing',
        size: file.size,
        metadata: {
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
        },
        chunks: 0,
        lastSynced: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      return newDocument
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents() })
      toast.success(`Document "${data.title}" uploaded successfully`)
    },
    onError: (error) => {
      toast.error('Failed to upload document')
      console.error('Upload document error:', error)
    },
  })
}

// Delete document
export function useDeleteDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Simulate deletion
      await new Promise(resolve => setTimeout(resolve, 1000))
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents() })
      toast.success('Document deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete document')
      console.error('Delete document error:', error)
    },
  })
}

// Search knowledge base
export function useSearchKnowledge() {
  return useMutation({
    mutationFn: async ({ 
      query, 
      sourceIds, 
      limit = 10 
    }: { 
      query: string
      sourceIds?: string[]
      limit?: number 
    }) => {
      // Simulate search
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return mock search results
      return [
        {
          id: '1',
          documentId: 'doc-1',
          sourceId: 'source-1',
          title: 'Getting Started with AI Agents',
          excerpt: 'AI agents are autonomous software entities that...',
          relevance: 0.95,
          metadata: {
            page: 1,
            section: 'Introduction',
          },
        },
        {
          id: '2',
          documentId: 'doc-2',
          sourceId: 'source-1',
          title: 'Best Practices for Agent Design',
          excerpt: 'When designing AI agents, consider these key principles...',
          relevance: 0.88,
          metadata: {
            page: 5,
            section: 'Design Principles',
          },
        },
      ]
    },
  })
}