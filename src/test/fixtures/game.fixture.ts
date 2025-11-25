export const mockGameData = {
  id: 'game-1',
  name: 'Trivia Challenge',
  sessionId: 'session-1',
  status: 'IN_PROGRESS' as const,
  currentRound: 3,
  maxRounds: 5,
  turnTimeLimit: 60,
  currentTurn: 'team-1',
  currentTurnStartedAt: new Date().toISOString(),
  createdAt: new Date('2024-12-25T19:00:00Z').toISOString(),
  updatedAt: new Date().toISOString(),
  teams: [
    {
      id: 'team-1',
      name: 'Team Alpha',
      gameId: 'game-1',
      players: [
        { id: 'player-1', name: 'Alice' },
        { id: 'player-2', name: 'Bob' },
      ],
      currentScore: 150,
      createdAt: new Date('2024-12-25T19:00:00Z').toISOString(),
    },
    {
      id: 'team-2',
      name: 'Team Beta',
      gameId: 'game-1',
      players: [
        { id: 'player-3', name: 'Charlie' },
        { id: 'player-4', name: 'David' },
      ],
      currentScore: 120,
      createdAt: new Date('2024-12-25T19:00:00Z').toISOString(),
    },
  ],
  winnerId: undefined,
};

export const mockCompletedGame = {
  ...mockGameData,
  id: 'game-2',
  status: 'COMPLETED' as const,
  currentRound: 5,
  winnerId: 'team-1',
};

export const mockGameWithTimer = {
  ...mockGameData,
  turnTimeLimit: 60,
  currentTurnStartedAt: new Date().toISOString(),
  timeRemaining: 45,
};

/**
 * Factory function to create a mock game
 */
export function createMockGame(overrides?: Partial<typeof mockGameData>) {
  return {
    ...mockGameData,
    ...overrides,
  };
}

/**
 * Factory function to create a mock team
 */
export function createMockTeam(
  overrides?: Partial<typeof mockGameData.teams[0]>
) {
  return {
    ...mockGameData.teams[0],
    ...overrides,
  };
}

/**
 * Creates a game in various states for testing
 */
export const gameFixtures = {
  notStarted: createMockGame({
    status: 'PENDING' as any,
    currentRound: 0,
    currentTurn: undefined,
  }),
  inProgress: mockGameData,
  paused: createMockGame({
    status: 'PAUSED' as any,
  }),
  completed: mockCompletedGame,
  withTimer: mockGameWithTimer,
  noTimer: createMockGame({
    turnTimeLimit: 0,
    currentTurnStartedAt: undefined,
  }),
};
