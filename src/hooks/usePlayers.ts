import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { playerService } from '../services/players'
import type { CreatePlayerDTO, UpdatePlayerDTO } from '../services/players'
import type { Player } from '../types'

const PLAYERS_KEY = 'players'

export const usePlayers = () => {
  return useQuery({
    queryKey: [PLAYERS_KEY],
    queryFn: playerService.getAll,
  })
}

export const usePlayer = (id: string) => {
  return useQuery({
    queryKey: [PLAYERS_KEY, id],
    queryFn: () => playerService.getById(id),
    enabled: Boolean(id),
  })
}

export const usePlayersByTeam = (teamId: string) => {
  return useQuery({
    queryKey: [PLAYERS_KEY, 'team', teamId],
    queryFn: () => playerService.getByTeam(teamId),
    enabled: Boolean(teamId),
  })
}

export const useCreatePlayer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePlayerDTO) => playerService.create(data),
    onSuccess: (newPlayer) => {
      queryClient.setQueryData<Array<Player>>([PLAYERS_KEY], (old = []) => [
        ...old,
        newPlayer,
      ])
      if (newPlayer.teamId) {
        queryClient.setQueryData<Array<Player>>(
          [PLAYERS_KEY, 'team', newPlayer.teamId],
          (old = []) => [...old, newPlayer],
        )
      }
    },
  })
}

export const useUpdatePlayer = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePlayerDTO) => playerService.update(id, data),
    onSuccess: (updatedPlayer) => {
      queryClient.setQueryData<Player>([PLAYERS_KEY, id], updatedPlayer)
      queryClient.setQueryData<Array<Player>>([PLAYERS_KEY], (old = []) =>
        old.map((player) => (player.id === id ? updatedPlayer : player)),
      )
      if (updatedPlayer.teamId) {
        queryClient.setQueryData<Array<Player>>(
          [PLAYERS_KEY, 'team', updatedPlayer.teamId],
          (old = []) =>
            old.map((player) => (player.id === id ? updatedPlayer : player)),
        )
      }
    },
  })
}

export const useDeletePlayer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => playerService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: [PLAYERS_KEY, id] })
      queryClient.setQueryData<Array<Player>>([PLAYERS_KEY], (old = []) =>
        old.filter((player) => player.id !== id),
      )
    },
  })
}
