import { fetchAPI } from '../client'

export interface Score {
  id: string
  points: number
  roundNumber: number
  isBonus?: boolean
  game: {
    id: string
    name: string
    status: string
    currentRound: number
    maxRounds: number
  }
  team: {
    id: string
    name: string
    color?: string
  }
  player?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface TeamScore {
  teamId: string
  teamName: string
  totalPoints: number
  bonusPointsCount: number
  roundPoints: Record<string, number>
}

export interface CreateScoreDTO {
  gameId: string
  teamId?: string
  playerId?: string
  points: number
  isBonus?: boolean
}

export interface UpdateScoreDTO {
  points?: number
  isBonus?: boolean
}

export interface SubmitGameScoreDTO {
  /** Team-mode games score a team; individual-mode games score a player. */
  teamId?: string
  playerId?: string
  score: number
  roundNumber?: number
}

export const scoreService = {
  // Get all scores
  getAll: (): Promise<Array<Score>> => {
    return fetchAPI<Array<Score>>('/scores')
  },

  // Get a specific score
  getById: (id: string): Promise<Score> => {
    return fetchAPI<Score>(`/scores/${id}`)
  },

  // Get scores for a specific game (returns team scores)
  getGameScores: (gameId: string): Promise<Array<TeamScore>> => {
    return fetchAPI<Array<TeamScore>>(`/scores/games/${gameId}`)
  },

  // Create a new score
  create: (data: CreateScoreDTO): Promise<Score> => {
    return fetchAPI<Score>('/scores', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Submit a score for a game. Uses the dedicated submit endpoint (not the
  // generic POST /scores) because only this path broadcasts
  // game:score-submitted to other clients and enforces team/round ownership
  // server-side.
  submitGameScore: (
    gameId: string,
    data: SubmitGameScoreDTO,
  ): Promise<Score> => {
    return fetchAPI<Score>(`/scores/games/${gameId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        teamId: data.teamId,
        playerId: data.playerId,
        score: data.score,
      }),
    })
  },

  // Update a score. Backend route is PUT /scores/:id (PATCH 404s).
  update: (id: string, data: UpdateScoreDTO): Promise<Score> => {
    return fetchAPI<Score>(`/scores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete a score
  delete: (id: string): Promise<void> => {
    return fetchAPI<void>(`/scores/${id}`, {
      method: 'DELETE',
    })
  },
}
