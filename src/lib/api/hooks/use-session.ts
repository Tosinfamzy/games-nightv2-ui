import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../services/session.service'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { Session } from '../types'
import type { PaginationParams } from '../types/common'

export interface CreateSessionDTO {
  name: string
  description?: string
  gamesMasterId: string
  date: string
}

export interface UpdateSessionDTO extends Partial<CreateSessionDTO> {
  status?: Session['status']
}

// Query keys
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...sessionKeys.lists(), params] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
}

// Queries
export const useSession = (id: string): UseQueryResult<Session, Error> => {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => sessionService.getById(id),
    enabled: Boolean(id),
  })
}

export const useSessions = (
  params?: PaginationParams,
): UseQueryResult<Array<Session>, Error> => {
  return useQuery({
    queryKey: sessionKeys.list(params ?? {}),
    queryFn: () => sessionService.getAll(),
  })
}

// Mutations
export const useCreateSession = (): UseMutationResult<
  Session,
  Error,
  CreateSessionDTO
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionService.create,
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
      queryClient.setQueryData<Session>(
        sessionKeys.detail(newSession.id),
        newSession,
      )
    },
  })
}

export const useUpdateSession = (): UseMutationResult<
  Session,
  Error,
  { id: string; data: UpdateSessionDTO }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => sessionService.update(id, data),
    onSuccess: (updatedSession, { id }) => {
      queryClient.setQueryData<Session>(sessionKeys.detail(id), updatedSession)
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
    },
  })
}

export const useDeleteSession = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionService.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: sessionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
    },
  })
}
