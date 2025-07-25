import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../services/sessions'
import { gamesMasterService } from '../lib/api/services/games-master.service'
import { playerService } from '../lib/api/services/player.service'
import type { Session } from '../types'
import type { CreateSessionDTO, UpdateSessionDTO } from '../services/sessions'

function SessionsPage() {
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Fetch sessions
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionService.getAll,
  })

  // Fetch games masters for dropdown
  const { data: gamesMasters = [] } = useQuery({
    queryKey: ['games-masters'],
    queryFn: gamesMasterService.getAll,
  })

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: sessionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      setShowCreateForm(false)
    },
  })

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionDTO }) =>
      sessionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      setEditingSession(null)
    },
  })

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: sessionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // Session status mutations
  const startSessionMutation = useMutation({
    mutationFn: sessionService.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const completeSessionMutation = useMutation({
    mutationFn: sessionService.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const cancelSessionMutation = useMutation({
    mutationFn: sessionService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // Form handlers
  const handleCreateSession = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateSessionDTO = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      date: new Date(formData.get('date') as string).toISOString(),
      location: formData.get('location') as string,
      gamesMasterId: formData.get('hostId') as string,
    }
    createSessionMutation.mutate(data)
  }

  const handleUpdateSession = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingSession) return

    const formData = new FormData(e.currentTarget)
    const data: UpdateSessionDTO = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      date: new Date(formData.get('date') as string).toISOString(),
      location: formData.get('location') as string,
    }
    updateSessionMutation.mutate({ id: editingSession.id, data })
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

  // Filter sessions by status
  const filteredSessions = statusFilter
    ? sessions.filter((session) => session.status === statusFilter)
    : sessions

  if (sessionsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading sessions...</div>
      </div>
    )
  }

  if (sessionsError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Error loading sessions: {sessionsError.message}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Game Sessions</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Session
          </button>
        </div>

        {/* Status Filter */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sessions</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Create Session Form */}
        {showCreateForm && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create New Session</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter session name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Games Master
                  </label>
                  <select
                    name="hostId"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a games master</option>
                    {gamesMasters.map((master) => (
                      <option key={master.id} value={master.id}>
                        {master.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Session description (optional)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Session location (optional)"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={createSessionMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createSessionMutation.isPending
                    ? 'Creating...'
                    : 'Create Session'}
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

        {/* Edit Session Form */}
        {editingSession && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Edit Session</h2>
            <form onSubmit={handleUpdateSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingSession.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    defaultValue={new Date(editingSession.date)
                      .toISOString()
                      .slice(0, 16)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingSession.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingSession.location || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={updateSessionMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {updateSessionMutation.isPending
                    ? 'Updating...'
                    : 'Update Session'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sessions Grid */}
        <div className="space-y-6">
          {/* Session Flow Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📋 Session Management Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border">
                <div className="font-medium text-blue-900 mb-1">
                  1. Create Session
                </div>
                <div className="text-blue-700">
                  Set up basic session details and get join code
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="font-medium text-blue-900 mb-1">
                  2. Players Join
                </div>
                <div className="text-blue-700">
                  Players use join code to enter session
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="font-medium text-blue-900 mb-1">
                  3. Setup Games/Teams
                </div>
                <div className="text-blue-700">
                  Add games and organize teams (optional)
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="font-medium text-blue-900 mb-1">
                  4. Start & Play
                </div>
                <div className="text-blue-700">
                  Begin session and track scores
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onEdit={setEditingSession}
                onDelete={(id) => {
                  if (
                    confirm('Are you sure you want to delete this session?')
                  ) {
                    deleteSessionMutation.mutate(id)
                  }
                }}
                onStart={(id) => startSessionMutation.mutate(id)}
                onComplete={(id) => completeSessionMutation.mutate(id)}
                onCancel={(id) => {
                  if (
                    confirm('Are you sure you want to cancel this session?')
                  ) {
                    cancelSessionMutation.mutate(id)
                  }
                }}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {statusFilter
                ? 'No sessions found with the selected status.'
                : 'No sessions created yet.'}
            </p>
            {!statusFilter && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Session
              </button>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Sessions
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {sessions.length}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Scheduled
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {sessions.filter((s) => s.status === 'SCHEDULED').length}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              In Progress
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {sessions.filter((s) => s.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Completed
            </h3>
            <p className="text-3xl font-bold text-gray-600">
              {sessions.filter((s) => s.status === 'COMPLETED').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SessionCardProps {
  session: Session
  onEdit: (session: Session) => void
  onDelete: (id: string) => void
  onStart: (id: string) => void
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  getStatusColor: (status: string) => string
}

function SessionCard({
  session,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onCancel,
  getStatusColor,
}: SessionCardProps) {
  const [showPlayers, setShowPlayers] = useState(false)

  // Fetch players for this session when expanded
  const { data: sessionPlayers = [], isLoading: playersLoading } = useQuery({
    queryKey: ['players', 'session', session.id],
    queryFn: () => playerService.getBySession(session.id),
    enabled: showPlayers,
  })

  return (
    <div className="border rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
      {/* Session Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{session.name}</h2>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}
        >
          {session.status}
        </span>
      </div>

      {/* Session Details */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div>
          <strong>Host:</strong> {session.host.name}
        </div>
        <div>
          <strong>Date:</strong> {new Date(session.date).toLocaleString()}
        </div>
        {session.location && (
          <div>
            <strong>Location:</strong> {session.location}
          </div>
        )}
        <div>
          <strong>Join Code:</strong>
          <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded text-sm">
            {session.joinCode}
          </span>
        </div>
      </div>

      {session.description && (
        <p className="text-gray-600 mb-4 text-sm">{session.description}</p>
      )}

      {/* Players Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowPlayers(!showPlayers)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showPlayers ? 'Hide Players' : 'Show Players'}
          {showPlayers && ` (${sessionPlayers.length})`}
        </button>

        {showPlayers && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            {playersLoading ? (
              <p className="text-sm text-gray-500">Loading players...</p>
            ) : sessionPlayers.length > 0 ? (
              <div className="space-y-1">
                {sessionPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>{player.name}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
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
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No players joined yet</p>
            )}
          </div>
        )}
      </div>

      {/* Session Actions */}
      <div className="space-y-2">
        {/* Status Management */}
        {session.status === 'SCHEDULED' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onStart(session.id)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Start Session
            </button>
            <button
              onClick={() => onCancel(session.id)}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        )}

        {session.status === 'IN_PROGRESS' && (
          <button
            onClick={() => onComplete(session.id)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Complete Session
          </button>
        )}

        {/* Edit/Delete Actions */}
        <div className="flex space-x-2">
          <Link
            to="/sessions/$id"
            params={{ id: session.id }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 no-underline"
          >
            View Details
          </Link>
          <button
            onClick={() => onEdit(session)}
            disabled={session.status === 'COMPLETED'}
            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(session.id)}
            disabled={session.status === 'IN_PROGRESS'}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/sessions')({
  component: SessionsPage,
})
