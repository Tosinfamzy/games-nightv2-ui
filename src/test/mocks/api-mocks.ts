import { http, HttpResponse } from 'msw';
import { mockDashboardData } from '../fixtures/dashboard.fixture';
import { mockSessionData, mockActiveSessions } from '../fixtures/session.fixture';
import { mockGameData } from '../fixtures/game.fixture';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    ]);
  }),

  http.get(`${API_BASE_URL}/games-master/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
  }),

  http.get(`${API_BASE_URL}/games-master/:id/dashboard`, ({ params }) => {
    return HttpResponse.json({
      ...mockDashboardData,
      gamesMasterId: params.id,
    });
  }),

  http.post(`${API_BASE_URL}/games-master`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json(
      {
        id: `gm-${Date.now()}`,
        name: body.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Session endpoints
  http.get(`${API_BASE_URL}/sessions/:id`, ({ params }) => {
    return HttpResponse.json({
      ...mockSessionData,
      id: params.id,
    });
  }),

  http.get(`${API_BASE_URL}/games-master/:gmId/active-sessions`, () => {
    return HttpResponse.json(mockActiveSessions);
  }),

  // Game endpoints
  http.get(`${API_BASE_URL}/games/:id`, ({ params }) => {
    return HttpResponse.json({
      ...mockGameData,
      id: params.id,
    });
  }),

  http.get(`${API_BASE_URL}/sessions/:sessionId/games`, ({ params }) => {
    return HttpResponse.json([
      {
        ...mockGameData,
        sessionId: params.sessionId,
      },
    ]);
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
    });
  }),

  http.post(`${API_BASE_URL}/chat/:sessionId`, async ({ params, request }) => {
    const body = (await request.json()) as { message: string };
    return HttpResponse.json(
      {
        id: `msg-${Date.now()}`,
        sessionId: params.sessionId,
        playerId: 'current-player',
        playerName: 'Current Player',
        message: body.message,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),
];

/**
 * Error response handlers for testing error states
 */
export const errorHandlers = {
  dashboardError: http.get(
    `${API_BASE_URL}/games-master/:id/dashboard`,
    () => {
      return HttpResponse.json(
        { message: 'Failed to fetch dashboard data' },
        { status: 500 }
      );
    }
  ),

  sessionNotFound: http.get(`${API_BASE_URL}/sessions/:id`, () => {
    return HttpResponse.json(
      { message: 'Session not found' },
      { status: 404 }
    );
  }),

  gameNotFound: http.get(`${API_BASE_URL}/games/:id`, () => {
    return HttpResponse.json({ message: 'Game not found' }, { status: 404 });
  }),

  unauthorized: http.get(`${API_BASE_URL}/games-master/:id/dashboard`, () => {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),
};
