import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { teamService, type Team } from '../lib/api/services/team.service'
import { playerService, type Player } from '../lib/api/services/player.service'
import { useTeamManagement } from '../hooks/useTeamManagement'
import { ConfirmDialog } from './ConfirmDialog'
import EmptyState from './EmptyState'

interface TeamManagementPanelProps {
  gameId: string
  sessionId: string
  isHost: boolean
}

export function TeamManagementPanel({
  gameId,
  sessionId,
  isHost,
}: TeamManagementPanelProps) {
  const [selectedTeamForDissolve, setSelectedTeamForDissolve] = useState<
    string | null
  >(null)
  const [showDissolveConfirm, setShowDissolveConfirm] = useState(false)
  const [teamToDissolve, setTeamToDissolve] = useState<{
    id: string
    name: string
  } | null>(null)

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

  const getPlayerById = (playerId: string): Player | undefined => {
    return players.find((p) => p.id === playerId)
  }

  const handleReassignPlayer = (playerId: string, newTeamId: string) => {
    reassignPlayer({ playerId, newTeamId })
  }

  const handleDissolveTeam = (teamId: string, teamName: string) => {
    setTeamToDissolve({ id: teamId, name: teamName })
    setShowDissolveConfirm(true)
  }

  const confirmDissolveTeam = () => {
    if (teamToDissolve) {
      dissolveTeam(teamToDissolve.id)
      setSelectedTeamForDissolve(null)
      setTeamToDissolve(null)
    }
  }

  const unassignedPlayers = players.filter((player) => {
    return !teams.some((team) => team.playerIds.includes(player.id))
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Management</h3>
        <p className="text-sm text-gray-600">
          {teams.length} {teams.length === 1 ? 'team' : 'teams'}
        </p>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            allTeams={teams}
            getPlayerById={getPlayerById}
            onReassignPlayer={handleReassignPlayer}
            onDissolveTeam={() => handleDissolveTeam(team.id, team.name)}
            isProcessing={
              isDissolvingTeam ||
              isReassigningPlayer ||
              selectedTeamForDissolve === team.id
            }
          />
        ))}
      </div>

      {/* Unassigned Players */}
      {unassignedPlayers.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Unassigned Players</h4>
          <div className="space-y-2">
            {unassignedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 bg-white rounded border"
              >
                <span className="text-sm">{player.name}</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleReassignPlayer(player.id, e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="px-2 py-1 text-sm border rounded"
                  disabled={isReassigningPlayer}
                >
                  <option value="">Assign to team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDissolveConfirm}
        title="Dissolve Team?"
        message={`Are you sure you want to dissolve ${teamToDissolve?.name}? All players will be returned to the unassigned pool.`}
        confirmText="Dissolve"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDissolveTeam}
        onCancel={() => {
          setShowDissolveConfirm(false)
          setTeamToDissolve(null)
        }}
      />
    </div>
  )
}

interface TeamCardProps {
  team: Team
  allTeams: Team[]
  getPlayerById: (playerId: string) => Player | undefined
  onReassignPlayer: (playerId: string, newTeamId: string) => void
  onDissolveTeam: () => void
  isProcessing: boolean
}

function TeamCard({
  team,
  allTeams,
  getPlayerById,
  onReassignPlayer,
  onDissolveTeam,
  isProcessing,
}: TeamCardProps) {
  const otherTeams = allTeams.filter((t) => t.id !== team.id)

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      {/* Team Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {team.color && (
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: team.color }}
            />
          )}
          <h4 className="font-semibold">{team.name}</h4>
          <span className="text-sm text-gray-600">
            ({team.playerIds.length}{' '}
            {team.playerIds.length === 1 ? 'player' : 'players'})
          </span>
        </div>
        <button
          onClick={onDissolveTeam}
          disabled={isProcessing}
          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Dissolve Team
        </button>
      </div>

      {/* Players */}
      {team.playerIds.length > 0 ? (
        <div className="space-y-2">
          {team.playerIds.map((playerId) => {
            const player = getPlayerById(playerId)
            if (!player) return null

            return (
              <div
                key={playerId}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-sm">{player.name}</span>
                {otherTeams.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        onReassignPlayer(playerId, e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="px-2 py-1 text-sm border rounded bg-white"
                    disabled={isProcessing}
                  >
                    <option value="">Move to...</option>
                    {otherTeams.map((otherTeam) => (
                      <option key={otherTeam.id} value={otherTeam.id}>
                        {otherTeam.name}
                      </option>
                    ))}
                    <option value="unassigned">Unassign</option>
                  </select>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-2">
          No players assigned
        </p>
      )}
    </div>
  )
}
