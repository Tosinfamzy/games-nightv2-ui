import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAPI } from '../lib/api/client'
import { ConfirmDialog } from './ConfirmDialog'

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
  sessionId: string
  unassignedPlayers: Array<Player>
  onPlayerReassign?: (
    playerId: string,
    fromTeamId: string,
    toTeamId: string,
  ) => void
  onTeamDelete?: (teamId: string) => void
}

export function TeamDisplay({
  teams,
  sessionId,
  unassignedPlayers,
  onPlayerReassign,
  onTeamDelete,
}: TeamDisplayProps) {
  const [editingTeam, setEditingTeam] = useState<string | null>(null)
  const [draggedPlayer, setDraggedPlayer] = useState<{
    playerId: string
    fromTeamId: string
  } | null>(null)
  const [teamToDelete, setTeamToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const queryClient = useQueryClient()

  // Remove player from team
  const removePlayerMutation = useMutation({
    mutationFn: async ({
      teamId,
      playerId,
    }: {
      teamId: string
      playerId: string
    }) => {
      return fetchAPI(
        `/sessions/${sessionId}/teams/${teamId}/players/${playerId}`,
        {
          method: 'DELETE',
        },
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
    },
  })

  // Add player to team
  const addPlayerMutation = useMutation({
    mutationFn: async ({
      teamId,
      playerId,
    }: {
      teamId: string
      playerId: string
    }) => {
      return fetchAPI(`/sessions/${sessionId}/teams/${teamId}/players`, {
        method: 'PUT',
        body: JSON.stringify({ playerIds: [playerId] }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
    },
  })

  // Update team details
  const updateTeamMutation = useMutation({
    mutationFn: async ({
      teamId,
      updates,
    }: {
      teamId: string
      updates: Partial<Team>
    }) => {
      return fetchAPI(`/sessions/${sessionId}/teams/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
      setEditingTeam(null)
    },
  })

  // Delete team
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      return fetchAPI(`/sessions/${sessionId}/teams/${teamId}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
    },
  })

  const handleDragStart = (playerId: string, fromTeamId: string) => {
    setDraggedPlayer({ playerId, fromTeamId })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (toTeamId: string) => {
    if (!draggedPlayer) return

    if (draggedPlayer.fromTeamId !== toTeamId) {
      // Remove from old team and add to new team
      removePlayerMutation.mutate({
        teamId: draggedPlayer.fromTeamId,
        playerId: draggedPlayer.playerId,
      })

      setTimeout(() => {
        addPlayerMutation.mutate({
          teamId: toTeamId,
          playerId: draggedPlayer.playerId,
        })
      }, 100)

      onPlayerReassign?.(
        draggedPlayer.playerId,
        draggedPlayer.fromTeamId,
        toTeamId,
      )
    }

    setDraggedPlayer(null)
  }

  const handleRemovePlayer = (teamId: string, playerId: string) => {
    removePlayerMutation.mutate({ teamId, playerId })
  }

  const handleUpdateTeam = (teamId: string, formData: FormData) => {
    const name = formData.get('name') as string
    const color = formData.get('color') as string

    updateTeamMutation.mutate({
      teamId,
      updates: { name, color: color || undefined },
    })
  }

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
        <div className="text-sm text-gray-500">
          Use the Team Formation interface to automatically create balanced
          teams
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Teams Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const balance = getTeamBalance(team)
          const isEditing = editingTeam === team.id

          return (
            <div
              key={team.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(team.id)}
            >
              {/* Team Header */}
              <div
                className="p-4 border-b border-gray-200"
                style={{
                  backgroundColor: team.color ? `${team.color}15` : '#f8fafc',
                }}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleUpdateTeam(team.id, new FormData(e.currentTarget))
                    }}
                    className="space-y-2"
                  >
                    <input
                      name="name"
                      defaultValue={team.name}
                      className="w-full px-2 py-1 text-lg font-semibold bg-white border border-gray-300 rounded"
                      placeholder="Team name"
                      required
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        name="color"
                        type="color"
                        defaultValue={team.color || '#6B7280'}
                        className="w-8 h-8 border border-gray-300 rounded"
                      />
                      <div className="flex space-x-1">
                        <button
                          type="submit"
                          disabled={updateTeamMutation.isPending}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTeam(null)}
                          className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: team.color || '#6B7280' }}
                      />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {team.name}
                      </h3>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingTeam(team.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit team"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() =>
                          setTeamToDelete({ id: team.id, name: team.name })
                        }
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete team"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
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
                        draggable
                        onDragStart={() => handleDragStart(player.id, team.id)}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-move transition-colors"
                      >
                        <div className="flex items-center space-x-2">
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
                        <button
                          onClick={() => handleRemovePlayer(team.id, player.id)}
                          className="text-red-400 hover:text-red-600 text-sm"
                          title="Remove from team"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <div className="text-2xl mb-2">👥</div>
                    <p className="text-sm">No players assigned</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Drag players here or use auto-formation
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>Drag & drop to reassign players</span>
                  <span>Balance: {team.balanceScore?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Unassigned Players */}
      {unassignedPlayers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Unassigned Players ({unassignedPlayers.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {unassignedPlayers.map((player) => (
              <div
                key={player.id}
                draggable
                onDragStart={() => handleDragStart(player.id, 'unassigned')}
                className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 cursor-move transition-colors"
              >
                <span className="text-sm">
                  {getPlayerStatusIcon(player.status)}
                </span>
                <span className="text-sm font-medium text-gray-900">
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
          <p className="text-xs text-gray-500 mt-2">
            💡 Drag these players to teams or use automatic team formation
          </p>
        </div>
      )}

      {/* Team Balance Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          Team Balance Analysis
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {teams.map((team) => {
            const balance = getTeamBalance(team)
            const avgSkill =
              (team.players?.length || 0) > 0
                ? (team.players || []).reduce(
                    (sum, p) => sum + (p.skillLevel || 0),
                    0,
                  ) / (team.players?.length || 1)
                : 0

            return (
              <div key={team.id} className="text-center">
                <div
                  className="w-4 h-4 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: team.color || '#6B7280' }}
                />
                <div className="text-sm font-medium">{team.name}</div>
                <div className={`text-xs ${balance.color}`}>
                  {balance.label}
                </div>
                <div className="text-xs text-gray-500">
                  Avg: {avgSkill.toFixed(1)}/10
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Delete Team Confirmation Dialog */}
      <ConfirmDialog
        isOpen={teamToDelete !== null}
        onClose={() => setTeamToDelete(null)}
        onConfirm={() => {
          if (teamToDelete) {
            deleteTeamMutation.mutate(teamToDelete.id)
            onTeamDelete?.(teamToDelete.id)
            setTeamToDelete(null)
          }
        }}
        title="Delete Team"
        message={`Are you sure you want to delete team "${teamToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Team"
        variant="danger"
      />
    </div>
  )
}
