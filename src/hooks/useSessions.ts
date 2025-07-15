import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../services/sessions'
import type { CreateSessionDTO, UpdateSessionDTO } from '../services/sessions'
import type { Session } from '../types'

const SESSIONS_KEY = 'sessions'

export const useSessions = () => {
  return useQuery({
    queryKey: [SESSIONS_KEY],
    queryFn: sessionService.getAll,
  })
}

export const useSession = (id: string) => {
  return useQuery({
    queryKey: [SESSIONS_KEY, id],
    queryFn: () => sessionService.getById(id),
    enabled: Boolean(id),
  })
}

export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSessionDTO) => sessionService.create(data),
    onSuccess: (newSession) => {
      queryClient.setQueryData<Array<Session>>([SESSIONS_KEY], (old = []) => [
        ...old,
        newSession,
      ])
    },
  })
}

export const useUpdateSession = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSessionDTO) => sessionService.update(id, data),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData<Session>([SESSIONS_KEY, id], updatedSession)
      queryClient.setQueryData<Array<Session>>([SESSIONS_KEY], (old = []) =>
        old.map((session) => (session.id === id ? updatedSession : session)),
      )
    },
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sessionService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: [SESSIONS_KEY, id] })
      queryClient.setQueryData<Array<Session>>([SESSIONS_KEY], (old = []) =>
        old.filter((session) => session.id !== id),
      )
    },
  })
}

export const useSessionAction = (action: 'start' | 'complete' | 'cancel') => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sessionService[action](id),
    onSuccess: (updatedSession) => {
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
