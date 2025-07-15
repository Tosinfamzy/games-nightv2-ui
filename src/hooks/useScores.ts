import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { scoreService } from '../services/scores'
import type {
  CreateScoreDTO,
  SubmitGameScoreDTO,
  UpdateScoreDTO,
} from '../services/scores'
import type { Score, TeamScore } from '../types'

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
  return useQuery<Array<TeamScore>>({
    queryKey: [SCORES_KEY, 'game', gameId],
    queryFn: () => scoreService.getByGame(gameId),
    enabled: Boolean(gameId),
  })
}

export const useTeamScores = (teamId: string) => {
  return useQuery({
    queryKey: [SCORES_KEY, 'team', teamId],
    queryFn: () => scoreService.getByTeam(teamId),
    enabled: Boolean(teamId),
  })
}

export const useCreateScore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScoreDTO) => scoreService.create(data),
    onSuccess: (newScore) => {
      queryClient.setQueryData<Array<Score>>([SCORES_KEY], (old = []) => [
        ...old,
        newScore,
      ])
      queryClient.invalidateQueries({
        queryKey: [SCORES_KEY, 'game', newScore.gameId],
      })
      queryClient.invalidateQueries({
        queryKey: [SCORES_KEY, 'team', newScore.teamId],
      })
    },
  })
}

export const useSubmitGameScore = (gameId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubmitGameScoreDTO) =>
      scoreService.submitGameScore(gameId, data),
    onSuccess: (newScores) => {
      queryClient.setQueryData<Array<Score>>([SCORES_KEY], (old = []) => [
        ...old,
        ...newScores,
      ])
      queryClient.invalidateQueries({
        queryKey: [SCORES_KEY, 'game', gameId],
      })
      // Invalidate team scores for all teams that received new scores
      newScores.forEach((score) => {
        queryClient.invalidateQueries({
          queryKey: [SCORES_KEY, 'team', score.teamId],
        })
      })
    },
  })
}

export const useUpdateScore = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateScoreDTO) => scoreService.update(id, data),
    onSuccess: (updatedScore) => {
      queryClient.setQueryData<Score>([SCORES_KEY, id], updatedScore)
      queryClient.setQueryData<Array<Score>>([SCORES_KEY], (old = []) =>
        old.map((score) => (score.id === id ? updatedScore : score)),
      )
      queryClient.invalidateQueries({
        queryKey: [SCORES_KEY, 'game', updatedScore.gameId],
      })
      queryClient.invalidateQueries({
        queryKey: [SCORES_KEY, 'team', updatedScore.teamId],
      })
    },
  })
}

export const useDeleteScore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scoreService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: [SCORES_KEY, id] })
      queryClient.setQueryData<Array<Score>>([SCORES_KEY], (old = []) =>
        old.filter((score) => score.id !== id),
      )
      // Note: We need to invalidate game and team score queries as we don't know
      // which game/team this score belonged to after deletion
      queryClient.invalidateQueries({
        queryKey: [SCORES_KEY, 'game'],
      })
      queryClient.invalidateQueries({
        queryKey: [SCORES_KEY, 'team'],
      })
    },
  })
}
