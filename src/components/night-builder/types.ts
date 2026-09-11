import type { GameLibraryItem } from '../../lib/api/services/game-library.service'

/** A game the host has added to the plan, with its tuned round count. */
export interface SelectedGame {
  id: string
  rounds: number
}

export type LibraryById = Map<string, GameLibraryItem>
