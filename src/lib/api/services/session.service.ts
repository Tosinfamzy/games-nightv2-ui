import { fetchAPI } from '../client'
import type { Session, UUID } from '../types'
import type { CreateSessionDTO, UpdateSessionDTO } from '../hooks/use-session'

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
}

export const sessionService = new SessionService()
