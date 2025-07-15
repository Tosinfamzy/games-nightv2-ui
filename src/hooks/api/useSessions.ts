import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@/types'
import type { CreateSessionDTO, UpdateSessionDTO } from '@/services'
import { sessionService } from '@/services'

const SESSIONS_KEY = 'sessions' as const

export const useSessions = () => {
  return useQuery<Array<Session>>({
    queryKey: [SESSIONS_KEY],
    queryFn: sessionService.getAll,
  })
}

export const useSession = (id: string) => {
  return useQuery<Session>({
    queryKey: [SESSIONS_KEY, id],
    queryFn: () => sessionService.getById(id),
    enabled: Boolean(id),
  })
}

export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation<Session, Error, CreateSessionDTO>({
    mutationFn: sessionService.create,
    onSuccess: (newSession: Session) => {
      queryClient.setQueryData<Array<Session>>([SESSIONS_KEY], (old = []) => [
        ...old,
        newSession,
      ])
    },
  })
}

export const useUpdateSession = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation<Session, Error, UpdateSessionDTO>({
    mutationFn: (data: UpdateSessionDTO) => sessionService.update(id, data),
    onSuccess: (updatedSession: Session) => {
      queryClient.setQueryData<Session>([SESSIONS_KEY, id], updatedSession)
      queryClient.setQueryData<Array<Session>>([SESSIONS_KEY], (old = []) =>
        old.map((session) => (session.id === id ? updatedSession : session)),
      )
    },
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: sessionService.delete,
    onSuccess: (_: void, deletedId: string) => {
      queryClient.removeQueries({ queryKey: [SESSIONS_KEY, deletedId] })
      queryClient.setQueryData<Array<Session>>([SESSIONS_KEY], (old = []) =>
        old.filter((session) => session.id !== deletedId),
      )
    },
  })
}

export const useSessionAction = (action: 'start' | 'complete' | 'cancel') => {
  const queryClient = useQueryClient()

  return useMutation<Session, Error, string>({
    mutationFn: (id: string) => sessionService[action](id),
    onSuccess: (updatedSession: Session) => {
      queryClient.setQueryData<Session>(
        [SESSIONS_KEY, updatedSession.id],
        updatedSession,
      )
      queryClient.setQueryData<Array<Session>>([SESSIONS_KEY], (old = []) =>
        old.map((session) =>
          session.id === updatedSession.id ? updatedSession : session,
        ),
      )
    },
  })
}
