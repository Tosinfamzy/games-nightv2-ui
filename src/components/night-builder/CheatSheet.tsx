import { formatLabel, scoringLabel } from './planning'
import type { RunOfShowItem } from './lineup'

interface CheatSheetProps {
  items: Array<RunOfShowItem>
}

/**
 * The caller's cheat sheet — one expandable card per game with everything the
 * MC needs on the night: how it's run, rounds, who plays, scoring, kit, and the
 * full rules. Shared by the builder review and the session's Run of Show view.
 */
export function CheatSheet({ items }: CheatSheetProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <details
          key={item.key}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <summary className="flex cursor-pointer items-center gap-2 p-3 font-medium text-gray-900 hover:bg-gray-50">
            <span className="text-gray-400">{index + 1}.</span>
            <span className="flex-1">{item.name}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-600">
              {formatLabel(item.format)}
            </span>
          </summary>

          <div className="space-y-3 border-t border-gray-100 p-3 text-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
              <span>
                🔁 {item.rounds} {item.rounds === 1 ? 'round' : 'rounds'}
              </span>
              {item.playersPerRound != null && (
                <span>👥 {item.playersPerRound} at a time</span>
              )}
              <span>🏆 {scoringLabel(item.winnerBonusPoints)}</span>
            </div>

            {item.equipment && (
              <p className="text-gray-600">
                <span className="font-medium text-gray-800">Needs:</span>{' '}
                {item.equipment}
              </p>
            )}

            {item.rules && (
              <p className="whitespace-pre-wrap text-gray-700">{item.rules}</p>
            )}
          </div>
        </details>
      ))}
    </div>
  )
}
