import type { Player } from '@/types'
import { fetchAPI } from '@/lib/api/client'

export interface CreatePlayerDTO {
  name: string
  email?: string
}

export interface UpdatePlayerDTO extends Partial<CreatePlayerDTO> {}

export const playerService = {
  getAll: () => fetchAPI<Array<Player>>('/players'),

  getById: (id: string) => fetchAPI<Player>(`/players/${id}`),

  getByTeam: (teamId: string) =>
    fetchAPI<Array<Player>>('/players', {
      params: { teamId },
    }),

  create: (data: CreatePlayerDTO) =>
    fetchAPI<Player>('/players', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePlayerDTO) =>
    fetchAPI<Player>(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/players/${id}`, {
      method: 'DELETE',
    }),
}
