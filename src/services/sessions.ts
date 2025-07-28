import { fetchAPI } from '../lib/api/client'
import type { JoinSessionRequest, JoinSessionResponse, Session } from '../types'

export interface CreateSessionDTO {
  name: string
  description?: string
  date: string
  location?: string
  gamesMasterId: string
}

export interface UpdateSessionDTO extends Partial<CreateSessionDTO> {}

// Demo mode for testing without backend
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false' // Default to true for demo

const demoSessions: Record<string, Session> = {
  '123456': {
    id: 'demo-session-1',
    name: 'Demo Game Night',
    description: 'A demo session for testing',
    date: new Date().toISOString(),
    location: 'Demo Location',
    status: 'SCHEDULED' as any,
    host: {
      id: 'demo-host',
      name: 'Demo Host',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    joinCode: '123456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  '999999': {
    id: 'demo-session-2',
    name: 'Another Demo Session',
    description: 'Another demo session for testing',
    date: new Date().toISOString(),
    location: 'Demo Location 2',
    status: 'SCHEDULED' as any,
    host: {
      id: 'demo-host-2',
      name: 'Demo Host 2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    joinCode: '999999',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add the specific session from your URL for testing
  '09750b80-7b45-48bf-9dc4-f53f75406867': {
    id: '09750b80-7b45-48bf-9dc4-f53f75406867',
    name: 'Test Game Night Session',
    description: 'A test session for development',
    date: new Date().toISOString(),
    location: 'Test Location',
    status: 'SCHEDULED' as any,
    host: {
      id: 'test-host',
      name: 'Test Host',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    joinCode: 'TEST123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

export const sessionService = {
  getAll: () => fetchAPI<Array<Session>>('/sessions'),

  getById: (id: string) => {
    if (DEMO_MODE) {
      // Check if the ID matches any demo session ID
      const demoSession = Object.values(demoSessions).find(
        (session) => session.id === id,
      )
      if (demoSession) {
        return Promise.resolve(demoSession)
      }
      // If not found by ID, maybe it's a join code (for backward compatibility)
      if (id in demoSessions) {
        return Promise.resolve(demoSessions[id])
      }
      return Promise.reject(new Error('Session not found'))
    }
    return fetchAPI<Session>(`/sessions/${id}`)
  },

  create: (data: CreateSessionDTO) => {
    if (DEMO_MODE) {
      // Generate a random join code for demo
      const joinCode = Math.floor(100000 + Math.random() * 900000).toString()
      const newSession: Session = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        date: data.date,
        location: data.location,
        status: 'SCHEDULED' as any,
        host: {
          id: data.gamesMasterId,
          name: 'Demo Host',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        joinCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      // Add to demo sessions for future joins
      demoSessions[joinCode] = newSession
      return Promise.resolve(newSession)
    }
    return fetchAPI<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

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

  findByJoinCode: (joinCode: string) => {
    if (DEMO_MODE) {
      if (joinCode in demoSessions) {
        return Promise.resolve(demoSessions[joinCode])
      }
      return Promise.reject(new Error('Session not found'))
    }
    return fetchAPI<Session>(`/sessions/join/${joinCode}`)
  },

  joinSession: (data: JoinSessionRequest) => {
    if (DEMO_MODE) {
      if (data.joinCode in demoSessions) {
        const session = demoSessions[data.joinCode]
        return Promise.resolve({
          session,
          message: `Welcome ${data.playerName}! You've joined the demo session.`,
        } as JoinSessionResponse)
      }
      return Promise.reject(new Error('Session not found'))
    }
    return fetchAPI<JoinSessionResponse>('/sessions/join', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
