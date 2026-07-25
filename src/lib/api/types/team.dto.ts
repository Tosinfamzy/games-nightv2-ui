export interface TeamResponseDto {
  id: string
  name: string
  color?: string | null
  position: number
  isActive: boolean
  sessionId: string | null
  gameId: string | null
  playerIds: Array<string>
  scoreIds: Array<string>
  createdAt: string
  updatedAt: string
}

export enum TeamFormationStrategy {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  BALANCED = 'balanced',
  RANDOM = 'random',
}

export interface CreateTeamsDto {
  strategy: TeamFormationStrategy
  teamCount: number
  teamNames?: Array<string>
  teamColors?: Array<string>
}

export interface RebalanceTeamsDto {
  strategy: TeamFormationStrategy
}

export interface TeamSuggestion {
  teamCount: number
  strategy: TeamFormationStrategy
  playersPerTeam: number
  remainder: number
  pros: Array<string>
  cons: Array<string>
}

export interface TeamFormationSuggestionsResponse {
  suggestions: Array<TeamSuggestion>
  validation: {
    isValid: boolean
    errors: Array<string>
    warnings: Array<string>
  }
}
