import { formatLabel, formatMinutes, segmentMinutes } from './planning'
import type { LibraryById, SelectedGame } from './types'

interface TuneStepProps {
  selected: Array<SelectedGame>
  libraryById: LibraryById
  onRounds: (id: string, rounds: number) => void
  onMove: (index: number, direction: -1 | 1) => void
}

/**
 * Step 3 — set rounds and the run order. Each game's minutes scale with its
 * rounds, and the running total updates live so the host can see the night's
 * length take shape.
 */
export function TuneStep({
  selected,
  libraryById,
  onRounds,
  onMove,
}: TuneStepProps) {
  const total = selected.reduce((sum, s) => {
    const lib = libraryById.get(s.id)
    return (
      sum +
      segmentMinutes(
        lib?.estimatedDuration,
        s.rounds,
        lib?.recommendedRounds ?? 1,
      )
    )
  }, 0)

  if (selected.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No games selected yet — go back and pick a few.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Rounds &amp; order
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Reorder the night and set how many rounds each game runs.
          </p>
        </div>
        <span className="shrink-0 text-sm font-medium text-gray-700">
          ~{formatMinutes(total)} total
        </span>
      </div>

      <ol className="space-y-2">
        {selected.map((s, index) => {
          const lib = libraryById.get(s.id)
          if (!lib) return null
          const minutes = segmentMinutes(
            lib.estimatedDuration,
            s.rounds,
            lib.recommendedRounds ?? 1,
          )
          return (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  aria-label={`Move ${lib.name} up`}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 1)}
                  disabled={index === selected.length - 1}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  aria-label={`Move ${lib.name} down`}
                >
                  ▼
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-gray-900">
                  <span className="mr-1 text-gray-400">{index + 1}.</span>
                  {lib.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatLabel(lib.format)} · ~{formatMinutes(minutes)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRounds(s.id, s.rounds - 1)}
                  disabled={s.rounds <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-30"
                  aria-label={`Fewer rounds for ${lib.name}`}
                >
                  −
                </button>
                <span className="w-16 text-center text-sm tabular-nums text-gray-700">
                  {s.rounds} {s.rounds === 1 ? 'round' : 'rounds'}
                </span>
                <button
                  type="button"
                  onClick={() => onRounds(s.id, s.rounds + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                  aria-label={`More rounds for ${lib.name}`}
                >
                  +
                </button>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
