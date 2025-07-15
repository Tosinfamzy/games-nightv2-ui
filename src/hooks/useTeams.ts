import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teamService } from '../services/teams'
import type { CreateTeamDTO, UpdateTeamDTO } from '../services/teams'
import type { Team } from '../types'

const TEAMS_KEY = 'teams'

export const useTeams = () => {
  return useQuery({
    queryKey: [TEAMS_KEY],
    queryFn: teamService.getAll,
  })
}

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: [TEAMS_KEY, id],
    queryFn: () => teamService.getById(id),
    enabled: Boolean(id),
  })
}

export const useTeamsByGame = (gameId: string) => {
  return useQuery({
    queryKey: [TEAMS_KEY, 'game', gameId],
    queryFn: () => teamService.getByGame(gameId),
    enabled: Boolean(gameId),
  })
}

export const useCreateTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTeamDTO) => teamService.create(data),
    onSuccess: (newTeam) => {
      queryClient.setQueryData<Array<Team>>([TEAMS_KEY], (old = []) => [
        ...old,
        newTeam,
      ])
      queryClient.setQueryData<Array<Team>>(
        [TEAMS_KEY, 'game', newTeam.gameId],
        (old = []) => [...old, newTeam],
      )
    },
  })
}

export const useUpdateTeam = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTeamDTO) => teamService.update(id, data),
    onSuccess: (updatedTeam) => {
      queryClient.setQueryData<Team>([TEAMS_KEY, id], updatedTeam)
      queryClient.setQueryData<Array<Team>>([TEAMS_KEY], (old = []) =>
        old.map((team) => (team.id === id ? updatedTeam : team)),
      )
      queryClient.setQueryData<Array<Team>>(
        [TEAMS_KEY, 'game', updatedTeam.gameId],
        (old = []) => old.map((team) => (team.id === id ? updatedTeam : team)),
      )
    },
  })
}

export const useDeleteTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: [TEAMS_KEY, id] })
      queryClient.setQueryData<Array<Team>>([TEAMS_KEY], (old = []) =>
        old.filter((team) => team.id !== id),
      )
    },
  })
}

export const useTeamPlayerAction = (action: 'addPlayer' | 'removePlayer') => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, playerId }: { teamId: string; playerId: string }) =>
      teamService[action](teamId, playerId),
    onSuccess: (updatedTeam) => {
      queryClient.setQueryData<Team>([TEAMS_KEY, updatedTeam.id], updatedTeam)
      queryClient.setQueryData<Array<Team>>([TEAMS_KEY], (old = []) =>
        old.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)),
      )
      queryClient.setQueryData<Array<Team>>(
        [TEAMS_KEY, 'game', updatedTeam.gameId],
        (old = []) =>
          old.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)),
      )
    },
  })
}
