import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { playerService } from '../lib/api/services/player.service'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { sessionService } from '../lib/api/services/session.service'
import type {
  CreatePlayerDTO,
  Player,
  UpdatePlayerDTO,
  UpdatePlayerStatusDTO,
} from '../lib/api/services/player.service'

function PlayerManagementPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [playerToDelete, setPlayerToDelete] = useState<{
    id: string
    name: string
  } | null>(null)
  const queryClient = useQueryClient()

  // Fetch all players
  const { data: allPlayers = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: playerService.getAll,
  })

  // Fetch all sessions for dropdown
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionService.getAll,
  })

  // Fetch players by session
  const { data: sessionPlayers = [] } = useQuery({
    queryKey: ['players', 'session', selectedSession],
    queryFn: () =>
      selectedSession
        ? playerService.getBySession(selectedSession)
        : Promise.resolve([]),
    enabled: !!selectedSession,
  })

  // Create player mutation
  const createPlayerMutation = useMutation({
    mutationFn: playerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      setShowCreateForm(false)
    },
  })

  // Update player mutation
  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlayerDTO }) =>
      playerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      setEditingPlayer(null)
    },
  })

  // Update player status mutation
  const updatePlayerStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlayerStatusDTO }) =>
      playerService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      // Close editing form if we're editing and this was a status update
      if (editingPlayer) {
        setEditingPlayer(null)
      }
    },
  })

  // Delete player mutation
  const deletePlayerMutation = useMutation({
    mutationFn: playerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })

  const handleCreatePlayer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreatePlayerDTO = {
      name: formData.get('name') as string,
      sessionId: formData.get('sessionId') as string,
    }
    createPlayerMutation.mutate(data)
  }

  const handleUpdatePlayer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPlayer) return

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const status = formData.get('status') as Player['status']

    // Update name if it changed
    if (name !== editingPlayer.name) {
      updatePlayerMutation.mutate({
        id: editingPlayer.id,
        data: { name },
      })
    }

    // Update status if it changed
    if (status !== editingPlayer.status) {
      updatePlayerStatusMutation.mutate({
        id: editingPlayer.id,
        data: { status },
      })
    }

    // If neither changed, just close the form
    if (name === editingPlayer.name && status === editingPlayer.status) {
      setEditingPlayer(null)
    }
  }

  const handleQuickStatusUpdate = (
    playerId: string,
    newStatus: Player['status'],
  ) => {
    updatePlayerStatusMutation.mutate({
      id: playerId,
      data: { status: newStatus },
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'joined':
        return 'bg-blue-100 text-blue-800'
      case 'playing':
        return 'bg-purple-100 text-purple-800'
      case 'disconnected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return '✅'
      case 'joined':
        return '👋'
      case 'playing':
        return '🎮'
      case 'disconnected':
        return '❌'
      default:
        return '❓'
    }
  }

  const displayPlayers = selectedSession ? sessionPlayers : allPlayers

  if (loadingPlayers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading players...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Player Management
          </h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Player
          </button>
        </div>

        {/* Session Filter */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Session (optional)
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Players</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name} ({session.status})
              </option>
            ))}
          </select>
        </div>

        {/* Create Player Form */}
        {showCreateForm && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add New Player</h2>
            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9\s]+"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter player name (3-20 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session
                </label>
                <select
                  name="sessionId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a session</option>
                  {sessions
                    .filter(
                      (s) =>
                        s.status !== 'COMPLETED' && s.status !== 'CANCELLED',
                    )
                    .map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name} - {session.status}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={createPlayerMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createPlayerMutation.isPending ? 'Adding...' : 'Add Player'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Player Form */}
        {editingPlayer && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Edit Player</h2>
            <form onSubmit={handleUpdatePlayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingPlayer.name}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9\s]+"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingPlayer.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="joined">Joined</option>
                  <option value="ready">Ready</option>
                  <option value="playing">Playing</option>
                  <option value="disconnected">Disconnected</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={updatePlayerMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {updatePlayerMutation.isPending
                    ? 'Updating...'
                    : 'Update Player'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Players List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPlayers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
              {selectedSession
                ? 'No players found in this session'
                : 'No players found'}
            </div>
          ) : (
            displayPlayers.map((player) => (
              <div
                key={player.id}
                className="p-6 bg-white rounded-lg shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {player.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(player.status)}`}
                  >
                    {getStatusIcon(player.status)} {player.status}
                  </span>
                </div>

                {/* Session Info */}
                {player.session && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Session
                    </h4>
                    <p className="text-sm text-gray-600">
                      {player.session?.name ?? 'Unnamed Session'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Join Code:{' '}
                      <span className="font-mono bg-gray-200 px-1 rounded">
                        {player.session?.joinCode ?? 'N/A'}
                      </span>
                    </p>
                  </div>
                )}

                {/* Team Info */}
                {player.team && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-1">Team</h4>
                    <p className="text-sm text-blue-700">
                      {player.team?.name ?? 'Unknown Team'}
                    </p>
                  </div>
                )}

                {/* Player Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {player.lastConnectedAt && (
                    <div>
                      <strong>Last Active:</strong>{' '}
                      {new Date(player.lastConnectedAt).toLocaleString()}
                    </div>
                  )}
                  <div>
                    <strong>Joined:</strong>{' '}
                    {new Date(player.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Player Actions */}
                <div className="space-y-3">
                  {/* Quick Status Updates */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Quick Status Update:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(
                        ['joined', 'ready', 'playing', 'disconnected'] as const
                      ).map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleQuickStatusUpdate(player.id, status)
                          }
                          disabled={
                            player.status === status ||
                            updatePlayerStatusMutation.isPending
                          }
                          className={`px-2 py-1 text-xs rounded ${
                            player.status === status
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : `bg-gray-100 text-gray-700 hover:bg-gray-200 ${
                                  status === 'ready'
                                    ? 'hover:bg-green-100 hover:text-green-700'
                                    : status === 'playing'
                                      ? 'hover:bg-blue-100 hover:text-blue-700'
                                      : status === 'joined'
                                        ? 'hover:bg-yellow-100 hover:text-yellow-700'
                                        : 'hover:bg-red-100 hover:text-red-700'
                                }`
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPlayer(player)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setPlayerToDelete({ id: player.id, name: player.name })
                      }
                      disabled={deletePlayerMutation.isPending}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Players
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {displayPlayers.length}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Joined</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {displayPlayers.filter((p) => p.status === 'joined').length}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready</h3>
            <p className="text-3xl font-bold text-green-600">
              {displayPlayers.filter((p) => p.status === 'ready').length}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Playing
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {displayPlayers.filter((p) => p.status === 'playing').length}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Disconnected
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {displayPlayers.filter((p) => p.status === 'disconnected').length}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Player Confirmation Dialog */}
      <ConfirmDialog
        isOpen={playerToDelete !== null}
        onClose={() => setPlayerToDelete(null)}
        onConfirm={() => {
          if (playerToDelete) {
            deletePlayerMutation.mutate(playerToDelete.id)
            setPlayerToDelete(null)
          }
        }}
        title="Remove Player"
        message={`Are you sure you want to remove ${playerToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Remove Player"
        variant="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/players')({
  component: PlayerManagementPage,
})
