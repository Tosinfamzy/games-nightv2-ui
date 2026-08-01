import { useEffect } from 'react'
import { useGameControl } from '../../hooks/useGameControl'
import { useSessionPlayers } from '../../lib/api/hooks/use-session'
import { isRoundLive } from '../../lib/game-status'
import type { UUID } from '../../lib/api/types'

interface TurnControllerProps {
  gameId: UUID
  className?: string
}

interface Entrant {
  id: string
  name: string
  subtitle?: string
}

export default function TurnController({
  gameId,
  className = '',
}: TurnControllerProps) {
  const { game, isLoading, nextTurn, isAdvancingTurn } = useGameControl(gameId)
  // Only used in individual mode; the hook no-ops on an empty session id.
  const { data: players = [] } = useSessionPlayers(game?.sessionId ?? '')

  const isIndividual = game?.scoreMode === 'individual'

  // Competitors in individual mode = active guests (the host runs the night and
  // is excluded), stable-sorted by id to match the backend's rotation order.
  const guestPlayers = players
    .filter((p) => p.isGuest && p.status !== 'disconnected')
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))

  // Keyboard shortcut: press N to advance the turn while a round is live with
  // 2+ entrants — never while typing in a field or mid-advance.
  useEffect(() => {
    if (!game || !isRoundLive(game.status)) return
    const count = isIndividual ? guestPlayers.length : (game.teams?.length ?? 0)
    if (count < 2) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return
      }
      if (isAdvancingTurn) return
      e.preventDefault()
      nextTurn()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [game, isIndividual, guestPlayers.length, isAdvancingTurn, nextTurn])

  if (isLoading) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!game) {
    return null
  }

  const noun = isIndividual ? 'player' : 'team'

  const entrants: Array<Entrant> = isIndividual
    ? guestPlayers.map((p) => ({ id: p.id, name: p.name }))
    : (game.teams ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        subtitle: `${t.playerIds.length} player${
          t.playerIds.length !== 1 ? 's' : ''
        }`,
      }))

  const currentEntrantId = isIndividual
    ? game.currentTurnPlayerId
    : game.currentTurnTeamId

  const isInProgress = isRoundLive(game.status)
  const currentIndex = Math.max(
    0,
    entrants.findIndex((e) => e.id === currentEntrantId),
  )
  const current = entrants[currentIndex]
  const nextIndex =
    entrants.length > 0 ? (currentIndex + 1) % entrants.length : 0
  const nextName = entrants[nextIndex]?.name

  // Turn-based only makes sense with 2+ entrants.
  if (entrants.length <= 1) {
    return null
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Turn Management
        </h3>

        {isInProgress ? (
          <div>
            {/* Current turn */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-1">
                CURRENT TURN
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {current?.name || `No ${noun}`}
                  </div>
                  {current?.subtitle && (
                    <div className="text-sm text-blue-700 mt-1">
                      {current.subtitle}
                    </div>
                  )}
                </div>
                <div className="text-4xl">🎯</div>
              </div>
            </div>

            {/* Next up */}
            {nextName && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">NEXT UP</div>
                <div className="text-lg font-medium text-gray-900">
                  {nextName}
                </div>
              </div>
            )}

            {/* Turn order */}
            <div className="mb-4">
              <div className="text-xs text-gray-600 mb-2">TURN ORDER</div>
              <div className="flex flex-wrap gap-2">
                {entrants.map((e, index) => (
                  <div
                    key={e.id}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      index === currentIndex
                        ? 'bg-blue-500 text-white'
                        : index === nextIndex
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {e.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Next turn button */}
            <button
              onClick={() => nextTurn()}
              disabled={isAdvancingTurn}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isAdvancingTurn
                ? 'Advancing Turn...'
                : `➡️ Next Turn (${nextName})`}
            </button>

            <div className="mt-3 text-center text-xs text-gray-500">
              Tip: Press{' '}
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">
                N
              </kbd>{' '}
              for next turn
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600">
              Turn management available when game is in progress
            </p>
          </div>
        )}
      </div>

      {isInProgress && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {entrants.length}
            </div>
            <div className="text-xs text-gray-600">
              {isIndividual ? 'Players in rotation' : 'Total teams'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
