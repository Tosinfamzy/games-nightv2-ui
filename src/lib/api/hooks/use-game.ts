import { useQuery } from '@tanstack/react-query'
import { gameService } from '../services/game.service'
import type { GameResults } from '../types'

// Query keys for game-related queries
export const gameKeys = {
  all: ['games'] as const,
  details: () => [...gameKeys.all, 'detail'] as const,
  detail: (id: string) => [...gameKeys.details(), id] as const,
  results: (id: string) => [...gameKeys.detail(id), 'results'] as const,
}

/**
 * Hook to fetch game results with rankings and winner
 */
export const useGameResults = (gameId: string) => {
  return useQuery<GameResults>({
    queryKey: gameKeys.results(gameId),
    queryFn: () => gameService.getResults(gameId),
    enabled: !!gameId,
  })
}
