import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { gameLibraryService } from '../../lib/api/services/game-library.service'
import { useSessionGames } from '../../lib/api/hooks/use-session'
import { lineupFromGames } from './lineup'
import { RunOfShow } from './RunOfShow'
import { CheatSheet } from './CheatSheet'

interface SessionRunOfShowProps {
  sessionId: string
  /** Session date, to show real clock times on the timeline. */
  startAt?: Date | null
  /** Whether the plan can still be edited (SCHEDULED sessions only). */
  canEdit: boolean
}

/**
 * The applied night, shown on the session page: the run-of-show timeline plus
 * the caller cheat sheet, built from the session's games (in order) joined to
 * the library. Renders nothing until a plan has been applied.
 */
export function SessionRunOfShow({
  sessionId,
  startAt,
  canEdit,
}: SessionRunOfShowProps) {
  const { data: games = [] } = useSessionGames(sessionId)
  const { data: library = [] } = useQuery({
    queryKey: ['game-library'],
    queryFn: gameLibraryService.getAll,
  })
  const libraryById = useMemo(
    () => new Map(library.map((g) => [g.id, g])),
    [library],
  )
  const items = useMemo(
    () => lineupFromGames(games, libraryById),
    [games, libraryById],
  )

  if (items.length === 0) return null

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Run of show</h3>
          <p className="text-sm text-gray-500">
            Tonight&apos;s line-up and the caller&apos;s cheat sheet.
          </p>
        </div>
        {canEdit && (
          <Link
            to="/sessions/$id/builder"
            params={{ id: sessionId }}
            className="shrink-0 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Edit plan
          </Link>
        )}
      </div>

      <RunOfShow items={items} startAt={startAt} />

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Caller cheat sheet
        </summary>
        <div className="mt-3">
          <CheatSheet items={items} />
        </div>
      </details>
    </section>
  )
}
