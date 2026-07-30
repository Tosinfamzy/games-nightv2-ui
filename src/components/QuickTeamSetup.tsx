import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamService } from '../lib/api/services/team.service'
import { TeamFormationStrategy } from '../lib/api/types/team.dto'
import { toastHelpers } from '../lib/toast'

interface QuickTeamSetupProps {
  sessionId: string
  /** The game teams are formed against (the active/first session game). */
  gameId: string | undefined
  playerCount: number
  onCreated: () => void
}

/**
 * One-tap team setup shown at the top of the Teams tab before any teams exist.
 * Splitting a couple of players into two teams was buried under the advanced
 * formation interface (pick a game, pick a strategy, hit create). This gives the
 * common case a single obvious button — balanced teams, using the active game —
 * while the full interface stays below for fine-tuning.
 */
export function QuickTeamSetup({
  sessionId,
  gameId,
  playerCount,
  onCreated,
}: QuickTeamSetupProps) {
  const queryClient = useQueryClient()

  const createTeams = useMutation({
    mutationFn: (teamCount: number) => {
      if (!gameId) {
        throw new Error('Add a game before creating teams')
      }
      return teamService.createTeams(gameId, {
        strategy: TeamFormationStrategy.BALANCED,
        teamCount,
      })
    },
    onSuccess: (teams) => {
      queryClient.invalidateQueries({
        queryKey: ['sessions', 'detail', sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['session-readiness', sessionId],
      })
      toastHelpers.withCount('Created', teams.length, 'team')
      onCreated()
    },
    onError: (error) => toastHelpers.operationError('create teams', error),
  })

  // Offer 2–4 teams, but never more teams than players (each team needs ≥1).
  const teamOptions = [2, 3, 4].filter((n) => playerCount >= n)

  if (!gameId) {
    return (
      <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 p-6 text-center">
        <div className="text-3xl mb-2">🎲</div>
        <h3 className="text-lg font-semibold text-indigo-900">
          Add a game to get started
        </h3>
        <p className="text-sm text-indigo-700 mt-1">
          Head to the <span className="font-medium">Games</span> tab and add a
          game, then split into teams here in one tap.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
      <div className="flex items-start gap-3">
        <div className="text-3xl leading-none">⚡</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Ready to play? Split into teams
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {playerCount === 2
              ? 'You have 2 players — go head-to-head with a tap.'
              : `Split your ${playerCount} players into balanced teams with one tap.`}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {teamOptions.map((n, i) => (
              <button
                key={n}
                onClick={() => createTeams.mutate(n)}
                disabled={createTeams.isPending}
                className={`rounded-lg font-medium px-4 py-2.5 min-h-[44px] disabled:opacity-50 transition-colors ${
                  i === 0
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                {createTeams.isPending && createTeams.variables === n
                  ? 'Creating…'
                  : n === 2
                    ? 'Split into 2 teams'
                    : `${n} teams`}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            You can rename, shuffle, or fine-tune teams below afterwards.
          </p>
        </div>
      </div>
    </div>
  )
}
