interface Player {
  id: string
  name: string
  status: 'ready' | 'not_ready' | 'playing'
  skillLevel?: number
}

interface Team {
  id: string
  name: string
  color?: string
  players: Array<Player>
  balanceScore?: number
  game?: {
    id: string
    name: string
  }
}

interface TeamDisplayProps {
  teams: Array<Team>
  unassignedPlayers: Array<Player>
  /** Host only: show a "Remove" control on each team card. */
  isHost?: boolean
  /** Called when the host taps Remove on a team (parent confirms + dissolves). */
  onRemoveTeam?: (team: { id: string; name: string }) => void
}

/**
 * Roster of teams + unassigned players, shown to everyone (host and players).
 * Read-only for players. For the host it exposes a single safe control —
 * "Remove" — right on each team card (wired by the parent to the host-gated
 * dissolve endpoint, which returns the team's players to the unassigned pool).
 * All other management (create / rebalance / shuffle / reassign) lives in the
 * host-only TeamFormationInterface + EnhancedTeamManagement.
 */
export function TeamDisplay({
  teams,
  unassignedPlayers,
  isHost = false,
  onRemoveTeam,
}: TeamDisplayProps) {
  const getTeamBalance = (team: Team) => {
    if (!team.players?.length)
      return { label: 'No players', color: 'text-gray-600' }

    const totalSkill = team.players.reduce(
      (sum, player) => sum + (player.skillLevel || 0),
      0,
    )
    const avgSkill = totalSkill / team.players.length

    if (avgSkill >= 8) return { label: 'Strong', color: 'text-red-600' }
    if (avgSkill >= 6) return { label: 'Balanced', color: 'text-green-600' }
    if (avgSkill >= 4) return { label: 'Average', color: 'text-yellow-600' }
    return { label: 'Casual', color: 'text-blue-600' }
  }

  const getPlayerStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return '✅'
      case 'playing':
        return '🎮'
      case 'not_ready':
        return '⏳'
      default:
        return '❓'
    }
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
        <p className="text-gray-600 mb-4">
          Create teams to organize players for games
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Teams Grid (read-only) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const balance = getTeamBalance(team)
          return (
            <div
              key={team.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              {/* Team Header */}
              <div
                className="p-4 border-b border-gray-200"
                style={{
                  backgroundColor: team.color ? `${team.color}15` : '#f8fafc',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: team.color || '#6B7280' }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {team.name}
                    </h3>
                  </div>
                  {isHost && onRemoveTeam && (
                    <button
                      onClick={() =>
                        onRemoveTeam({ id: team.id, name: team.name })
                      }
                      className="flex-shrink-0 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-red-600 min-h-[44px] px-2"
                      title="Remove this team — its players return to the unassigned pool"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Team Stats */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      👥 {team.players?.length || 0} players
                    </span>
                    <span className={`font-medium ${balance.color}`}>
                      {balance.label}
                    </span>
                  </div>
                  {team.game && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {team.game.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Players List */}
              <div className="p-4">
                {(team.players?.length || 0) > 0 ? (
                  <div className="space-y-2">
                    {(team.players || []).map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm">
                          {getPlayerStatusIcon(player.status)}
                        </span>
                        <span className="font-medium text-gray-900">
                          {player.name}
                        </span>
                        {player.skillLevel && (
                          <span className="text-xs text-gray-500">
                            ({player.skillLevel}/10)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <div className="text-2xl mb-2">👥</div>
                    <p className="text-sm">No players assigned</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Unassigned Players (read-only) */}
      {unassignedPlayers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Unassigned Players ({unassignedPlayers.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {unassignedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <span className="text-sm">
                  {getPlayerStatusIcon(player.status)}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {player.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
