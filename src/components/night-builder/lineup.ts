import { GameFormat } from '../../lib/api/types/night-plan'
import { segmentMinutes } from './planning'
import type { GameLibraryItem } from '../../lib/api/services/game-library.service'
import type { Game } from '../../lib/api/types'
import type { LibraryById, SelectedGame } from './types'

/**
 * A normalised run-of-show entry — the shape both the builder (from the working
 * selection) and the session view (from applied games) feed to RunOfShow and
 * CheatSheet, so those components don't care where the plan came from.
 */
export interface RunOfShowItem {
  key: string
  name: string
  format: GameFormat
  rounds: number
  minutes: number
  winnerBonusPoints: number | null
  playersPerRound: number | null
  rules: string | null
  equipment: string | null
}

/** Build the run-of-show from the builder's in-progress selection. */
export function lineupFromSelected(
  selected: Array<SelectedGame>,
  libraryById: LibraryById,
): Array<RunOfShowItem> {
  return selected.flatMap((s) => {
    const lib = libraryById.get(s.id)
    if (!lib) return []
    return [fromLibrary(s.id, lib, s.rounds)]
  })
}

/** Build the run-of-show from a session's applied games, in run order. */
export function lineupFromGames(
  games: Array<Game>,
  libraryById: LibraryById,
): Array<RunOfShowItem> {
  return [...games]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .flatMap((game) => {
      const lib = game.gameLibraryId
        ? libraryById.get(game.gameLibraryId)
        : undefined
      if (!lib) return []
      return [
        {
          ...fromLibrary(game.id, lib, game.maxRounds),
          // Prefer the game's own rules snapshot, falling back to the library.
          rules: game.rules ?? lib.rules ?? null,
        },
      ]
    })
}

function fromLibrary(
  key: string,
  lib: GameLibraryItem,
  rounds: number,
): RunOfShowItem {
  return {
    key,
    name: lib.name,
    format: lib.format ?? GameFormat.ALL_TEAMS,
    rounds,
    minutes: segmentMinutes(
      lib.estimatedDuration,
      rounds,
      lib.recommendedRounds,
    ),
    winnerBonusPoints: lib.winnerBonusPoints ?? null,
    playersPerRound: lib.playersPerRound ?? null,
    rules: lib.rules ?? null,
    equipment: lib.equipment ?? null,
  }
}
