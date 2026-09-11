import type { GameLibraryItem } from '../../lib/api/services/game-library.service'

interface PickGamesStepProps {
  library: Array<GameLibraryItem>
  isLoading: boolean
  selectedIds: Array<string>
  playerCount: number
  onToggle: (id: string) => void
}

function playerRange(game: GameLibraryItem): string {
  if (game.minPlayers === game.maxPlayers) return `${game.minPlayers}`
  return `${game.minPlayers}–${game.maxPlayers}`
}

/** Fits the current headcount into the game's supported range. */
function fitLabel(
  game: GameLibraryItem,
  playerCount: number,
): { text: string; className: string } | null {
  if (playerCount <= 0) return null
  if (playerCount < game.minPlayers) {
    return {
      text: `Needs ${game.minPlayers}+`,
      className: 'bg-amber-100 text-amber-700',
    }
  }
  if (playerCount > game.maxPlayers) {
    return {
      text: `Max ${game.maxPlayers}`,
      className: 'bg-amber-100 text-amber-700',
    }
  }
  return { text: 'Good fit', className: 'bg-green-100 text-green-700' }
}

/**
 * Step 2 — pick the games. Multi-select from the shared catalog; each card
 * shows the format, duration and how it fits the current headcount. Selection
 * order becomes the initial run-of-show order (tuned next).
 */
export function PickGamesStep({
  library,
  isLoading,
  selectedIds,
  playerCount,
  onToggle,
}: PickGamesStepProps) {
  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading the games catalog…</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pick your games</h2>
        <p className="mt-1 text-sm text-gray-600">
          Tap to add. You&apos;ll set rounds and order next.{' '}
          <span className="font-medium text-gray-800">
            {selectedIds.length} selected
          </span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {library.map((game) => {
          const selected = selectedIds.includes(game.id)
          const fit = fitLabel(game, playerCount)
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onToggle(game.id)}
              aria-pressed={selected}
              className={`flex flex-col rounded-xl border p-4 text-left transition ${
                selected
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-gray-900">{game.name}</span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                    selected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                <span>👥 {playerRange(game)}</span>
                {game.estimatedDuration ? (
                  <span>⏱️ ~{game.estimatedDuration}m</span>
                ) : null}
                {fit && (
                  <span className={`rounded-full px-2 py-0.5 ${fit.className}`}>
                    {fit.text}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
