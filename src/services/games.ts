import type { Game, GameStatus } from '@/types'
import { fetchAPI } from '@/lib/api/client'

export interface CreateGameDTO {
  name: string
  description?: string
  maxPlayers: number
  minPlayers: number
  sessionId: string
  maxRounds: number
}

export interface UpdateGameDTO extends Partial<CreateGameDTO> {
  status?: GameStatus
  currentRound?: number
}

export const gameService = {
  getAll: () => fetchAPI<Array<Game>>('/games'),

  getById: (id: string) => fetchAPI<Game>(`/games/${id}`),

  getBySession: (sessionId: string) =>
    fetchAPI<Array<Game>>('/games', {
      params: { sessionId },
    }),

  create: (data: CreateGameDTO) =>
    fetchAPI<Game>('/games', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateGameDTO) =>
    fetchAPI<Game>(`/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/games/${id}`, {
      method: 'DELETE',
    }),

  start: (id: string) =>
    fetchAPI<Game>(`/games/${id}/start`, {
      method: 'POST',
    }),

  nextRound: (id: string) =>
    fetchAPI<Game>(`/games/${id}/next-round`, {
      method: 'POST',
    }),

  complete: (id: string) =>
    fetchAPI<Game>(`/games/${id}/complete`, {
      method: 'POST',
    }),

  cancel: (id: string) =>
    fetchAPI<Game>(`/games/${id}/cancel`, {
      method: 'POST',
    }),
}
