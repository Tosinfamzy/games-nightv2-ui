import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { HostOnly } from '../components/HostOnly'
import { gameService } from '../lib/api/services/game.service'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { playerService } from '../lib/api/services/player.service'
import { sessionService } from '../lib/api/services/session.service'
import { teamService } from '../lib/api/services/team.service'
import type {
  CreateTeamDTO,
  Team,
  UpdateTeamDTO,
} from '../lib/api/services/team.service'

export const Route = createFileRoute('/teams')({
  component: () => (
    <HostOnly title="Teams">
      <Teams />
    </HostOnly>
  ),
})

function Teams() {
  const queryClient = useQueryClient()
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [selectedGame, setSelectedGame] = useState<string>('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null)

  // Queries
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: teamService.getAll,
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionService.getAll,
  })

  const { data: games = [] } = useQuery({
    queryKey: ['games'],
    queryFn: gameService.getAll,
  })

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: playerService.getAll,
  })

  const sessionsById = useMemo(() => {
    return sessions.reduce(
      (acc, session) => {
        acc[session.id] = session
        return acc
      },
      {} as Record<string, (typeof sessions)[number]>,
    )
  }, [sessions])

  const gamesById = useMemo(() => {
    return games.reduce(
      (acc, game) => {
        acc[game.id] = game
        return acc
      },
      {} as Record<string, (typeof games)[number]>,
    )
  }, [games])

  const playersById = useMemo(() => {
    return players.reduce(
      (acc, player) => {
        acc[player.id] = player
        return acc
      },
      {} as Record<string, (typeof players)[number]>,
    )
  }, [players])

  // Filter teams by selected session/game
  const filteredTeams = teams.filter((team) => {
    if (selectedSession && team.sessionId !== selectedSession) return false
    if (selectedGame && team.gameId !== selectedGame) return false
    return true
  })

  // Mutations
  const createTeamMutation = useMutation({
    mutationFn: teamService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setShowCreateForm(false)
    },
  })

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamDTO }) =>
      teamService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setEditingTeam(null)
    },
  })

  const deleteTeamMutation = useMutation({
    mutationFn: teamService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  const addPlayersMutation = useMutation({
    mutationFn: ({
      teamId,
      playerIds,
    }: {
      teamId: string
      playerIds: Array<string>
    }) => teamService.addPlayers(teamId, playerIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  const removePlayersMutation = useMutation({
    mutationFn: ({
      teamId,
      playerIds,
    }: {
      teamId: string
      playerIds: Array<string>
    }) => teamService.removePlayers(teamId, playerIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  // Get available players (not in any team for the selected session/game)
  const getAvailablePlayers = () => {
    const relevantPlayers = selectedSession
      ? players.filter((player) => player.session?.id === selectedSession)
      : players

    const assignedPlayerIds = new Set(
      filteredTeams.flatMap((team) => team.playerIds),
    )

    return relevantPlayers.filter((player) => !assignedPlayerIds.has(player.id))
  }

  const handleCreateTeam = (formData: FormData) => {
    const name = formData.get('name') as string
    const color = formData.get('color') as string
    const position = parseInt(formData.get('position') as string) || 1

    if (!name || !selectedGame || !selectedSession) return

    const createData: CreateTeamDTO = {
      name,
      gameId: selectedGame,
      sessionId: selectedSession,
      color: color || undefined,
      position,
    }

    createTeamMutation.mutate(createData)
  }

  const handleUpdateTeam = (team: Team, formData: FormData) => {
    const name = formData.get('name') as string
    const color = formData.get('color') as string
    const position = parseInt(formData.get('position') as string)

    const updateData: UpdateTeamDTO = {
      name: name || undefined,
      color: color || undefined,
      position: position || undefined,
    }

    updateTeamMutation.mutate({ id: team.id, data: updateData })
  }

  const handleAddPlayer = (teamId: string, playerId: string) => {
    addPlayersMutation.mutate({ teamId, playerIds: [playerId] })
  }

  const handleRemovePlayer = (teamId: string, playerId: string) => {
    removePlayersMutation.mutate({ teamId, playerIds: [playerId] })
  }

  const handleDeleteTeam = (teamId: string) => {
    setTeamToDelete(teamId)
  }

  if (teamsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Team Formation</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={!selectedSession || !selectedGame}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Create Team
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sessions</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name} ({session.status})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game
          </label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Games</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredTeams.map((team) => {
          const teamSession = team.sessionId
            ? sessionsById[team.sessionId]
            : undefined
          const teamGame = team.gameId ? gamesById[team.gameId] : undefined
          const teamPlayers = team.playerIds
            .map((playerId) => playersById[playerId])
            .filter((player): player is (typeof players)[number] =>
              Boolean(player),
            )

          return (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
              style={{ borderLeftColor: team.color, borderLeftWidth: '4px' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{team.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {team.color && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: team.color }}
                      />
                    )}
                    <span className="text-sm text-gray-600">
                      Position {team.position}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        team.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {team.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingTeam(team)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Game:</p>
                <p className="text-sm text-gray-600">
                  {teamGame ? teamGame.name : 'Unassigned'}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Session:
                </p>
                <p className="text-sm text-gray-600">
                  {teamSession
                    ? `${teamSession.name} (${teamSession.status})`
                    : 'Unassigned'}
                </p>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Players ({teamPlayers.length})
                  </p>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddPlayer(team.id, e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    defaultValue=""
                  >
                    <option value="">Add Player</option>
                    {getAvailablePlayers().map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {teamPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center bg-gray-50 rounded px-3 py-2"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {player.name}
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            player.status === 'ready'
                              ? 'bg-green-100 text-green-800'
                              : player.status === 'playing'
                                ? 'bg-blue-100 text-blue-800'
                                : player.status === 'joined'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {player.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemovePlayer(team.id, player.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {teamPlayers.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No players assigned
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <p className="text-xl text-gray-600 mb-2">No teams found</p>
          <p className="text-gray-500">
            {!selectedSession || !selectedGame
              ? 'Select a session and game to create teams'
              : 'Create your first team to get started'}
          </p>
        </div>
      )}

      {/* Available Players Panel */}
      {(selectedSession || selectedGame) && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            Available Players ({getAvailablePlayers().length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {getAvailablePlayers().map((player) => (
              <div
                key={player.id}
                className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
              >
                <div className="font-medium text-sm">{player.name}</div>
                <div
                  className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                    player.status === 'ready'
                      ? 'bg-green-100 text-green-800'
                      : player.status === 'playing'
                        ? 'bg-blue-100 text-blue-800'
                        : player.status === 'joined'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {player.status}
                </div>
              </div>
            ))}
          </div>
          {getAvailablePlayers().length === 0 && (
            <p className="text-gray-500 italic">
              All players are assigned to teams
            </p>
          )}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleCreateTeam(new FormData(e.currentTarget))
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Color
                  </label>
                  <input
                    name="color"
                    type="color"
                    className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    name="position"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTeamMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Team</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateTeam(editingTeam, new FormData(e.currentTarget))
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingTeam.name}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Color
                  </label>
                  <input
                    name="color"
                    type="color"
                    defaultValue={editingTeam.color || '#000000'}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    name="position"
                    type="number"
                    min="1"
                    defaultValue={editingTeam.position}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTeamMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {updateTeamMutation.isPending ? 'Updating...' : 'Update Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Team Confirmation Dialog */}
      <ConfirmDialog
        isOpen={teamToDelete !== null}
        onClose={() => setTeamToDelete(null)}
        onConfirm={() => {
          if (teamToDelete) {
            deleteTeamMutation.mutate(teamToDelete)
            setTeamToDelete(null)
          }
        }}
        title="Delete Team"
        message="Are you sure you want to delete this team? This action cannot be undone."
        confirmLabel="Delete Team"
        variant="danger"
      />
    </div>
  )
}
