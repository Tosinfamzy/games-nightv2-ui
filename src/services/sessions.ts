import { fetchAPI } from '../lib/api/client'
import type { Session } from '../types'

export interface CreateSessionDTO {
  name: string
  description?: string
  date: string
  location?: string
  gamesMasterId: string
}

export interface UpdateSessionDTO extends Partial<CreateSessionDTO> {}

export const sessionService = {
  getAll: () => fetchAPI<Array<Session>>('/sessions'),

  getById: (id: string) => fetchAPI<Session>(`/sessions/${id}`),

  create: (data: CreateSessionDTO) =>
    fetchAPI<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSessionDTO) =>
    fetchAPI<Session>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/sessions/${id}`, {
      method: 'DELETE',
    }),

  start: (id: string) =>
    fetchAPI<Session>(`/sessions/${id}/start`, {
      method: 'POST',
    }),

  complete: (id: string) =>
    fetchAPI<Session>(`/sessions/${id}/complete`, {
      method: 'POST',
    }),

  cancel: (id: string) =>
    fetchAPI<Session>(`/sessions/${id}/cancel`, {
      method: 'POST',
    }),
}
