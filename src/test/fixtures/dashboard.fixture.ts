import type {
  GMDashboard,
  DashboardSession,
  DashboardGame,
  DashboardPlayer,
} from '../../lib/api/types'

export const mockDashboardPlayers: DashboardPlayer[] = [
  {
    id: 'player-1',
    name: 'Alice',
    isOnline: true,
  },
  {
    id: 'player-2',
    name: 'Bob',
    isOnline: true,
  },
  {
    id: 'player-3',
    name: 'Charlie',
    isOnline: false,
  },
]

export const mockDashboardGames: DashboardGame[] = [
  {
    id: 'game-1',
    name: 'Trivia Challenge',
    status: 'IN_PROGRESS',
    currentRound: 3,
    maxRounds: 5,
    teamsCount: 3,
    currentTurnTeamName: 'Team Alpha',
    turnTimeLimit: 60,
    winnerId: undefined,
    createdAt: new Date('2024-12-25T19:00:00Z').toISOString(),
  },
  {
    id: 'game-2',
    name: 'Word Games',
    status: 'COMPLETED',
    currentRound: 5,
    maxRounds: 5,
    teamsCount: 2,
    currentTurnTeamName: undefined,
    turnTimeLimit: 0,
    winnerId: 'team-1',
    createdAt: new Date('2024-12-25T19:00:00Z').toISOString(),
  },
]

export const mockDashboardSessions: DashboardSession[] = [
  {
    id: 'session-1',
    name: 'Friday Game Night',
    location: 'Conference Room A',
    scheduledFor: new Date('2024-12-25T19:00:00Z').toISOString(),
    status: 'IN_PROGRESS',
    players: mockDashboardPlayers,
    games: mockDashboardGames,
    gamesInProgress: 1,
    gamesCompleted: 1,
    playersCount: 3,
  },
  {
    id: 'session-2',
    name: 'Weekend Tournament',
    location: 'Main Hall',
    scheduledFor: new Date('2024-12-26T14:00:00Z').toISOString(),
    status: 'SCHEDULED',
    players: [
      {
        id: 'player-4',
        name: 'David',
        isOnline: false,
      },
    ],
    games: [],
    gamesInProgress: 0,
    gamesCompleted: 0,
    playersCount: 1,
  },
]

export const mockDashboardData: GMDashboard = {
  gamesMasterId: 'gm-1',
  gamesMasterName: 'John Doe',
  stats: {
    totalSessions: 5,
    activeSessions: 1,
    totalPlayers: 12,
    onlinePlayers: 8,
    totalGames: 10,
    gamesInProgress: 1,
    gamesCompleted: 7,
  },
  sessions: mockDashboardSessions,
  lastUpdated: new Date().toISOString(),
}

/**
 * Factory function to create a mock dashboard with custom data
 */
export function createMockDashboard(
  overrides?: Partial<GMDashboard>,
): GMDashboard {
  return {
    ...mockDashboardData,
    ...overrides,
  }
}

/**
 * Factory function to create a mock dashboard session
 */
export function createMockDashboardSession(
  overrides?: Partial<DashboardSession>,
): DashboardSession {
  return {
    ...mockDashboardSessions[0],
    ...overrides,
  }
}

/**
 * Factory function to create a mock dashboard game
 */
export function createMockDashboardGame(
  overrides?: Partial<DashboardGame>,
): DashboardGame {
  return {
    ...mockDashboardGames[0],
    ...overrides,
  }
}

/**
 * Factory function to create a mock dashboard player
 */
export function createMockDashboardPlayer(
  overrides?: Partial<DashboardPlayer>,
): DashboardPlayer {
  return {
    ...mockDashboardPlayers[0],
    ...overrides,
  }
}

/**
 * Empty dashboard for testing no data states
 */
export const emptyDashboardData: GMDashboard = {
  gamesMasterId: 'gm-empty',
  gamesMasterName: 'Empty GM',
  stats: {
    totalSessions: 0,
    activeSessions: 0,
    totalPlayers: 0,
    onlinePlayers: 0,
    totalGames: 0,
    gamesInProgress: 0,
    gamesCompleted: 0,
  },
  sessions: [],
  lastUpdated: new Date().toISOString(),
}
