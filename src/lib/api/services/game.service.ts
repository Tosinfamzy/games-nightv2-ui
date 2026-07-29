import { fetchAPI } from '../client'
import type { Game, GameResults, UUID } from '../types'

export interface GameTimerStatus {
  gameId: string
  currentTurnTeamId: string | null
  currentTurnTeamName: string | null
  turnStartedAt: string | null
  turnTimeLimit: number | null
  remainingSeconds: number | null
  isExpired: boolean
}

class GameService {
  private readonly basePath = '/games'

  async getAll(): Promise<Array<Game>> {
    return fetchAPI<Array<Game>>(this.basePath)
  }

  async getById(id: UUID): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}`)
  }

  async create(
    game: Omit<
      Game,
      'id' | 'status' | 'currentRound' | 'startTime' | 'endTime'
    >,
  ): Promise<Game> {
    return fetchAPI<Game>(this.basePath, {
      method: 'POST',
      body: JSON.stringify(game),
    })
  }

  async update(id: UUID, game: Partial<Game>): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(game),
    })
  }

  async delete(id: UUID): Promise<void> {
    return fetchAPI(`${this.basePath}/${id}`, {
      method: 'DELETE',
    })
  }

  async start(id: UUID, teamIds?: Array<string>): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}/start`, {
      method: 'POST',
      body: teamIds ? JSON.stringify({ teamIds }) : undefined,
    })
  }

  async startFirstRound(id: UUID): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}/start-first-round`, {
      method: 'POST',
    })
  }

  async nextRound(id: UUID): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}/next-round`, {
      method: 'POST',
    })
  }

  async complete(id: UUID): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}/complete`, {
      method: 'POST',
    })
  }

  async getResults(id: UUID): Promise<GameResults> {
    return fetchAPI<GameResults>(`${this.basePath}/${id}/results`)
  }

  async pause(id: UUID): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}/pause`, {
      method: 'POST',
    })
  }

  async resume(id: UUID): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}/resume`, {
      method: 'POST',
    })
  }

  async endRound(id: UUID): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}/end-round`, {
      method: 'POST',
    })
  }

  async nextTurn(id: UUID): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}/next-turn`, {
      method: 'POST',
    })
  }

  async getStats(id: UUID): Promise<any> {
    return fetchAPI(`${this.basePath}/${id}/stats`)
  }

  async getTimer(id: UUID): Promise<GameTimerStatus> {
    return fetchAPI<GameTimerStatus>(`${this.basePath}/${id}/timer`)
  }

  async cancel(id: UUID): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}/cancel`, {
      method: 'POST',
    })
  }
}

export const gameService = new GameService()
