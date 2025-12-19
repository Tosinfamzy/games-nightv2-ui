export const mockSessionData = {
  id: 'session-1',
  name: 'Friday Game Night',
  location: 'Conference Room A',
  scheduledFor: new Date('2024-12-25T19:00:00Z').toISOString(),
  status: 'IN_PROGRESS' as const,
  gamesMasterId: 'gm-1',
  gamesMasterName: 'John Doe',
  joinCode: 'ABC123',
  createdAt: new Date('2024-12-20T10:00:00Z').toISOString(),
  updatedAt: new Date().toISOString(),
  players: [
    {
      id: 'player-1',
      name: 'Alice',
      sessionId: 'session-1',
      status: 'READY' as const,
      joinedAt: new Date('2024-12-25T18:45:00Z').toISOString(),
      isOnline: true,
      lastConnected: new Date().toISOString(),
    },
    {
      id: 'player-2',
      name: 'Bob',
      sessionId: 'session-1',
      status: 'JOINED' as const,
      joinedAt: new Date('2024-12-25T18:50:00Z').toISOString(),
      isOnline: true,
      lastConnected: new Date().toISOString(),
    },
    {
      id: 'player-3',
      name: 'Charlie',
      sessionId: 'session-1',
      status: 'DISCONNECTED' as const,
      joinedAt: new Date('2024-12-25T18:55:00Z').toISOString(),
      isOnline: false,
      lastConnected: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  games: [
    {
      id: 'game-1',
      name: 'Trivia Challenge',
      sessionId: 'session-1',
      status: 'IN_PROGRESS' as const,
      currentRound: 3,
      maxRounds: 5,
      turnTimeLimit: 60,
      createdAt: new Date('2024-12-25T19:00:00Z').toISOString(),
    },
  ],
}

export const mockActiveSessions = [
  {
    id: 'session-1',
    name: 'Friday Game Night',
    status: 'IN_PROGRESS' as const,
    playerCount: 8,
    scheduledFor: new Date('2024-12-25T19:00:00Z').toISOString(),
  },
  {
    id: 'session-2',
    name: 'Saturday Tournament',
    status: 'SCHEDULED' as const,
    playerCount: 4,
    scheduledFor: new Date('2024-12-26T14:00:00Z').toISOString(),
  },
]

/**
 * Factory function to create a mock session
 */
export function createMockSession(overrides?: Partial<typeof mockSessionData>) {
  return {
    ...mockSessionData,
    ...overrides,
  }
}

/**
 * Factory function to create a mock player
 */
export function createMockPlayer(
  overrides?: Partial<(typeof mockSessionData.players)[0]>,
) {
  return {
    ...mockSessionData.players[0],
    ...overrides,
  }
}
