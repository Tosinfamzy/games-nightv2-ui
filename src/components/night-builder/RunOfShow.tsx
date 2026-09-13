import { formatLabel, formatMinutes, scoringLabel } from './planning'
import type { RunOfShowItem } from './lineup'

interface RunOfShowProps {
  items: Array<RunOfShowItem>
  /** Optional wall-clock start (e.g. the session date) to show real times. */
  startAt?: Date | null
}

function clockAt(start: Date, offsetMinutes: number): string {
  const d = new Date(start.getTime() + offsetMinutes * 60_000)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * The night's timeline — games end-to-end with cumulative offsets (and real
 * clock times when a start is given). Shared by the builder review and the
 * session's Run of Show view.
 */
export function RunOfShow({ items, startAt }: RunOfShowProps) {
  if (items.length === 0) return null

  let cumulative = 0
  const rows = items.map((item) => {
    const startOffset = cumulative
    cumulative += item.minutes
    return { item, startOffset }
  })

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-700">
          {items.length} {items.length === 1 ? 'game' : 'games'}
        </span>
        <span className="text-sm font-medium text-gray-700">
          ~{formatMinutes(cumulative)} total
        </span>
      </div>

      <ol className="overflow-hidden rounded-xl border border-gray-200">
        {rows.map(({ item, startOffset }, index) => (
          <li
            key={item.key}
            className="flex items-start gap-3 border-b border-gray-100 bg-white p-3 last:border-b-0"
          >
            <span className="w-14 shrink-0 text-sm font-semibold tabular-nums text-blue-600">
              {startAt
                ? clockAt(startAt, startOffset)
                : `+${formatMinutes(startOffset)}`}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900">
                <span className="mr-1 text-gray-400">{index + 1}.</span>
                {item.name}
              </div>
              <div className="mt-0.5 text-xs text-gray-500">
                {formatLabel(item.format)} · {item.rounds}{' '}
                {item.rounds === 1 ? 'round' : 'rounds'} · ~
                {formatMinutes(item.minutes)}
              </div>
            </div>
            <span className="shrink-0 text-right text-xs text-gray-500">
              {scoringLabel(item.winnerBonusPoints)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
