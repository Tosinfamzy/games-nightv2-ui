import { fetchAPI } from '../client'
import type { Session, UUID } from '../types'
import type { CreateSessionDTO, UpdateSessionDTO } from '../hooks/use-session'

// Additional types for session functionality
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

class SessionService {
  private readonly basePath = '/sessions'

  async getAll(): Promise<Array<Session>> {
    return fetchAPI<Array<Session>>(this.basePath)
  }

  async getById(id: UUID): Promise<Session> {
    return fetchAPI<Session>(`${this.basePath}/${id}`)
  }

  async create(session: CreateSessionDTO): Promise<Session> {
    return fetchAPI<Session>(this.basePath, {
      method: 'POST',
      body: JSON.stringify(session),
    })
  }

  async update(id: UUID, session: UpdateSessionDTO): Promise<Session> {
    return fetchAPI<Session>(`${this.basePath}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(session),
    })
  }

  async delete(id: UUID): Promise<void> {
    return fetchAPI(`${this.basePath}/${id}`, {
      method: 'DELETE',
    })
  }

  async start(id: UUID): Promise<Session> {
    return fetchAPI<Session>(`${this.basePath}/${id}/start`, {
      method: 'POST',
    })
  }

  async complete(id: UUID): Promise<Session> {
    return fetchAPI<Session>(`${this.basePath}/${id}/complete`, {
      method: 'POST',
    })
  }

  async cancel(id: UUID): Promise<Session> {
    return fetchAPI<Session>(`${this.basePath}/${id}/cancel`, {
      method: 'POST',
    })
  }

  // Join session by code
  async getByJoinCode(joinCode: string): Promise<Session> {
    return fetchAPI<Session>(`${this.basePath}/join/${joinCode}`)
  }

  async joinSession(
    data: JoinSessionDTO,
  ): Promise<{ session: Session; player: any }> {
    return fetchAPI<{ session: Session; player: any }>(
      `${this.basePath}/join`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    )
  }

  // Game management
  async addGames(id: UUID, data: AddGamesToSessionDTO): Promise<Session> {
    return fetchAPI<Session>(`${this.basePath}/${id}/games`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async removeGame(id: UUID, data: RemoveGameFromSessionDTO): Promise<Session> {
    return fetchAPI<Session>(`${this.basePath}/${id}/games`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    })
  }

  // Validation and readiness
  async validateSession(id: UUID): Promise<SessionValidation> {
    return fetchAPI<SessionValidation>(`${this.basePath}/${id}/validation`)
  }

  async checkCanStart(
    id: UUID,
  ): Promise<{ canStart: boolean; reasons: Array<string> }> {
    return fetchAPI<{ canStart: boolean; reasons: Array<string> }>(
      `${this.basePath}/${id}/can-start`,
    )
  }

  async getReadiness(id: UUID): Promise<SessionReadiness> {
    return fetchAPI<SessionReadiness>(`${this.basePath}/${id}/readiness`)
  }
}

export const sessionService = new SessionService()
