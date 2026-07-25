import type { Player as BasePlayer } from '../lib/api/services/player.service'
import type { Team as BaseTeam } from '../lib/api/services/team.service'

// Extended types with optional skill level for UI
type Player = BasePlayer & { skillLevel?: number }
type Team = BaseTeam & { players?: Array<Player> }

interface VisualBalanceIndicatorProps {
  teams: Array<Team>
  players?: Array<Player>
}

export function VisualBalanceIndicator({
  teams,
  players = [],
}: VisualBalanceIndicatorProps) {
  // Calculate team statistics
  const teamStats = teams.map((team) => {
    const teamPlayers =
      team.players ||
      (players?.filter((p) => team.playerIds?.includes(p.id)) ?? [])
    const playerCount = teamPlayers.length
    const avgSkill =
      playerCount > 0
        ? teamPlayers.reduce((sum, p) => sum + (p.skillLevel || 5), 0) /
          playerCount
        : 0

    return {
      id: team.id,
      name: team.name,
      color: team.color || '#6B7280',
      playerCount,
      avgSkill,
    }
  })

  // Find max values for normalization
  const maxPlayers = Math.max(...teamStats.map((t) => t.playerCount), 1)
  const maxSkill = 10 // Skill is on a 10-point scale

  // Calculate balance score (lower is better)
  const avgPlayerCount =
    teamStats.reduce((sum, t) => sum + t.playerCount, 0) / teams.length
  const avgSkillLevel =
    teamStats.reduce((sum, t) => sum + t.avgSkill, 0) / teams.length

  const balanceScore =
    teamStats.reduce((sum, t) => {
      const playerDiff = Math.abs(t.playerCount - avgPlayerCount)
      const skillDiff = Math.abs(t.avgSkill - avgSkillLevel)
      return sum + playerDiff + skillDiff
    }, 0) / teams.length

  const getBalanceRating = (score: number) => {
    if (score < 0.5) return { label: 'Excellent', color: 'text-green-600' }
    if (score < 1.0) return { label: 'Good', color: 'text-blue-600' }
    if (score < 1.5) return { label: 'Fair', color: 'text-yellow-600' }
    return { label: 'Poor', color: 'text-red-600' }
  }

  const balance = getBalanceRating(balanceScore)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Team Balance</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Overall:</span>
          <span className={`text-sm font-semibold ${balance.color}`}>
            {balance.label}
          </span>
        </div>
      </div>

      {/* Player Count Comparison */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Player Distribution
        </h4>
        <div className="space-y-3">
          {teamStats.map((team) => (
            <div key={team.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="font-medium text-gray-900">{team.name}</span>
                </div>
                <span className="text-gray-600">
                  {team.playerCount}{' '}
                  {team.playerCount === 1 ? 'player' : 'players'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(team.playerCount / maxPlayers) * 100}%`,
                      backgroundColor: team.color,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {maxPlayers > 0
                    ? Math.round((team.playerCount / maxPlayers) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Level Comparison */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Skill Balance
        </h4>
        <div className="space-y-3">
          {teamStats.map((team) => (
            <div key={team.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="font-medium text-gray-900">{team.name}</span>
                </div>
                <span className="text-gray-600">
                  {team.avgSkill > 0 ? team.avgSkill.toFixed(1) : 'N/A'}/10
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(team.avgSkill / maxSkill) * 100}%`,
                      backgroundColor: team.color,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {team.avgSkill > 0
                    ? Math.round((team.avgSkill / maxSkill) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Balance Summary */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {teams.length}
            </div>
            <div className="text-xs text-gray-600">Teams</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {teamStats.reduce((sum, t) => sum + t.playerCount, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Players</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${balance.color}`}>
              {balanceScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">Balance Score</div>
          </div>
        </div>
      </div>

      {/* Balance Tips */}
      {balanceScore > 1.0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg">💡</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                Teams could be more balanced
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {balanceScore > 1.5
                  ? 'Try using the "Rebalance" button to distribute players more evenly.'
                  : 'Consider manually adjusting player assignments for better balance.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {balanceScore <= 0.5 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-green-600 text-lg">✨</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Perfectly balanced teams!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Your teams have excellent balance in both player count and skill
                levels.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
