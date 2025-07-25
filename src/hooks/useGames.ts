import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gameService } from '../lib/api/services/game.service'

const GAMES_KEY = 'games'

export const useGames = () => {
  return useQuery({
    queryKey: [GAMES_KEY],
    queryFn: gameService.getAll,
  })
}

export const useGame = (id: string) => {
  return useQuery({
    queryKey: [GAMES_KEY, id],
    queryFn: () => gameService.getById(id),
    enabled: Boolean(id),
  })
}

export const useCreateGame = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: gameService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAMES_KEY] })
    },
  })
}

export const useUpdateGame = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => gameService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAMES_KEY] })
      queryClient.invalidateQueries({ queryKey: [GAMES_KEY, id] })
    },
  })
}

export const useDeleteGame = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: gameService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAMES_KEY] })
    },
  })
}

export const useStartGame = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gameId,
      teamIds,
    }: {
      gameId: string
      teamIds?: Array<string>
    }) => gameService.start(gameId, teamIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAMES_KEY] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export const useStartFirstRound = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gameId: string) => gameService.startFirstRound(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAMES_KEY] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export const useNextRound = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gameId: string) => gameService.nextRound(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAMES_KEY] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export const useCompleteGame = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gameId: string) => gameService.complete(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAMES_KEY] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}
