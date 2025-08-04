import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Team } from '@/types'
import { mockApi } from '@/mock-data'
import { toast } from 'sonner'

// Query keys
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  detail: (id: string) => [...teamKeys.all, 'detail', id] as const,
}

// Get all teams
export function useTeams() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: async () => {
      const result = await mockApi.getTeams()
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch teams')
      }
      return result.data
    },
  })
}

// Get single team
export function useTeam(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: async () => {
      const result = await mockApi.getTeam(id)
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch team')
      }
      return result.data
    },
    enabled: !!id,
  })
}

// Create team
export function useCreateTeam() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<Team>) => {
      const result = await mockApi.createTeam(data)
      if (!result.success || !result.data) {
        throw new Error('Failed to create team')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
      toast.success('Team created successfully!')
    },
    onError: (error) => {
      toast.error('Failed to create team')
      console.error('Create team error:', error)
    },
  })
}

// Update team
export function useUpdateTeam() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Team> }) => {
      const result = await mockApi.updateTeam(id, data)
      if (!result.success || !result.data) {
        throw new Error('Failed to update team')
      }
      return result.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.id) })
      toast.success('Team updated successfully!')
    },
    onError: (error) => {
      toast.error('Failed to update team')
      console.error('Update team error:', error)
    },
  })
}

// Delete team
export function useDeleteTeam() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await mockApi.deleteTeam(id)
      if (!result.success) {
        throw new Error('Failed to delete team')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
      toast.success('Team deleted successfully!')
    },
    onError: (error) => {
      toast.error('Failed to delete team')
      console.error('Delete team error:', error)
    },
  })
}