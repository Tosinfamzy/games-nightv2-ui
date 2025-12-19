import { useQuery } from '@tanstack/react-query'
import { sessionManagementService } from '../lib/api/services/session-management.service'

interface Player {
  id: string
  name: string
  status: 'ready' | 'not_ready' | 'playing'
}

interface Team {
  id: string
  name: string
  players: Array<Player>
}

interface Game {
  id: string
  name: string
  minPlayers: number
  maxPlayers: number
  status: 'scheduled' | 'in_progress' | 'completed'
}

interface SessionReadinessDashboardProps {
  sessionId: string
  players: Array<Player>
  teams: Array<Team>
  games: Array<Game>
  sessionStatus: string
}

export function SessionReadinessDashboard({
  sessionId,
  players,
  teams,
  games,
  sessionStatus,
}: SessionReadinessDashboardProps) {
  const { data: readiness } = useQuery({
    queryKey: ['session-readiness', sessionId],
    queryFn: () => sessionManagementService.getSessionReadiness(sessionId),
    staleTime: Infinity, // Trust WebSocket updates only
    refetchOnMount: true, // Initial load only
  })

  const getReadinessScore = () => {
    if (!readiness) return 0
    return readiness.totalPlayers > 0
      ? Math.round((readiness.readyPlayers / readiness.totalPlayers) * 100)
      : 0
  }

  const getTeamReadiness = () => {
    const assignedPlayers = teams.flatMap((team) => team.players)
    const unassignedCount = players.length - assignedPlayers.length

    return {
      teamsFormed: teams.length,
      playersAssigned: assignedPlayers.length,
      playersUnassigned: unassignedCount,
      allPlayersAssigned: unassignedCount === 0,
    }
  }

  const getGameReadiness = () => {
    const readyGames = games.filter(
      (game) =>
        game.minPlayers <= players.length && players.length <= game.maxPlayers,
    )

    return {
      gamesAvailable: games.length,
      gamesPlayable: readyGames.length,
      allGamesPlayable: readyGames.length === games.length,
    }
  }

  const teamReadiness = getTeamReadiness()
  const gameReadiness = getGameReadiness()
  const readinessScore = getReadinessScore()

  const getStatusIcon = (isReady: boolean) => (isReady ? '✅' : '❌')
  const getStatusColor = (isReady: boolean) =>
    isReady
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-red-600 bg-red-50 border-red-200'

  const overallReady =
    readiness?.allReady &&
    teamReadiness.allPlayersAssigned &&
    gameReadiness.allGamesPlayable

  return (
    <div className="space-y-6">
      {/* Overall Readiness Header */}
      <div
        className={`p-6 rounded-lg border-2 ${
          overallReady
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Session Readiness {overallReady ? '✅' : '⏳'}
            </h2>
            <p className="text-gray-600">
              {overallReady
                ? 'Ready to start! All systems go.'
                : 'Preparing session... Some items need attention.'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {readinessScore}%
            </div>
            <div className="text-sm text-gray-600">Overall Ready</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                readinessScore >= 90
                  ? 'bg-green-500'
                  : readinessScore >= 70
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Readiness Categories */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Player Readiness */}
        <div
          className={`p-4 rounded-lg border ${getStatusColor(readiness?.allReady || false)}`}
        >
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">
              {getStatusIcon(readiness?.allReady || false)}
            </span>
            <h3 className="font-semibold">Player Readiness</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Ready Players:</span>
              <span className="font-medium">
                {readiness?.readyPlayers || 0}/{readiness?.totalPlayers || 0}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {readiness?.allReady
                ? 'All players are ready to start'
                : `${(readiness?.totalPlayers || 0) - (readiness?.readyPlayers || 0)} players not ready`}
            </div>
          </div>

          {/* Player Status List */}
          {readiness?.playersStatus && (
            <div className="mt-3 max-h-32 overflow-y-auto">
              <div className="text-xs text-gray-500 mb-1">Player Status:</div>
              {readiness.playersStatus.map((player) => (
                <div
                  key={player.playerId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{player.playerName}</span>
                  <span
                    className={`text-xs px-1 py-0.5 rounded ${
                      player.isReady
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {player.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Readiness */}
        <div
          className={`p-4 rounded-lg border ${getStatusColor(teamReadiness.allPlayersAssigned)}`}
        >
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">
              {getStatusIcon(teamReadiness.allPlayersAssigned)}
            </span>
            <h3 className="font-semibold">Team Formation</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Teams Formed:</span>
              <span className="font-medium">{teamReadiness.teamsFormed}</span>
            </div>
            <div className="flex justify-between">
              <span>Players Assigned:</span>
              <span className="font-medium">
                {teamReadiness.playersAssigned}/{players.length}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {teamReadiness.allPlayersAssigned
                ? 'All players are assigned to teams'
                : `${teamReadiness.playersUnassigned} players need team assignment`}
            </div>
          </div>

          {/* Team Balance Preview */}
          {teams.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Team Balance:</div>
              <div className="space-y-1">
                {teams.slice(0, 3).map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{team.name}</span>
                    <span className="text-xs text-gray-600">
                      {team.players?.length || 0} players
                    </span>
                  </div>
                ))}
                {teams.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{teams.length - 3} more teams
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Game Readiness */}
        <div
          className={`p-4 rounded-lg border ${getStatusColor(gameReadiness.allGamesPlayable)}`}
        >
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">
              {getStatusIcon(gameReadiness.allGamesPlayable)}
            </span>
            <h3 className="font-semibold">Game Compatibility</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Games Available:</span>
              <span className="font-medium">
                {gameReadiness.gamesAvailable}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Games Playable:</span>
              <span className="font-medium">
                {gameReadiness.gamesPlayable}/{gameReadiness.gamesAvailable}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {gameReadiness.allGamesPlayable
                ? 'All games can be played with current player count'
                : `${gameReadiness.gamesAvailable - gameReadiness.gamesPlayable} games incompatible`}
            </div>
          </div>

          {/* Game Status List */}
          {games.length > 0 && (
            <div className="mt-3 max-h-32 overflow-y-auto">
              <div className="text-xs text-gray-500 mb-1">Game Status:</div>
              {games.slice(0, 4).map((game) => {
                const isPlayable =
                  game.minPlayers <= players.length &&
                  players.length <= game.maxPlayers
                return (
                  <div
                    key={game.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{game.name}</span>
                    <span
                      className={`text-xs px-1 py-0.5 rounded ${
                        isPlayable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isPlayable ? 'Ready' : 'N/A'}
                    </span>
                  </div>
                )
              })}
              {games.length > 4 && (
                <div className="text-xs text-gray-500">
                  +{games.length - 4} more games
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Items */}
      {!overallReady && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-3">📋 Action Items</h4>
          <ul className="space-y-2 text-sm text-yellow-800">
            {!readiness?.allReady && (
              <li className="flex items-center space-x-2">
                <span>⏳</span>
                <span>
                  Wait for{' '}
                  {(readiness?.totalPlayers || 0) -
                    (readiness?.readyPlayers || 0)}{' '}
                  players to mark themselves ready
                </span>
              </li>
            )}
            {!teamReadiness.allPlayersAssigned && (
              <li className="flex items-center space-x-2">
                <span>👥</span>
                <span>
                  Assign {teamReadiness.playersUnassigned} unassigned players to
                  teams
                </span>
              </li>
            )}
            {!gameReadiness.allGamesPlayable && (
              <li className="flex items-center space-x-2">
                <span>🎮</span>
                <span>
                  Review game requirements - some games may not be playable with
                  current player count
                </span>
              </li>
            )}
            {teams.length === 0 && (
              <li className="flex items-center space-x-2">
                <span>🏆</span>
                <span>
                  Create teams using automatic team formation or manual
                  assignment
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {players.length}
          </div>
          <div className="text-sm text-gray-600">Total Players</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {teams.length}
          </div>
          <div className="text-sm text-gray-600">Teams Formed</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {games.length}
          </div>
          <div className="text-sm text-gray-600">Games Available</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div
            className={`text-2xl font-bold ${
              sessionStatus === 'scheduled'
                ? 'text-yellow-600'
                : sessionStatus === 'in_progress'
                  ? 'text-green-600'
                  : sessionStatus === 'completed'
                    ? 'text-gray-600'
                    : 'text-red-600'
            }`}
          >
            {sessionStatus === 'scheduled'
              ? '⏳'
              : sessionStatus === 'in_progress'
                ? '🎮'
                : sessionStatus === 'completed'
                  ? '✅'
                  : '❌'}
          </div>
          <div className="text-sm text-gray-600 capitalize">
            {sessionStatus.replace('_', ' ')}
          </div>
        </div>
      </div>
    </div>
  )
}
