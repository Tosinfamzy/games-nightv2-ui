import { splitEvenly } from './planning'

const MAX_TEAMS = 8
const MIN_TEAMS = 2

interface TeamsStepProps {
  playerCount: number
  teamCount: number
  minTeamsRequired: number
  onChange: (count: number) => void
}

/**
 * Step 4 — how many teams. Preferred default is 3 (from the suggestion),
 * clamped to what the selected games require. Shows the even split preview so
 * the host can see the team sizes before applying.
 */
export function TeamsStep({
  playerCount,
  teamCount,
  minTeamsRequired,
  onChange,
}: TeamsStepProps) {
  const floor = Math.max(MIN_TEAMS, minTeamsRequired)
  const options = Array.from(
    { length: MAX_TEAMS - floor + 1 },
    (_, i) => floor + i,
  )
  const sizes = splitEvenly(playerCount, teamCount)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Teams</h2>
        <p className="mt-1 text-sm text-gray-600">
          Set how many teams to create. You&apos;ll add people to them on the
          night — this just sets up the teams and the leaderboard.
        </p>
      </div>

      {minTeamsRequired > MIN_TEAMS && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Some of your games need at least {minTeamsRequired} teams.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onChange(count)}
            aria-pressed={count === teamCount}
            className={`h-11 w-14 rounded-lg border text-lg font-bold transition ${
              count === teamCount
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {count}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-700">
          {teamCount} teams for {playerCount}{' '}
          {playerCount === 1 ? 'player' : 'players'}
        </p>
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
        {playerCount > 0 && playerCount < teamCount && (
          <p className="mt-2 text-sm text-amber-700">
            Only {playerCount} players for {teamCount} teams — some would start
            empty.
          </p>
        )}
      </div>
    </div>
  )
}
