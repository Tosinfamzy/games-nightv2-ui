/**
 * Night Builder types — mirror the backend NightPlanner DTOs
 * (see games-night-v2/src/night-planner).
 */

export enum GameFormat {
  FREE_FOR_ALL = 'free_for_all',
  ALL_TEAMS = 'all_teams',
  ROUND_ROBIN = 'round_robin',
  TRIO = 'trio',
}

export interface PlanGameSuggestion {
  gameLibraryId: string
  name: string
  format: GameFormat
  formatLabel: string
  recommendedRounds: number
  playersPerRound: number | null
  minTeams: number | null
  estimatedDuration: number
  segmentMinutes: number
  scoringLabel: string
}

export interface PlanTeamSuggestion {
  teamCount: number
  sizes: Array<number>
}

export interface PlanTimelineItem {
  gameLibraryId: string
  name: string
  startOffsetMinutes: number
  minutes: number
}

export interface PlanTimeline {
  items: Array<PlanTimelineItem>
  totalMinutes: number
}

export interface NightPlanSuggestion {
  playerCount: number
  teamSuggestion: PlanTeamSuggestion
  games: Array<PlanGameSuggestion>
  timeline: PlanTimeline
  warnings: Array<string>
}

/** Score mode for a planned game (mirrors backend ScoreMode). */
export type PlanScoreMode = 'team' | 'individual'

export interface ApplyPlanGame {
  gameLibraryId: string
  maxRounds: number
  scoreMode?: PlanScoreMode
  orderIndex: number
}

export interface ApplyPlanTeams {
  count: number
  names?: Array<string>
  colors?: Array<string>
}

export interface ApplyNightPlan {
  games: Array<ApplyPlanGame>
  teams: ApplyPlanTeams
}
