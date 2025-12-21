import type { Player as BasePlayer } from '../lib/api/services/player.service'

// Extended player type with optional skill level for UI
type Player = BasePlayer & { skillLevel?: number }

interface TeamStatsCardProps {
  teamName: string
  teamColor: string
  players: Player[]
  position?: number
  totalTeams?: number
}

export function TeamStatsCard({
  teamName,
  teamColor,
  players,
  position = 1,
  totalTeams = 1,
}: TeamStatsCardProps) {
  // Calculate statistics
  const playerCount = players.length
  const readyCount = players.filter((p) => p.status === 'ready').length
  const avgSkill =
    playerCount > 0
      ? players.reduce((sum, p) => sum + ((p as Player).skillLevel || 5), 0) /
        playerCount
      : 0
  const readyPercentage = playerCount > 0 ? (readyCount / playerCount) * 100 : 0

  // Get skill rating
  const getSkillRating = (skill: number) => {
    if (skill >= 8) return { label: 'Elite', color: 'text-red-600', bg: 'bg-red-50' }
    if (skill >= 6) return { label: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (skill >= 4) return { label: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { label: 'Beginner', color: 'text-gray-600', bg: 'bg-gray-50' }
  }

  const skillRating = getSkillRating(avgSkill)

  return (
    <div
      className="bg-white border-2 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{ borderColor: teamColor }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b-2"
        style={{ borderColor: teamColor, backgroundColor: `${teamColor}15` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: teamColor }}
            />
            <div>
              <h3 className="text-lg font-bold text-gray-900">{teamName}</h3>
              <p className="text-xs text-gray-600">
                Position #{position} of {totalTeams}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {playerCount}
            </div>
            <div className="text-xs text-gray-600">
              {playerCount === 1 ? 'Player' : 'Players'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 space-y-4">
        {/* Readiness */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Readiness</span>
            <span className="text-sm text-gray-600">
              {readyCount}/{playerCount} ready
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${readyPercentage}%`,
                  backgroundColor:
                    readyPercentage === 100
                      ? '#10B981'
                      : readyPercentage >= 50
                        ? '#3B82F6'
                        : '#F59E0B',
                }}
              />
            </div>
            <span
              className="absolute right-2 top-0 text-xs font-medium"
              style={{
                color:
                  readyPercentage === 100
                    ? '#10B981'
                    : readyPercentage >= 50
                      ? '#3B82F6'
                      : '#F59E0B',
              }}
            >
              {readyPercentage.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Skill Level */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Average Skill
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${skillRating.bg} ${skillRating.color}`}
              >
                {skillRating.label}
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(avgSkill / 10) * 100}%`,
                  backgroundColor: teamColor,
                }}
              />
            </div>
            <span
              className="absolute right-2 top-0 text-xs font-medium"
              style={{ color: teamColor }}
            >
              {avgSkill.toFixed(1)}/10
            </span>
          </div>
        </div>

        {/* Player List Preview */}
        {players.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Players
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {player.status === 'ready'
                        ? '✅'
                        : player.status === 'playing'
                          ? '🎮'
                          : '⏳'}
                    </span>
                    <span className="font-medium text-gray-900">
                      {player.name}
                    </span>
                  </div>
                  {player.skillLevel && (
                    <span className="text-gray-500">
                      {player.skillLevel}/10
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {players.length === 0 && (
          <div className="py-4 text-center text-gray-400 text-sm">
            <div className="text-2xl mb-1">👥</div>
            <div>No players assigned</div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div
        className="px-4 py-2 border-t text-center"
        style={{ backgroundColor: `${teamColor}10` }}
      >
        <div className="flex justify-around text-xs">
          <div>
            <div className="font-semibold text-gray-900">
              {readyCount === playerCount && playerCount > 0 ? '✓' : '○'}
            </div>
            <div className="text-gray-600">Ready</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{playerCount}</div>
            <div className="text-gray-600">Size</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {avgSkill > 0 ? avgSkill.toFixed(1) : 'N/A'}
            </div>
            <div className="text-gray-600">Skill</div>
          </div>
        </div>
      </div>
    </div>
  )
}
