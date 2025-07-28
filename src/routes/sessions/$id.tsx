import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../../services/sessions'
import { playerService } from '../../lib/api/services/player.service'
import { gameLibraryService } from '../../lib/api/services/game-library.service'
import { sessionManagementService } from '../../lib/api/services/session-management.service'
import { useSessionManagement } from '../../hooks/useSessionManagement'

export const Route = createFileRoute('/sessions/$id')({
  component: SessionDetailsPage,
})

function SessionDetailsPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<
    'overview' | 'players' | 'games' | 'teams'
  >('overview')
  const [showAddGames, setShowAddGames] = useState(false)

  // Fetch session details
  const { data: session, isLoading } = useQuery({
    queryKey: ['sessions', id],
    queryFn: () => sessionService.getById(id),
  })

  // Fetch session players
  const { data: players = [] } = useQuery({
    queryKey: ['players', 'session', id],
    queryFn: () => playerService.getBySession(id),
  })

  // Fetch session teams
  const { data: teams = [] } = useQuery({
    queryKey: ['teams', 'session', id],
    queryFn: () => sessionManagementService.getSessionTeams(id),
  }) as { data: Array<any> }

  // Team management hooks
  const { createTeam, assignPlayersToTeam } = useSessionManagement(id)

  // Fetch available games for adding
  const { data: availableGames = [] } = useQuery({
    queryKey: ['game-library'],
    queryFn: gameLibraryService.getAll,
    enabled: showAddGames,
  })

  // Session mutations
  const startSessionMutation = useMutation({
    mutationFn: sessionService.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', id] })
    },
  })

  const completeSessionMutation = useMutation({
    mutationFn: sessionService.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', id] })
    },
  })

  const cancelSessionMutation = useMutation({
    mutationFn: sessionService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', id] })
    },
  })

  // Check if user just joined (for demo purposes)
  const justJoined =
    new URLSearchParams(window.location.search).get('joined') === 'true'

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading session...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to the Session!
              </h1>
              <p className="text-gray-600 mb-6">
                You've successfully joined session{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">{id}</code>
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  🎯 What's Next?
                </h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Wait for the host to start the games</li>
                  <li>• You'll see live scores and updates here</li>
                  <li>• Team assignments will appear below</li>
                </ul>
              </div>

              <Link
                to="/join"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Join Another Session
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {session.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>
                  <strong>Host:</strong> {session.host.name}
                </span>
                <span>
                  <strong>Date:</strong>{' '}
                  {new Date(session.date).toLocaleString()}
                </span>
                {session.location && (
                  <span>
                    <strong>Location:</strong> {session.location}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}
              >
                {session.status}
              </span>
              <div className="mt-2">
                <span className="text-sm text-gray-600">Join Code:</span>
                <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                  {session.joinCode}
                </span>
              </div>
            </div>
          </div>

          {/* Session Actions */}
          <div className="flex space-x-2">
            {session.status === 'SCHEDULED' && (
              <>
                <button
                  onClick={() => startSessionMutation.mutate(id)}
                  disabled={startSessionMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {startSessionMutation.isPending
                    ? 'Starting...'
                    : 'Start Session'}
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm('Are you sure you want to cancel this session?')
                    ) {
                      cancelSessionMutation.mutate(id)
                    }
                  }}
                  disabled={cancelSessionMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel Session
                </button>
              </>
            )}

            {session.status === 'IN_PROGRESS' && (
              <button
                onClick={() => completeSessionMutation.mutate(id)}
                disabled={completeSessionMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {completeSessionMutation.isPending
                  ? 'Completing...'
                  : 'Complete Session'}
              </button>
            )}

            <Link
              to="/sessions"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              ← Back to Sessions
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: '📋' },
                {
                  id: 'players',
                  label: 'Players',
                  icon: '👥',
                  count: players.length,
                },
                { id: 'games', label: 'Games', icon: '🎮' },
                { id: 'teams', label: 'Teams', icon: '🏆' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              session={session}
              players={players}
              justJoined={justJoined}
            />
          )}

          {activeTab === 'players' && (
            <PlayersTab session={session} players={players} />
          )}

          {activeTab === 'games' && (
            <GamesTab
              availableGames={availableGames}
              showAddGames={showAddGames}
              setShowAddGames={setShowAddGames}
            />
          )}
          {activeTab === 'players' && (
            <PlayersTab session={session} players={players} />
          )}
          {activeTab === 'teams' && (
            <TeamsTab
              players={players}
              teams={teams}
              onCreateTeam={createTeam}
              onAssignPlayers={assignPlayersToTeam}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Tab Components
function OverviewTab({ session, players, justJoined }: any) {
  return (
    <div className="space-y-6">
      {justJoined && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-green-400 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Welcome! You've successfully joined this session.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Session Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 text-sm">
              {session.description || 'No description provided'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Session Stats</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Players joined: {players.length}</div>
              <div>Status: {session.status}</div>
              <div>
                Created: {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/join"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <span className="text-2xl mb-2 block">📱</span>
              <h4 className="font-medium">Share Join Code</h4>
              <p className="text-sm text-gray-600 mt-1">
                Send the join code to friends
              </p>
            </div>
          </Link>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🎯</span>
              <h4 className="font-medium">Manage Games</h4>
              <p className="text-sm text-gray-600 mt-1">Add or remove games</p>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🏆</span>
              <h4 className="font-medium">Create Teams</h4>
              <p className="text-sm text-gray-600 mt-1">
                Organize players into teams
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function PlayersTab({ session, players }: any) {
  const queryClient = useQueryClient()

  // Fetch session readiness status
  const { data: readiness } = useQuery({
    queryKey: ['session-readiness', session.id],
    queryFn: () => sessionManagementService.getSessionReadiness(session.id),
    refetchInterval: 3000, // Poll every 3 seconds
  })

  // Player ready mutation
  const setPlayerReadyMutation = useMutation({
    mutationFn: ({ playerId, ready }: { playerId: string; ready: boolean }) =>
      sessionManagementService.setPlayerReady(session.id, playerId, ready),
    onSuccess: () => {
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['session-readiness', session.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['players', 'session', session.id],
      })
    },
  })

  // Check if session can start
  const { data: canStart } = useQuery({
    queryKey: ['session-can-start', session.id],
    queryFn: () => sessionManagementService.checkSessionCanStart(session.id),
    refetchInterval: 3000,
  }) as {
    data:
      | {
          canStart: boolean
          reasons: Array<string>
          checks: {
            hasGames: boolean
            playersReady: boolean
            playerCountValid: boolean
            sessionScheduled: boolean
          }
        }
      | undefined
  }

  const handleToggleReady = (playerId: string, currentReady: boolean) => {
    setPlayerReadyMutation.mutate({
      playerId,
      ready: !currentReady,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Session Players</h3>
        <div className="text-sm text-gray-600">
          {players.length} player{players.length !== 1 ? 's' : ''} joined
        </div>
      </div>

      {/* Session Readiness Status */}
      {readiness && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-900">Session Readiness</h4>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  readiness.allReady ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span className="text-sm font-medium text-blue-900">
                {readiness.readyPlayers}/{readiness.totalPlayers} Ready
              </span>
            </div>
          </div>

          {canStart && (
            <div className="mt-3 p-3 bg-white rounded border">
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-2">
                  Session Status:{' '}
                  {canStart.canStart ? '✅ Ready to Start' : '⏳ Not Ready'}
                </div>
                {!canStart.canStart && canStart.reasons.length > 0 && (
                  <ul className="text-red-600 text-xs space-y-1">
                    {canStart.reasons.map((reason: string, index: number) => (
                      <li key={index}>• {reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {players.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No players yet
          </h4>
          <p className="text-gray-600 mb-4">
            Share the join code <strong>{session.joinCode}</strong> with your
            friends!
          </p>
          <Link
            to="/join"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            📱 Share Join Code
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player: any) => {
            const isReady = player.status === 'ready'
            const canToggleReady =
              session.status === 'SCHEDULED' && player.status !== 'disconnected'

            return (
              <div
                key={player.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{player.name}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      player.status === 'ready'
                        ? 'bg-green-100 text-green-700'
                        : player.status === 'playing'
                          ? 'bg-blue-100 text-blue-700'
                          : player.status === 'joined'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {player.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <div>
                    Joined: {new Date(player.createdAt).toLocaleDateString()}
                  </div>
                  {player.team && <div>Team: {player.team.name}</div>}
                </div>

                {/* Ready Toggle Button */}
                {canToggleReady && (
                  <button
                    onClick={() => handleToggleReady(player.id, isReady)}
                    disabled={setPlayerReadyMutation.isPending}
                    className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isReady
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:opacity-50`}
                  >
                    {setPlayerReadyMutation.isPending
                      ? 'Updating...'
                      : isReady
                        ? '✓ Ready'
                        : 'Mark Ready'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function GamesTab({ availableGames, showAddGames, setShowAddGames }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Session Games</h3>
        <button
          onClick={() => setShowAddGames(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Games
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-yellow-400 text-xl mr-3">🚧</span>
          <div>
            <h4 className="font-medium text-yellow-800">
              Games Management Coming Soon
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              This feature will allow you to select and manage games for your
              session.
            </p>
          </div>
        </div>
      </div>

      {showAddGames && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-4">Available Games</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {availableGames.map((game: any) => (
              <div
                key={game.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{game.name}</h5>
                    <p className="text-sm text-gray-600">{game.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {game.minPlayers}-{game.maxPlayers} players
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowAddGames(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TeamsTab({
  players,
  teams,
  onCreateTeam,
  onAssignPlayers,
}: {
  players: Array<any>
  teams: Array<any>
  onCreateTeam: any
  onAssignPlayers: any
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<Array<string>>([])

  const handleCreateTeam = (formData: FormData) => {
    const name = formData.get('name') as string
    const color = formData.get('color') as string

    onCreateTeam.mutate(
      {
        name,
        color: color || undefined,
        playerIds: selectedPlayers,
      },
      {
        onSuccess: () => {
          setShowCreateForm(false)
          setSelectedPlayers([])
        },
      },
    )
  }

  const handleAssignPlayers = (teamId: string, playerIds: Array<string>) => {
    onAssignPlayers.mutate(
      { teamId, playerIds },
      {
        onSuccess: () => {
          setSelectedTeam(null)
          setSelectedPlayers([])
        },
      },
    )
  }

  const getUnassignedPlayers = () => {
    const assignedPlayerIds = teams.flatMap((team) =>
      team.players.map((p: any) => p.id),
    )
    return players.filter((player) => !assignedPlayerIds.includes(player.id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Team Management</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          + Create Team
        </button>
      </div>

      {/* Create Team Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium mb-4">Create New Team</h4>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCreateTeam(new FormData(e.currentTarget))
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Color (optional)
                </label>
                <input
                  name="color"
                  type="color"
                  className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Player Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Players (optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {getUnassignedPlayers().map((player) => (
                  <label
                    key={player.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlayers([...selectedPlayers, player.id])
                        } else {
                          setSelectedPlayers(
                            selectedPlayers.filter((id) => id !== player.id),
                          )
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{player.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={onCreateTeam.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {onCreateTeam.isPending ? 'Creating...' : 'Create Team'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setSelectedPlayers([])
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams List */}
      {teams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team: any) => (
            <div
              key={team.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: team.color || '#6B7280' }}
                  />
                  <h4 className="font-medium">{team.name}</h4>
                </div>
                <button
                  onClick={() =>
                    setSelectedTeam(selectedTeam === team.id ? null : team.id)
                  }
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  {selectedTeam === team.id ? 'Cancel' : 'Manage'}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Players: {team.players?.length || 0}
                </p>
                {team.players?.map((player: any) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                  >
                    <span className="text-sm">{player.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        player.status === 'ready'
                          ? 'bg-green-100 text-green-800'
                          : player.status === 'playing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {player.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Player Assignment Form */}
              {selectedTeam === team.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="text-sm font-medium mb-2">
                    Assign Players to Team
                  </h5>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto mb-3">
                    {getUnassignedPlayers().map((player) => (
                      <label
                        key={player.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlayers([
                                ...selectedPlayers,
                                player.id,
                              ])
                            } else {
                              setSelectedPlayers(
                                selectedPlayers.filter(
                                  (id) => id !== player.id,
                                ),
                              )
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-xs">{player.name}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      handleAssignPlayers(team.id, selectedPlayers)
                    }
                    disabled={
                      selectedPlayers.length === 0 || onAssignPlayers.isPending
                    }
                    className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {onAssignPlayers.isPending
                      ? 'Assigning...'
                      : `Assign ${selectedPlayers.length} Players`}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏆</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No teams yet
          </h4>
          <p className="text-gray-600 mb-4">
            Create teams to organize your players for games!
          </p>
        </div>
      )}

      {/* Unassigned Players */}
      {getUnassignedPlayers().length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-3">
            Unassigned Players ({getUnassignedPlayers().length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {getUnassignedPlayers().map((player) => (
              <div
                key={player.id}
                className="bg-white rounded-lg px-3 py-2 border border-gray-200"
              >
                <div className="font-medium text-sm">{player.name}</div>
                <div
                  className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                    player.status === 'ready'
                      ? 'bg-green-100 text-green-800'
                      : player.status === 'playing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {player.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
