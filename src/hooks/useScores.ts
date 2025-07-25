import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { scoreService } from '../lib/api/services/score.service'
import type {
  Score,
  SubmitGameScoreDTO,
  UpdateScoreDTO,
} from '../lib/api/services/score.service'

const SCORES_KEY = 'scores'

export const useScores = () => {
  return useQuery({
    queryKey: [SCORES_KEY],
    queryFn: scoreService.getAll,
  })
}

export const useScore = (id: string) => {
  return useQuery({
    queryKey: [SCORES_KEY, id],
    queryFn: () => scoreService.getById(id),
    enabled: Boolean(id),
  })
}

export const useGameScores = (gameId: string) => {
  return useQuery({
    queryKey: [SCORES_KEY, 'game', gameId],
    queryFn: () => scoreService.getGameScores(gameId),
    enabled: Boolean(gameId),
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  })
}

export const useCreateScore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: scoreService.create,
    onSuccess: (newScore: Score) => {
      queryClient.setQueryData<Score>([SCORES_KEY, newScore.id], newScore)
      queryClient.setQueryData<Array<Score>>([SCORES_KEY], (old = []) => [
        ...old,
        newScore,
      ])
      queryClient.invalidateQueries({
        queryKey: [SCORES_KEY, 'game', newScore.game.id],
      })
    },
  })
}

export const useSubmitGameScore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gameId,
      data,
    }: {
      gameId: string
      data: SubmitGameScoreDTO
    }) => scoreService.submitGameScore(gameId, data),
    onSuccess: (newScore: Score) => {
      queryClient.setQueryData<Score>([SCORES_KEY, newScore.id], newScore)
      queryClient.setQueryData<Array<Score>>([SCORES_KEY], (old = []) => [
        ...old,
        newScore,
      ])
      queryClient.invalidateQueries({
        queryKey: [SCORES_KEY, 'game', newScore.game.id],
      })
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export const useUpdateScore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScoreDTO }) =>
      scoreService.update(id, data),
    onSuccess: (updatedScore: Score) => {
      queryClient.setQueryData<Score>(
        [SCORES_KEY, updatedScore.id],
        updatedScore,
      )
      queryClient.setQueryData<Array<Score>>([SCORES_KEY], (old = []) =>
        old.map((score) =>
          score.id === updatedScore.id ? updatedScore : score,
        ),
      )
      queryClient.invalidateQueries({
        queryKey: [SCORES_KEY, 'game', updatedScore.game.id],
      })
    },
  })
}

export const useDeleteScore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: scoreService.delete,
    onSuccess: (_, scoreId: string) => {
      queryClient.removeQueries({ queryKey: [SCORES_KEY, scoreId] })
      queryClient.setQueryData<Array<Score>>([SCORES_KEY], (old = []) =>
        old.filter((score) => score.id !== scoreId),
      )
      queryClient.invalidateQueries({ queryKey: [SCORES_KEY] })
    },
  })
}
