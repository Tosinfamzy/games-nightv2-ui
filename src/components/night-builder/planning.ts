import { GameFormat } from '../../lib/api/types/night-plan'

/**
 * Client-side planning helpers — mirror the backend NightPlanner util so the
 * timeline and team split update live as the host tunes, without a round-trip
 * per keystroke. The backend remains the source of truth on apply.
 */

const FALLBACK_GAME_MINUTES = 10

/** Placement points per finishing position (mirrors the backend default). */
const PLACEMENT_POINTS = [3, 2, 1] as const

/** Scoring rule for a game (winner bonus overrides placement points). */
export function scoringLabel(winnerBonusPoints?: number | null): string {
  if (winnerBonusPoints != null) return `Winner scores ${winnerBonusPoints} pts`
  const [first, second, third] = PLACEMENT_POINTS
  return `Placement — 1st ${first}, 2nd ${second}, 3rd ${third}`
}

/** How a game format reads in the UI (mirrors the backend formatLabel). */
export function formatLabel(format: GameFormat): string {
  switch (format) {
    case GameFormat.FREE_FOR_ALL:
      return 'Everyone plays'
    case GameFormat.ROUND_ROBIN:
      return '2 teams, round-robin'
    case GameFormat.TRIO:
      return 'Trios (one per team)'
    case GameFormat.ALL_TEAMS:
    default:
      return 'All teams at once'
  }
}

/** Split `total` players across `groups` teams evenly; larger teams first. */
export function splitEvenly(total: number, groups: number): Array<number> {
  if (groups <= 0 || total < 0) return []
  const base = Math.floor(total / groups)
  const remainder = total % groups
  return Array.from({ length: groups }, (_, i) =>
    i < remainder ? base + 1 : base,
  )
}

/** Minutes a game takes for a round count, scaled from its recommended rounds. */
export function segmentMinutes(
  estimatedDuration: number | null | undefined,
  rounds: number,
  recommendedRounds: number,
): number {
  const base = estimatedDuration ?? FALLBACK_GAME_MINUTES
  if (!recommendedRounds || recommendedRounds < 1) return base
  return Math.max(1, Math.round(base * (rounds / recommendedRounds)))
}

/** Human duration, e.g. 135 → "2h 15m", 45 → "45m". */
export function formatMinutes(total: number): string {
  if (total <= 0) return '0m'
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
