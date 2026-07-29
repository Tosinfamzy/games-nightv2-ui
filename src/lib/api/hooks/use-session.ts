import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../services/session.service'
import type { CreateSessionResponse } from '../services/session.service'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { Game, Player, Session, SessionLeaderboard, Team } from '../types'
import type { PaginationParams } from '../types/common'

export interface CreateSessionDTO {
  name: string
  description?: string
  // Optional: when the host is authenticated via Clerk the backend derives the
  // games master from the session token. Legacy callers may still pass it.
  gamesMasterId?: string
  date: string
  location?: string
  /**
   * Host-authored invite message (max 500 chars). Omit to leave unchanged on
   * update; send an empty string to clear it.
   */
  inviteMessage?: string
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
  games: (id: string) => [...sessionKeys.detail(id), 'games'] as const,
  teams: (id: string) => [...sessionKeys.detail(id), 'teams'] as const,
  players: (id: string) => [...sessionKeys.detail(id), 'players'] as const,
  leaderboard: (id: string) =>
    [...sessionKeys.detail(id), 'leaderboard'] as const,
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
  CreateSessionResponse,
  Error,
  CreateSessionDTO
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionService.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
      queryClient.setQueryData<Session>(
        sessionKeys.detail(response.session.id),
        response.session,
      )
      // Cache the GM's player record
      queryClient.setQueryData<Array<Player>>(
        sessionKeys.players(response.session.id),
        [response.gmPlayer],
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

// Nested resource queries
export const useSessionGames = (
  sessionId: string,
): UseQueryResult<Array<Game>, Error> => {
  return useQuery({
    queryKey: sessionKeys.games(sessionId),
    queryFn: () => sessionService.getGames(sessionId),
    enabled: Boolean(sessionId),
  })
}

export const useSessionTeams = (
  sessionId: string,
): UseQueryResult<Array<Team>, Error> => {
  return useQuery({
    queryKey: sessionKeys.teams(sessionId),
    queryFn: () => sessionService.getTeams(sessionId),
    enabled: Boolean(sessionId),
  })
}

export const useSessionPlayers = (
  sessionId: string,
): UseQueryResult<Array<Player>, Error> => {
  return useQuery({
    queryKey: sessionKeys.players(sessionId),
    queryFn: () => sessionService.getPlayers(sessionId),
    enabled: Boolean(sessionId),
  })
}

export const useSessionLeaderboard = (
  sessionId: string,
): UseQueryResult<SessionLeaderboard, Error> => {
  return useQuery({
    queryKey: sessionKeys.leaderboard(sessionId),
    queryFn: () => sessionService.getLeaderboard(sessionId),
    enabled: Boolean(sessionId),
  })
}

// Convenience hook to fetch session with all nested resources
export const useSessionFull = (sessionId: string) => {
  const session = useSession(sessionId)
  const games = useSessionGames(sessionId)
  const teams = useSessionTeams(sessionId)
  const players = useSessionPlayers(sessionId)

  return {
    session: session.data,
    games: games.data ?? [],
    teams: teams.data ?? [],
    players: players.data ?? [],
    isLoading:
      session.isLoading ||
      games.isLoading ||
      teams.isLoading ||
      players.isLoading,
    isError:
      session.isError || games.isError || teams.isError || players.isError,
    error: session.error || games.error || teams.error || players.error,
    refetch: () => {
      session.refetch()
      games.refetch()
      teams.refetch()
      players.refetch()
    },
  }
}
