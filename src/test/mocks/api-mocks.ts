import { HttpResponse, http } from 'msw'
import { mockDashboardData } from '../fixtures/dashboard.fixture'
import {
  mockActiveSessions,
  mockSessionData,
} from '../fixtures/session.fixture'
import { mockGameData } from '../fixtures/game.fixture'
import {
  DEFAULT_COLORS,
  mockSuggestions,
  mockTeamStats,
  mockTeams,
} from '../fixtures/team.fixture'
import type { CreateTeamsDto } from '../../lib/api/types/team.dto'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * MSW HTTP handlers for API mocking
 */
export const handlers = [
  // Games Master endpoints
  http.get(`${API_BASE_URL}/games-master`, () => {
    return HttpResponse.json([
      {
        id: 'gm-1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'gm-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ])
  }),

  http.get(`${API_BASE_URL}/games-master/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })
  }),

  http.get(`${API_BASE_URL}/games-master/:id/dashboard`, ({ params }) => {
    return HttpResponse.json({
      ...mockDashboardData,
      gamesMasterId: params.id,
    })
  }),

  http.post(`${API_BASE_URL}/games-master`, async ({ request }) => {
    const body = (await request.json()) as { name: string }
    return HttpResponse.json(
      {
        id: `gm-${Date.now()}`,
        name: body.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 },
    )
  }),

  // Session endpoints
  http.get(`${API_BASE_URL}/sessions/:id`, ({ params }) => {
    return HttpResponse.json({
      ...mockSessionData,
      id: params.id,
    })
  }),

  http.get(`${API_BASE_URL}/games-master/:gmId/active-sessions`, () => {
    return HttpResponse.json(mockActiveSessions)
  }),

  // Game endpoints
  http.get(`${API_BASE_URL}/games/:id`, ({ params }) => {
    return HttpResponse.json({
      ...mockGameData,
      id: params.id,
    })
  }),

  http.get(`${API_BASE_URL}/sessions/:sessionId/games`, ({ params }) => {
    return HttpResponse.json([
      {
        ...mockGameData,
        sessionId: params.sessionId,
      },
    ])
  }),

  // Chat endpoints
  http.get(`${API_BASE_URL}/chat/:sessionId/history`, ({ params }) => {
    return HttpResponse.json({
      messages: [
        {
          id: 'msg-1',
          sessionId: params.sessionId,
          playerId: 'player-1',
          playerName: 'Alice',
          message: 'Hello everyone!',
          timestamp: new Date().toISOString(),
        },
      ],
      hasMore: false,
      nextCursor: null,
    })
  }),

  http.post(`${API_BASE_URL}/chat/:sessionId`, async ({ params, request }) => {
    const body = (await request.json()) as { message: string }
    return HttpResponse.json(
      {
        id: `msg-${Date.now()}`,
        sessionId: params.sessionId,
        playerId: 'current-player',
        playerName: 'Current Player',
        message: body.message,
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    )
  }),

  // Team formation endpoints
  http.post(
    `${API_BASE_URL}/v1/teams/game/:gameId/create-teams`,
    async ({ params, request }) => {
      const gameId = params.gameId as string
      const body = (await request.json()) as CreateTeamsDto

      // Simulate creating teams based on request
      const teams = Array.from({ length: body.teamCount }).map((_, i) => ({
        id: `team-${i + 1}`,
        name: body.teamNames?.[i] || `Team ${i + 1}`,
        color:
          body.teamColors?.[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        position: i + 1,
        isActive: true,
        sessionId: null,
        gameId,
        players: [],
        scores: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      return HttpResponse.json(teams, { status: 201 })
    },
  ),

  http.put(
    `${API_BASE_URL}/v1/teams/game/:gameId/rebalance`,
    async ({ params }) => {
      const gameId = params.gameId as string
      // Return mock teams with the gameId
      const rebalancedTeams = mockTeams.map((team) => ({
        ...team,
        gameId,
        updatedAt: new Date().toISOString(),
      }))
      return HttpResponse.json(rebalancedTeams)
    },
  ),

  http.get(`${API_BASE_URL}/v1/teams/game/:gameId/suggestions`, () => {
    return HttpResponse.json(mockSuggestions)
  }),

  http.get(`${API_BASE_URL}/v1/teams/game/:gameId/stats`, () => {
    return HttpResponse.json(mockTeamStats)
  }),
]

/**
 * Error response handlers for testing error states
 */
export const errorHandlers = {
  dashboardError: http.get(`${API_BASE_URL}/games-master/:id/dashboard`, () => {
    return HttpResponse.json(
      { message: 'Failed to fetch dashboard data' },
      { status: 500 },
    )
  }),

  sessionNotFound: http.get(`${API_BASE_URL}/sessions/:id`, () => {
    return HttpResponse.json({ message: 'Session not found' }, { status: 404 })
  }),

  gameNotFound: http.get(`${API_BASE_URL}/games/:id`, () => {
    return HttpResponse.json({ message: 'Game not found' }, { status: 404 })
  }),

  unauthorized: http.get(`${API_BASE_URL}/games-master/:id/dashboard`, () => {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }),

  teamCreationError: http.post(
    `${API_BASE_URL}/v1/teams/game/:gameId/create-teams`,
    () => {
      return HttpResponse.json(
        { message: 'Failed to create teams' },
        { status: 500 },
      )
    },
  ),

  teamSuggestionsNotFound: http.get(
    `${API_BASE_URL}/v1/teams/game/:gameId/suggestions`,
    () => {
      return HttpResponse.json({ message: 'Game not found' }, { status: 404 })
    },
  ),
}
