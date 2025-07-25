import { fetchAPI } from '../client'

export interface Player {
  id: string
  name: string
  status: 'joined' | 'ready' | 'playing' | 'disconnected'
  lastConnectedAt?: string
  session?: {
    id: string
    name: string
    description?: string
    date: string
    location?: string
    status: string
    joinCode: string
    host: {
      id: string
      name: string
      createdAt: string
      updatedAt: string
    }
    createdAt: string
    updatedAt: string
  }
  team?: {
    id: string
    name: string
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

export const playerService = {
  // Get all players
  getAll: (): Promise<Array<Player>> => {
    return fetchAPI<Array<Player>>('/players')
  },

  // Get players by session
  getBySession: (sessionId: string): Promise<Array<Player>> => {
    return fetchAPI<Array<Player>>(`/players/session/${sessionId}`)
  },

  // Get a specific player
  getById: (id: string): Promise<Player> => {
    return fetchAPI<Player>(`/players/${id}`)
  },

  // Create a new player
  create: (data: CreatePlayerDTO): Promise<Player> => {
    return fetchAPI<Player>('/players', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update a player
  update: (id: string, data: UpdatePlayerDTO): Promise<Player> => {
    return fetchAPI<Player>(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Update player status
  updateStatus: (id: string, data: UpdatePlayerStatusDTO): Promise<Player> => {
    return fetchAPI<Player>(`/players/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Delete a player
  delete: (id: string): Promise<void> => {
    return fetchAPI<void>(`/players/${id}`, {
      method: 'DELETE',
    })
  },
}
