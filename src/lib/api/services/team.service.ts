import { fetchAPI } from '../client'
import type { Player } from './player.service'

export interface Team {
  id: string
  name: string
  color?: string
  position: number
  isActive: boolean
  game: {
    id: string
    name: string
    status: string
    currentRound: number
    maxRounds: number
    session: {
      id: string
      name: string
      status: string
      joinCode: string
    }
  }
  session: {
    id: string
    name: string
    status: string
    joinCode: string
    host: {
      id: string
      name: string
    }
  }
  players: Array<Player>
  createdAt: string
  updatedAt: string
}

export interface CreateTeamDTO {
  name: string
  gameId: string
  sessionId: string
  color?: string
  position?: number
  playerIds?: Array<string>
}

export interface UpdateTeamDTO {
  name?: string
  color?: string
  position?: number
  playerIds?: Array<string>
  isActive?: boolean
}

export const teamService = {
  // Get all teams
  getAll: (): Promise<Array<Team>> => {
    return fetchAPI<Array<Team>>('/teams')
  },

  // Get teams by session
  getBySession: (sessionId: string): Promise<Array<Team>> => {
    return fetchAPI<Array<Team>>(`/teams/session/${sessionId}`)
  },

  // Get teams by game
  getByGame: (gameId: string): Promise<Array<Team>> => {
    return fetchAPI<Array<Team>>(`/teams/game/${gameId}`)
  },

  // Get a specific team
  getById: (id: string): Promise<Team> => {
    return fetchAPI<Team>(`/teams/${id}`)
  },

  // Create a new team
  create: (data: CreateTeamDTO): Promise<Team> => {
    return fetchAPI<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update a team
  update: (id: string, data: UpdateTeamDTO): Promise<Team> => {
    return fetchAPI<Team>(`/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Add players to team
  addPlayers: (teamId: string, playerIds: Array<string>): Promise<Team> => {
    return fetchAPI<Team>(`/teams/${teamId}/players`, {
      method: 'POST',
      body: JSON.stringify({ playerIds }),
    })
  },

  // Remove players from team
  removePlayers: (teamId: string, playerIds: Array<string>): Promise<Team> => {
    return fetchAPI<Team>(`/teams/${teamId}/players`, {
      method: 'DELETE',
      body: JSON.stringify({ playerIds }),
    })
  },

  // Delete a team
  delete: (id: string): Promise<void> => {
    return fetchAPI<void>(`/teams/${id}`, {
      method: 'DELETE',
    })
  },
}
