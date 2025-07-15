import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gameService } from '../services/games'
import type { CreateGameDTO, UpdateGameDTO } from '../services/games'
import type { Game } from '../types'

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

export const useGamesBySession = (sessionId: string) => {
  return useQuery({
    queryKey: [GAMES_KEY, 'session', sessionId],
    queryFn: () => gameService.getBySession(sessionId),
    enabled: Boolean(sessionId),
  })
}

export const useCreateGame = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGameDTO) => gameService.create(data),
    onSuccess: (newGame) => {
      queryClient.setQueryData<Array<Game>>([GAMES_KEY], (old = []) => [
        ...old,
        newGame,
      ])
      queryClient.setQueryData<Array<Game>>(
        [GAMES_KEY, 'session', newGame.sessionId],
        (old = []) => [...old, newGame],
      )
    },
  })
}

export const useUpdateGame = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateGameDTO) => gameService.update(id, data),
    onSuccess: (updatedGame) => {
      queryClient.setQueryData<Game>([GAMES_KEY, id], updatedGame)
      queryClient.setQueryData<Array<Game>>([GAMES_KEY], (old = []) =>
        old.map((game) => (game.id === id ? updatedGame : game)),
      )
      queryClient.setQueryData<Array<Game>>(
        [GAMES_KEY, 'session', updatedGame.sessionId],
        (old = []) => old.map((game) => (game.id === id ? updatedGame : game)),
      )
    },
  })
}

export const useDeleteGame = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => gameService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: [GAMES_KEY, id] })
      queryClient.setQueryData<Array<Game>>([GAMES_KEY], (old = []) =>
        old.filter((game) => game.id !== id),
      )
    },
  })
}

export const useGameAction = (action: 'start' | 'nextRound' | 'complete') => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => gameService[action](id),
    onSuccess: (updatedGame) => {
      queryClient.setQueryData<Game>([GAMES_KEY, updatedGame.id], updatedGame)
      queryClient.setQueryData<Array<Game>>([GAMES_KEY], (old = []) =>
        old.map((game) => (game.id === updatedGame.id ? updatedGame : game)),
      )
      queryClient.setQueryData<Array<Game>>(
        [GAMES_KEY, 'session', updatedGame.sessionId],
        (old = []) =>
          old.map((game) => (game.id === updatedGame.id ? updatedGame : game)),
      )
    },
  })
}
