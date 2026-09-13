import { describe, expect, it } from 'vitest'
import { GameFormat } from '../../lib/api/types/night-plan'
import { lineupFromGames, lineupFromSelected } from './lineup'
import type { GameLibraryItem } from '../../lib/api/services/game-library.service'
import type { Game } from '../../lib/api/types'

const lib = (
  id: string,
  over: Partial<GameLibraryItem> = {},
): GameLibraryItem =>
  ({
    id,
    name: `Game ${id}`,
    description: '',
    minPlayers: 2,
    maxPlayers: 30,
    estimatedDuration: 15,
    difficulty: 'Easy',
    categories: [],
    isActive: true,
    createdAt: '',
    updatedAt: '',
    format: GameFormat.ALL_TEAMS,
    recommendedRounds: 3,
    ...over,
  }) as GameLibraryItem

const libraryById = new Map([
  ['a', lib('a', { name: 'Alpha', winnerBonusPoints: 5 })],
  ['b', lib('b', { name: 'Bravo', estimatedDuration: 10 })],
])

describe('lineupFromSelected', () => {
  it('builds items with tuned rounds and scaled minutes, preserving order', () => {
    const items = lineupFromSelected(
      [
        { id: 'b', rounds: 3 },
        { id: 'a', rounds: 6 },
      ],
      libraryById,
    )
    expect(items.map((i) => i.name)).toEqual(['Bravo', 'Alpha'])
    expect(items[0].minutes).toBe(10) // 10 * 3/3
    expect(items[1].minutes).toBe(30) // 15 * 6/3
    expect(items[1].winnerBonusPoints).toBe(5)
  })

  it('skips selections with no matching library entry', () => {
    const items = lineupFromSelected(
      [{ id: 'missing', rounds: 1 }],
      libraryById,
    )
    expect(items).toEqual([])
  })
})

describe('lineupFromGames', () => {
  const game = (over: Partial<Game>): Game =>
    ({
      id: over.id ?? 'g',
      name: 'x',
      description: '',
      status: 'PENDING',
      currentRound: 0,
      maxRounds: 1,
      orderIndex: 0,
      gameLibraryId: 'a',
      minPlayers: 2,
      maxPlayers: 30,
      scores: [],
      teams: [],
      sessionId: 's',
      ...over,
    }) as unknown as Game

  it('sorts by orderIndex and uses each game’s own round count', () => {
    const items = lineupFromGames(
      [
        game({ id: 'g2', gameLibraryId: 'b', orderIndex: 1, maxRounds: 2 }),
        game({ id: 'g1', gameLibraryId: 'a', orderIndex: 0, maxRounds: 6 }),
      ],
      libraryById,
    )
    expect(items.map((i) => i.name)).toEqual(['Alpha', 'Bravo'])
    expect(items[0].rounds).toBe(6)
    expect(items[1].rounds).toBe(2)
  })

  it('prefers the game’s own rules snapshot over the library', () => {
    const items = lineupFromGames(
      [game({ gameLibraryId: 'a', rules: 'game-specific rules' })],
      libraryById,
    )
    expect(items[0].rules).toBe('game-specific rules')
  })

  it('skips games with no library link', () => {
    const items = lineupFromGames([game({ gameLibraryId: null })], libraryById)
    expect(items).toEqual([])
  })
})
