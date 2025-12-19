import { TeamFormationStrategy } from '../../lib/api/types/team.dto'
import type {
  Team,
  TeamFormationSuggestionsResponse,
  TeamSuggestion,
} from '../../lib/api/services/team.service'
import type { TeamFormationSuggestionsResponse as SuggestionsResponseDto } from '../../lib/api/types/team.dto'

// Mock team data
export const mockTeam: Team = {
  id: 'team-1',
  name: 'Team Alpha',
  color: '#FF5733',
  position: 1,
  isActive: true,
  sessionId: 'session-1',
  gameId: 'game-1',
  players: [],
  scores: [],
  createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
}

export const mockTeams: Team[] = [
  {
    ...mockTeam,
    id: 'team-1',
    name: 'Team Alpha',
    color: '#FF5733',
    position: 1,
  },
  {
    ...mockTeam,
    id: 'team-2',
    name: 'Team Beta',
    color: '#3366FF',
    position: 2,
  },
]

export const mockTeamsWithPlayers: Team[] = [
  {
    ...mockTeam,
    id: 'team-1',
    name: 'Team Alpha',
    players: [
      {
        id: 'player-1',
        name: 'Player 1',
        status: 'ready' as const,
        skillLevel: 5,
      },
      {
        id: 'player-2',
        name: 'Player 2',
        status: 'ready' as const,
        skillLevel: 4,
      },
    ],
  },
  {
    ...mockTeam,
    id: 'team-2',
    name: 'Team Beta',
    players: [
      {
        id: 'player-3',
        name: 'Player 3',
        status: 'ready' as const,
        skillLevel: 5,
      },
      {
        id: 'player-4',
        name: 'Player 4',
        status: 'ready' as const,
        skillLevel: 4,
      },
    ],
  },
]

// Mock suggestions
export const mockSuggestions: SuggestionsResponseDto = {
  suggestions: [
    {
      teamCount: 2,
      strategy: TeamFormationStrategy.BALANCED,
      playersPerTeam: 3,
      remainder: 0,
      pros: ['Even teams', 'Fair distribution', 'Balanced skill levels'],
      cons: [],
    },
    {
      teamCount: 3,
      strategy: TeamFormationStrategy.BALANCED,
      playersPerTeam: 2,
      remainder: 0,
      pros: ['More teams', 'Smaller groups', 'More game variety'],
      cons: ['Harder to manage', 'May need more space'],
    },
    {
      teamCount: 4,
      strategy: TeamFormationStrategy.BALANCED,
      playersPerTeam: 1,
      remainder: 2,
      pros: ['Maximum team count', 'Individual focus'],
      cons: ['Uneven teams', 'Two teams will have extra players'],
    },
  ],
  validation: {
    isValid: true,
    errors: [],
    warnings: [],
  },
}

export const mockSuggestionsWithWarnings: SuggestionsResponseDto = {
  suggestions: [
    {
      teamCount: 2,
      strategy: TeamFormationStrategy.BALANCED,
      playersPerTeam: 2,
      remainder: 1,
      pros: ['Simple distribution'],
      cons: ['One team will have extra player'],
    },
  ],
  validation: {
    isValid: true,
    errors: [],
    warnings: [
      'Uneven player distribution - one team will have an extra player',
    ],
  },
}

export const mockSuggestionsWithErrors: SuggestionsResponseDto = {
  suggestions: [],
  validation: {
    isValid: false,
    errors: ['Not enough players to form teams', 'Minimum 4 players required'],
    warnings: [],
  },
}

// Mock team stats
export const mockTeamStats = {
  totalTeams: 2,
  averagePlayersPerTeam: 3,
  balanceScore: 0.95,
  minPlayers: 3,
  maxPlayers: 3,
  playerDistribution: [
    { teamId: 'team-1', teamName: 'Team Alpha', playerCount: 3 },
    { teamId: 'team-2', teamName: 'Team Beta', playerCount: 3 },
  ],
}

// Default colors for teams
export const DEFAULT_COLORS = [
  '#FF5733',
  '#3366FF',
  '#28A745',
  '#FFC107',
  '#6F42C1',
  '#FD7E14',
  '#20C997',
  '#E83E8C',
]

// Factory functions
export function createMockTeam(overrides?: Partial<Team>): Team {
  return {
    ...mockTeam,
    ...overrides,
    createdAt: overrides?.createdAt || new Date().toISOString(),
    updatedAt: overrides?.updatedAt || new Date().toISOString(),
  }
}

export function createMockTeams(
  count: number,
  overrides?: Partial<Team>,
): Team[] {
  return Array.from({ length: count }).map((_, i) =>
    createMockTeam({
      id: `team-${i + 1}`,
      name: `Team ${String.fromCharCode(65 + i)}`, // Team A, Team B, etc.
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      position: i + 1,
      ...overrides,
    }),
  )
}

export function createMockSuggestions(
  overrides?: Partial<SuggestionsResponseDto>,
): SuggestionsResponseDto {
  return {
    ...mockSuggestions,
    ...overrides,
    suggestions: overrides?.suggestions || mockSuggestions.suggestions,
    validation: overrides?.validation || mockSuggestions.validation,
  }
}

export function createMockSuggestion(
  overrides?: Partial<TeamSuggestion>,
): TeamSuggestion {
  return {
    teamCount: 2,
    strategy: TeamFormationStrategy.BALANCED,
    playersPerTeam: 3,
    remainder: 0,
    pros: ['Even teams'],
    cons: [],
    ...overrides,
  }
}
