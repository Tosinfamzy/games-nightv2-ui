import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { teamService, type Team } from '../lib/api/services/team.service'
import { playerService, type Player } from '../lib/api/services/player.service'
import { useTeamManagement } from '../hooks/useTeamManagement'
import { ConfirmDialog } from './ConfirmDialog'
import { QuickTeamActions } from './QuickTeamActions'
import { VisualBalanceIndicator } from './VisualBalanceIndicator'
import { TeamStatsCard } from './TeamStatsCard'
import EmptyState from './EmptyState'

interface EnhancedTeamManagementProps {
  gameId: string
  sessionId: string
  isHost: boolean
}

export function EnhancedTeamManagement({
  gameId,
  sessionId,
  isHost,
}: EnhancedTeamManagementProps) {
  const [draggedPlayer, setDraggedPlayer] = useState<{
    playerId: string
    fromTeamId: string | null
  } | null>(null)
  const [teamToDissolve, setTeamToDissolve] = useState<{
    id: string
    name: string
  } | null>(null)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', 'game', gameId],
    queryFn: () => teamService.getByGame(gameId),
  })

  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['players', 'session', sessionId],
    queryFn: () => playerService.getBySession(sessionId),
  })

  const {
    dissolveTeam,
    isDissolvingTeam,
    reassignPlayer,
    isReassigningPlayer,
  } = useTeamManagement()

  const handleDragStart = (playerId: string, fromTeamId: string | null) => {
    setDraggedPlayer({ playerId, fromTeamId })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-300')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300')
  }

  const handleDrop = (e: React.DragEvent, toTeamId: string) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300')

    if (!draggedPlayer) return

    // Don't do anything if dropped on the same team
    if (draggedPlayer.fromTeamId === toTeamId) {
      setDraggedPlayer(null)
      return
    }

    reassignPlayer({
      playerId: draggedPlayer.playerId,
      newTeamId: toTeamId,
    })

    setDraggedPlayer(null)
  }

  const handleDissolveTeam = (teamId: string, teamName: string) => {
    setTeamToDissolve({ id: teamId, name: teamName })
  }

  const confirmDissolveTeam = () => {
    if (teamToDissolve) {
      dissolveTeam(teamToDissolve.id)
      setTeamToDissolve(null)
    }
  }

  const getPlayerById = (playerId: string): Player | undefined => {
    return players.find((p) => p.id === playerId)
  }

  const getTeamPlayers = (team: Team): Player[] => {
    return team.playerIds
      .map((id) => getPlayerById(id))
      .filter((p): p is Player => p !== undefined)
  }

  const unassignedPlayers = players.filter((player) => {
    return !teams.some((team) => team.playerIds.includes(player.id))
  })

  const hasPlayers = teams.some((team) => team.playerIds.length > 0)
  const isProcessing = isDissolvingTeam || isReassigningPlayer

  if (!isHost) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p>Only the host can manage teams.</p>
      </div>
    )
  }

  if (isLoadingTeams || isLoadingPlayers) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<span className="text-6xl">🏆</span>}
          title="No Teams Created"
          description="Create teams first to manage them. Use the team formation interface to organize players into teams."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Team Management</h3>
          <p className="text-sm text-gray-600 mt-1">
            Drag and drop players to reorganize teams
          </p>
        </div>
        <QuickTeamActions
          gameId={gameId}
          sessionId={sessionId}
          teamCount={teams.length}
          hasPlayers={hasPlayers}
          disabled={isProcessing}
        />
      </div>

      {/* Team Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, index) => {
          const teamPlayers = getTeamPlayers(team)
          return (
            <div
              key={team.id}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, team.id)}
              className="transition-all duration-200 border-2 border-transparent rounded-lg"
            >
              <TeamStatsCard
                teamName={team.name}
                teamColor={team.color || '#6B7280'}
                players={teamPlayers as any}
                position={index + 1}
                totalTeams={teams.length}
              />

              {/* Team Actions */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() =>
                    setExpandedTeam(expandedTeam === team.id ? null : team.id)
                  }
                  className="flex-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {expandedTeam === team.id ? 'Hide' : 'Manage'} Players
                </button>
                <button
                  onClick={() => handleDissolveTeam(team.id, team.name)}
                  disabled={isProcessing}
                  className="px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Dissolve
                </button>
              </div>

              {/* Expanded Player Management */}
              {expandedTeam === team.id && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Team Players (Drag to reassign)
                  </h4>
                  {teamPlayers.length > 0 ? (
                    <div className="space-y-2">
                      {teamPlayers.map((player) => (
                        <div
                          key={player.id}
                          draggable
                          onDragStart={() => handleDragStart(player.id, team.id)}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-move transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {player.status === 'ready'
                                ? '✅'
                                : player.status === 'playing'
                                  ? '🎮'
                                  : '⏳'}
                            </span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {player.name}
                              </div>
                              {(player as any).skillLevel && (
                                <div className="text-xs text-gray-500">
                                  Skill: {(player as any).skillLevel}/10
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 8h16M4 16h16"
                              />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No players in this team
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Visual Balance Indicator */}
      <VisualBalanceIndicator teams={teams} players={players} />

      {/* Unassigned Players */}
      {unassignedPlayers.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900">
                Unassigned Players ({unassignedPlayers.length})
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Drag these players to teams to assign them
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unassignedPlayers.map((player) => (
              <div
                key={player.id}
                draggable
                onDragStart={() => handleDragStart(player.id, null)}
                className="flex items-center justify-between p-3 bg-white border-2 border-yellow-300 rounded-lg hover:border-yellow-400 hover:shadow-md cursor-move transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {player.status === 'ready'
                      ? '✅'
                      : player.status === 'playing'
                        ? '🎮'
                        : '⏳'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">{player.name}</div>
                    {(player as any).skillLevel && (
                      <div className="text-xs text-gray-500">
                        Skill: {(player as any).skillLevel}/10
                      </div>
                    )}
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dissolve Team Confirmation Dialog */}
      <ConfirmDialog
        isOpen={teamToDissolve !== null}
        onClose={() => setTeamToDissolve(null)}
        onConfirm={confirmDissolveTeam}
        title="Dissolve Team?"
        message={`Are you sure you want to dissolve ${teamToDissolve?.name}? All players will be returned to the unassigned pool.`}
        confirmLabel="Dissolve Team"
        variant="danger"
      />
    </div>
  )
}
