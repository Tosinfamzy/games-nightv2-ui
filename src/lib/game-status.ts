import { GameStatus } from './api/types'
import type { Game } from './api/types'

/**
 * Single source of truth for game-lifecycle predicates, mirroring the backend
 * state machine so every control component agrees on what's allowed when.
 *
 *   PENDING → start → IN_PROGRESS → start-first-round → ROUND_IN_PROGRESS
 *   → end-round → ROUND_ENDED → next-round → ROUND_IN_PROGRESS → …
 *   → end final round → COMPLETED   (PAUSED / CANCELLED interrupt)
 */

/** Statuses that mean "created but the host hasn't started play yet". */
export const NOT_STARTED_STATUSES: ReadonlyArray<GameStatus> = [
  GameStatus.PENDING,
  GameStatus.READY_TO_START,
  GameStatus.WAITING_FOR_TEAMS,
]

/** Statuses where the game is live (started and not paused/finished). */
export const ACTIVE_STATUSES: ReadonlyArray<GameStatus> = [
  GameStatus.IN_PROGRESS,
  GameStatus.ROUND_IN_PROGRESS,
  GameStatus.ROUND_ENDED,
]

export const TERMINAL_STATUSES: ReadonlyArray<GameStatus> = [
  GameStatus.COMPLETED,
  GameStatus.CANCELLED,
]

export const isNotStarted = (status: GameStatus): boolean =>
  NOT_STARTED_STATUSES.includes(status)

export const isActive = (status: GameStatus): boolean =>
  ACTIVE_STATUSES.includes(status)

export const isTerminal = (status: GameStatus): boolean =>
  TERMINAL_STATUSES.includes(status)

/** A round is actively being played — the only time scores may be entered. */
export const isRoundLive = (status: GameStatus): boolean =>
  status === GameStatus.ROUND_IN_PROGRESS

/** PENDING game can be started (attaches teams, moves to IN_PROGRESS). */
export const canStartGame = (game: Pick<Game, 'status'>): boolean =>
  isNotStarted(game.status)

/** Game started but the first round hasn't begun (IN_PROGRESS, round 1). */
export const canStartFirstRound = (
  game: Pick<Game, 'status' | 'currentRound'>,
): boolean => game.status === GameStatus.IN_PROGRESS && game.currentRound === 1

/** Current round is live and can be ended. */
export const canEndRound = (game: Pick<Game, 'status'>): boolean =>
  game.status === GameStatus.ROUND_IN_PROGRESS

/** Previous round ended and more rounds remain. */
export const canStartNextRound = (
  game: Pick<Game, 'status' | 'currentRound' | 'maxRounds'>,
): boolean =>
  game.status === GameStatus.ROUND_ENDED && game.currentRound < game.maxRounds

/** Ending the current live round would finish the game (it's the last one). */
export const isFinalRound = (
  game: Pick<Game, 'currentRound' | 'maxRounds'>,
): boolean => game.currentRound >= game.maxRounds

export const canPause = (game: Pick<Game, 'status'>): boolean =>
  game.status === GameStatus.IN_PROGRESS ||
  game.status === GameStatus.ROUND_IN_PROGRESS

export const canResume = (game: Pick<Game, 'status'>): boolean =>
  game.status === GameStatus.PAUSED

/** Host may force-complete any time the game is live. */
export const canComplete = (game: Pick<Game, 'status'>): boolean =>
  isActive(game.status)

/** Human-readable status label (e.g. "ROUND_IN_PROGRESS" → "Round In Progress"). */
export const prettyStatus = (status: GameStatus): string =>
  status
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
