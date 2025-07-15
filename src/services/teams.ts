import type { Team } from '@/types'
import { fetchAPI } from '@/lib/api/client'

export interface CreateTeamDTO {
  name: string
  gameId: string
  playerIds?: Array<string>
}

export interface UpdateTeamDTO extends Partial<CreateTeamDTO> {}

export const teamService = {
  getAll: () => fetchAPI<Array<Team>>('/teams'),

  getById: (id: string) => fetchAPI<Team>(`/teams/${id}`),

  getByGame: (gameId: string) =>
    fetchAPI<Array<Team>>('/teams', {
      params: { gameId },
    }),

  create: (data: CreateTeamDTO) =>
    fetchAPI<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTeamDTO) =>
    fetchAPI<Team>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/teams/${id}`, {
      method: 'DELETE',
    }),

  addPlayer: (id: string, playerId: string) =>
    fetchAPI<Team>(`/teams/${id}/players/${playerId}`, {
      method: 'POST',
    }),

  removePlayer: (id: string, playerId: string) =>
    fetchAPI<Team>(`/teams/${id}/players/${playerId}`, {
      method: 'DELETE',
    }),
}
