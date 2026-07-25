import { fetchAPI } from '../client'
import type { PlayerListItemDto, PlayerResponseDto } from '../types/player.dto'

export interface Player {
  id: string
  name: string
  status: 'joined' | 'ready' | 'playing' | 'disconnected'
  lastConnectedAt?: string
  session?: {
    id: string
    name?: string
    status?: string
    joinCode?: string
  }
  team?: {
    id: string
    name?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreatePlayerDTO {
  name: string
  sessionId: string
}

export interface UpdatePlayerDTO {
  name?: string
}

export interface UpdatePlayerStatusDTO {
  status: 'joined' | 'ready' | 'playing' | 'disconnected'
  lastConnectedAt?: string
}

const mapPlayerDto = (dto: PlayerResponseDto | PlayerListItemDto): Player => ({
  id: dto.id,
  name: dto.name,
  status: dto.status,
  lastConnectedAt: dto.lastConnectedAt ?? undefined,
  session:
    'session' in dto && dto.session
      ? {
          id: dto.session.id,
          name: dto.session.name,
          status: dto.session.status,
          joinCode: dto.session.joinCode,
        }
      : dto.sessionId
        ? { id: dto.sessionId }
        : undefined,
  team:
    'teams' in dto && dto.teams && dto.teams.length > 0
      ? { id: dto.teams[0].id, name: dto.teams[0].name }
      : dto.teamIds && dto.teamIds.length > 0
        ? { id: dto.teamIds[0] }
        : undefined,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
})

export const playerService = {
  getAll: async (): Promise<Array<Player>> => {
    const data = await fetchAPI<Array<PlayerListItemDto>>('/players')
    return data.map(mapPlayerDto)
  },

  getBySession: async (sessionId: string): Promise<Array<Player>> => {
    const data = await fetchAPI<Array<PlayerListItemDto>>(
      `/players/session/${sessionId}`,
    )
    return data.map(mapPlayerDto)
  },

  getById: async (id: string): Promise<Player> => {
    const data = await fetchAPI<PlayerResponseDto>(`/players/${id}`)
    return mapPlayerDto(data)
  },

  create: (data: CreatePlayerDTO): Promise<Player> => {
    return fetchAPI<PlayerResponseDto>('/players', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(mapPlayerDto)
  },

  update: (id: string, data: UpdatePlayerDTO): Promise<Player> => {
    return fetchAPI<PlayerResponseDto>(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(mapPlayerDto)
  },

  updateStatus: (id: string, data: UpdatePlayerStatusDTO): Promise<Player> => {
    return fetchAPI<PlayerResponseDto>(`/players/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }).then(mapPlayerDto)
  },

  delete: (id: string): Promise<void> => {
    return fetchAPI<void>(`/players/${id}`, {
      method: 'DELETE',
    })
  },
}
