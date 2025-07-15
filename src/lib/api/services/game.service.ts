import { fetchAPI } from '../client'
import type { Game, UUID } from '../types'

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

  async start(id: UUID): Promise<Game> {
    return fetchAPI<Game>(`${this.basePath}/${id}/start`, {
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
}

export const gameService = new GameService()
