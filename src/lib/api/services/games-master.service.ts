import { fetchAPI } from '../client'
import type { GMDashboard } from '../types'

export interface GamesMaster {
  id: string
  name: string
  hostCode: string
  email?: string
  sessionCount: number
  createdAt: string
  updatedAt: string
  sessionIds?: Array<string>
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

  // Get games masters by name (for code retrieval)
  getByName: (name: string): Promise<Array<GamesMaster>> => {
    return fetchAPI<Array<GamesMaster>>(`/games-master/by-name/${encodeURIComponent(name)}`)
  },

  // Get games master by host code
  getByCode: (code: string): Promise<GamesMaster> => {
    return fetchAPI<GamesMaster>(`/games-master/by-code/${code.toUpperCase()}`)
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

  // Get dashboard data for a games master (Phase 1)
  getDashboard: (id: string): Promise<GMDashboard> => {
    return fetchAPI<GMDashboard>(`/games-master/${id}/dashboard`)
  },
}
