import { useState } from 'react'
import { formatMinutes, splitEvenly } from './planning'
import { lineupFromSelected } from './lineup'
import { RunOfShow } from './RunOfShow'
import { CheatSheet } from './CheatSheet'
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
 * Step 5 — the run-of-show summary with an optional caller cheat sheet. Applying
 * pushes the plan into the session.
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
  const [showCheatSheet, setShowCheatSheet] = useState(false)
  const items = lineupFromSelected(selected, libraryById)
  const totalMinutes = items.reduce((sum, i) => sum + i.minutes, 0)
  const sizes = splitEvenly(playerCount, teamCount)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Review the night</h2>
        <p className="mt-1 text-sm text-gray-600">
          {items.length} games · ~{formatMinutes(totalMinutes)} · {teamCount}{' '}
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

      <RunOfShow items={items} />

      <div>
        <button
          type="button"
          onClick={() => setShowCheatSheet((v) => !v)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          {showCheatSheet ? 'Hide' : 'Show'} caller cheat sheet
        </button>
        {showCheatSheet && (
          <div className="mt-3">
            <CheatSheet items={items} />
          </div>
        )}
      </div>

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
