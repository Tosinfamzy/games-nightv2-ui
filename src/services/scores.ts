import type { Score, TeamScore } from '@/types'
import { fetchAPI } from '@/lib/api/client'

export interface CreateScoreDTO {
  points: number
  roundNumber: number
  teamId: string
  gameId: string
  notes?: string
}

export interface UpdateScoreDTO extends Partial<CreateScoreDTO> {}

export interface SubmitGameScoreDTO {
  teamScores: Array<{
    teamId: string
    points: number
    notes?: string
  }>
  roundNumber: number
}

export const scoreService = {
  getAll: () => fetchAPI<Array<Score>>('/scores'),

  getById: (id: string) => fetchAPI<Score>(`/scores/${id}`),

  getByGame: (gameId: string) =>
    fetchAPI<Array<TeamScore>>(`/scores/games/${gameId}`),

  getByTeam: (teamId: string) =>
    fetchAPI<Array<Score>>('/scores', {
      params: { teamId },
    }),

  create: (data: CreateScoreDTO) =>
    fetchAPI<Score>('/scores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitGameScore: (gameId: string, data: SubmitGameScoreDTO) =>
    fetchAPI<Array<Score>>(`/scores/games/${gameId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateScoreDTO) =>
    fetchAPI<Score>(`/scores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/scores/${id}`, {
      method: 'DELETE',
    }),
}
