import { fetchAPI } from '../client'

export interface GamesMaster {
  id: string
  name: string
  email?: string
  createdAt: string
  updatedAt: string
  sessions?: Array<SessionSummary>
}

export interface SessionSummary {
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

export interface CreateGamesMasterDTO {
  name: string
}

export interface UpdateGamesMasterDTO {
  name?: string
}

export interface ActiveSession {
  id: string
  name: string
  status: string
  playerCount: number
  maxPlayers: number
  createdAt: string
}

export const gamesMasterService = {
  // Get all games masters
  getAll: (): Promise<Array<GamesMaster>> => {
    return fetchAPI<Array<GamesMaster>>('/games-master')
  },

  // Get a specific games master
  getById: (id: string): Promise<GamesMaster> => {
    return fetchAPI<GamesMaster>(`/games-master/${id}`)
  },

  // Create a new games master
  create: (data: CreateGamesMasterDTO): Promise<GamesMaster> => {
    return fetchAPI<GamesMaster>('/games-master', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update a games master
  update: (id: string, data: UpdateGamesMasterDTO): Promise<GamesMaster> => {
    return fetchAPI<GamesMaster>(`/games-master/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete a games master
  delete: (id: string): Promise<void> => {
    return fetchAPI<void>(`/games-master/${id}`, {
      method: 'DELETE',
    })
  },

  // Get active sessions for a games master
  getActiveSessions: (id: string): Promise<Array<ActiveSession>> => {
    return fetchAPI<Array<ActiveSession>>(`/games-master/${id}/active-sessions`)
  },
}
