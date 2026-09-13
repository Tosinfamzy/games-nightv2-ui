import {
  formatLabel,
  formatMinutes,
  scoringLabel,
  segmentMinutes,
  splitEvenly,
} from './planning'
import type { LibraryById, SelectedGame } from './types'

interface ReviewStepProps {
  selected: Array<SelectedGame>
  libraryById: LibraryById
  playerCount: number
  teamCount: number
  warnings: Array<string>
  applying: boolean
  onApply: () => void
}

/**
 * Step 5 — the run-of-show summary. Games in order with rounds, timing and
 * scoring, the team split, and any advisories. Applying pushes it into the
 * session. (FE-PR4 replaces this with the polished run-of-show + cheat sheet.)
 */
export function ReviewStep({
  selected,
  libraryById,
  playerCount,
  teamCount,
  warnings,
  applying,
  onApply,
}: ReviewStepProps) {
  let cumulative = 0
  const rows = selected.map((s) => {
    const lib = libraryById.get(s.id)
    const minutes = segmentMinutes(
      lib?.estimatedDuration,
      s.rounds,
      lib?.recommendedRounds ?? 1,
    )
    const startOffset = cumulative
    cumulative += minutes
    return { selected: s, lib, minutes, startOffset }
  })
  const sizes = splitEvenly(playerCount, teamCount)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Review the night</h2>
        <p className="mt-1 text-sm text-gray-600">
          {selected.length} games · ~{formatMinutes(cumulative)} · {teamCount}{' '}
          teams
        </p>
      </div>

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          {warnings.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      )}

      <ol className="overflow-hidden rounded-xl border border-gray-200">
        {rows.map(({ selected: s, lib, minutes, startOffset }, index) => {
          if (!lib) return null
          return (
            <li
              key={s.id}
              className="flex items-start gap-3 border-b border-gray-100 bg-white p-3 last:border-b-0"
            >
              <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-blue-600">
                +{formatMinutes(startOffset)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900">
                  {index + 1}. {lib.name}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {formatLabel(lib.format)} · {s.rounds}{' '}
                  {s.rounds === 1 ? 'round' : 'rounds'} · ~
                  {formatMinutes(minutes)} ·{' '}
                  {scoringLabel(lib.winnerBonusPoints)}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-700">Teams</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((size, i) => (
            <span
              key={i}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm tabular-nums text-gray-700"
            >
              Team {i + 1}: {size}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onApply}
        disabled={applying || selected.length === 0}
        className="min-h-[48px] w-full rounded-lg bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {applying ? 'Applying…' : 'Apply to session'}
      </button>
    </div>
  )
}
