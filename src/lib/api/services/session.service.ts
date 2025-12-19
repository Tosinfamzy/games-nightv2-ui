import { fetchAPI } from '../client'
import type {
  Game,
  Player,
  Session,
  SessionLeaderboard,
  Team,
  UUID,
} from '../types'
import type { CreateSessionDTO, UpdateSessionDTO } from '../hooks/use-session'

// Additional types for session functionality
export interface CreateSessionResponse {
  session: Session
  gmPlayer: Player
  message: string
  playerToken: string
}

export interface JoinSessionDTO {
  joinCode: string
  playerName: string
  playerEmail?: string
}

export interface SessionValidation {
  valid: boolean
  errors: Array<string>
  warnings: Array<string>
}

export interface SessionReadiness {
  canStart: boolean
  playerCount: number
  minPlayers: number
  maxPlayers: number
  teamsFormed: boolean
  gamesSelected: boolean
}

export interface AddGamesToSessionDTO {
  gameIds: Array<string>
}

export interface RemoveGameFromSessionDTO {
  gameId: string
}

const BASE_PATH = '/sessions'

export const sessionService = {
  getAll: async (): Promise<Array<Session>> => {
    return fetchAPI<Array<Session>>(BASE_PATH)
  },

  getById: async (id: UUID): Promise<Session> => {
    return fetchAPI<Session>(`${BASE_PATH}/${id}`)
  },

  create: async (session: CreateSessionDTO): Promise<CreateSessionResponse> => {
    return fetchAPI<CreateSessionResponse>(BASE_PATH, {
      method: 'POST',
      body: JSON.stringify(session),
    })
  },

  update: async (id: UUID, session: UpdateSessionDTO): Promise<Session> => {
    return fetchAPI<Session>(`${BASE_PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(session),
    })
  },

  delete: async (id: UUID): Promise<void> => {
    return fetchAPI(`${BASE_PATH}/${id}`, {
      method: 'DELETE',
    })
  },

  start: async (id: UUID): Promise<Session> => {
    return fetchAPI<Session>(`${BASE_PATH}/${id}/start`, {
      method: 'POST',
    })
  },

  complete: async (id: UUID): Promise<Session> => {
    return fetchAPI<Session>(`${BASE_PATH}/${id}/complete`, {
      method: 'POST',
    })
  },

  cancel: async (id: UUID): Promise<Session> => {
    return fetchAPI<Session>(`${BASE_PATH}/${id}/cancel`, {
      method: 'POST',
    })
  },

  getByJoinCode: async (joinCode: string): Promise<Session> => {
    return fetchAPI<Session>(`${BASE_PATH}/join/${joinCode}`)
  },

  // Alias for getByJoinCode for consistency
  findByJoinCode: async (joinCode: string): Promise<Session> => {
    return fetchAPI<Session>(`${BASE_PATH}/join/${joinCode}`)
  },

  joinSession: async (
    data: JoinSessionDTO,
  ): Promise<{ session: Session; playerId: string; playerName: string; message: string; playerToken: string }> => {
    return fetchAPI<{ session: Session; playerId: string; playerName: string; message: string; playerToken: string }>(`${BASE_PATH}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  rejoinSession: async (
    playerToken: string,
  ): Promise<{ session: Session; playerId: string; playerName: string; message: string; playerToken: string }> => {
    return fetchAPI<{ session: Session; playerId: string; playerName: string; message: string; playerToken: string }>(`${BASE_PATH}/rejoin`, {
      method: 'POST',
      body: JSON.stringify({ playerToken }),
    })
  },

  addGames: async (id: UUID, data: AddGamesToSessionDTO): Promise<Session> => {
    return fetchAPI<Session>(`${BASE_PATH}/${id}/games`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  removeGame: async (
    id: UUID,
    data: RemoveGameFromSessionDTO,
  ): Promise<Session> => {
    return fetchAPI<Session>(`${BASE_PATH}/${id}/games`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    })
  },

  validateSession: async (id: UUID): Promise<SessionValidation> => {
    return fetchAPI<SessionValidation>(`${BASE_PATH}/${id}/validation`)
  },

  checkCanStart: async (
    id: UUID,
  ): Promise<{ canStart: boolean; reasons: Array<string> }> => {
    return fetchAPI<{ canStart: boolean; reasons: Array<string> }>(
      `${BASE_PATH}/${id}/can-start`,
    )
  },

  getReadiness: async (id: UUID): Promise<SessionReadiness> => {
    return fetchAPI<SessionReadiness>(`${BASE_PATH}/${id}/readiness`)
  },

  // Fetch nested resources for a session
  getGames: async (id: UUID): Promise<Array<Game>> => {
    return fetchAPI<Array<Game>>(`${BASE_PATH}/${id}/games`)
  },

  getTeams: async (id: UUID): Promise<Array<Team>> => {
    return fetchAPI<Array<Team>>(`${BASE_PATH}/${id}/teams`)
  },

  getPlayers: async (id: UUID): Promise<Array<Player>> => {
    return fetchAPI<Array<Player>>(`${BASE_PATH}/${id}/players`)
  },

  getLeaderboard: async (id: UUID): Promise<SessionLeaderboard> => {
    return fetchAPI<SessionLeaderboard>(`${BASE_PATH}/${id}/leaderboard`)
  },
}
