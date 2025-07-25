import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../../services/sessions'
import { playerService } from '../../lib/api/services/player.service'
import { gameLibraryService } from '../../lib/api/services/game-library.service'

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

          {activeTab === 'teams' && <TeamsTab players={players} />}
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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Session Players</h3>
        <div className="text-sm text-gray-600">
          {players.length} player{players.length !== 1 ? 's' : ''} joined
        </div>
      </div>

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
          {players.map((player: any) => (
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
              <div className="text-sm text-gray-600">
                <div>
                  Joined: {new Date(player.createdAt).toLocaleDateString()}
                </div>
                {player.team && <div>Team: {player.team.name}</div>}
              </div>
            </div>
          ))}
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

function TeamsTab({ players }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Team Management</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          + Create Team
        </button>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-purple-400 text-xl mr-3">🏆</span>
          <div>
            <h4 className="font-medium text-purple-800">
              Team Management Coming Soon
            </h4>
            <p className="text-sm text-purple-700 mt-1">
              This feature will allow you to create teams and assign players
              automatically or manually.
            </p>
          </div>
        </div>
      </div>

      {players.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Available Players</h4>
          <div className="grid gap-2 md:grid-cols-2">
            {players.map((player: any) => (
              <div
                key={player.id}
                className="p-3 border border-gray-200 rounded-lg flex justify-between items-center"
              >
                <span>{player.name}</span>
                <span className="text-sm text-gray-500">
                  {player.team ? `Team: ${player.team.name}` : 'No team'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
