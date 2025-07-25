import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gamesMasterService } from '../lib/api/services/games-master.service'
import { sessionService } from '../lib/api/services/session.service'

export const Route = createFileRoute('/games-master')({
  component: GamesMasterDashboard,
})

function GamesMasterDashboard() {
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedMaster, setSelectedMaster] = useState<string>('')

  // Fetch all games masters
  const { data: gamesMasters = [], isLoading: mastersLoading } = useQuery({
    queryKey: ['games-masters'],
    queryFn: gamesMasterService.getAll,
  })

  // Fetch sessions for selected master
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionService.getAll,
    enabled: !!selectedMaster,
  })

  // Create games master mutation
  const createMasterMutation = useMutation({
    mutationFn: gamesMasterService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games-masters'] })
      setShowCreateForm(false)
    },
  })

  const handleCreateMaster = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createMasterMutation.mutate({
      name: formData.get('name') as string,
    })
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

  const selectedMasterData = gamesMasters.find((m) => m.id === selectedMaster)
  const masterSessions = selectedMaster
    ? sessions.filter((s) => s.host.id === selectedMaster)
    : []

  if (mastersLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading games masters...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Games Master Dashboard
          </h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Games Master
          </button>
        </div>

        {/* Create Games Master Form */}
        {showCreateForm && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Create New Games Master
            </h2>
            <form onSubmit={handleCreateMaster} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter games master name"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={createMasterMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMasterMutation.isPending
                    ? 'Creating...'
                    : 'Create Games Master'}
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

        {/* Games Master Selection */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Games Master
          </label>
          <select
            value={selectedMaster}
            onChange={(e) => setSelectedMaster(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a games master</option>
            {gamesMasters.map((master) => (
              <option key={master.id} value={master.id}>
                {master.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Games Master Overview */}
      {selectedMasterData && (
        <div className="mb-8">
          {/* Master Profile Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedMasterData.name}
                </h2>
                <p className="opacity-90">Games Master</p>
                <p className="text-sm opacity-75 mt-1">
                  Member since{' '}
                  {new Date(selectedMasterData.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {masterSessions.length}
                </div>
                <div className="text-sm opacity-75">Total Sessions</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      masterSessions.filter((s) => s.status === 'IN_PROGRESS')
                        .length
                    }
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      masterSessions.filter((s) => s.status === 'SCHEDULED')
                        .length
                    }
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {
                      masterSessions.filter((s) => s.status === 'COMPLETED')
                        .length
                    }
                  </p>
                </div>
                <div className="p-2 bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Quick Actions
                  </p>
                  <div className="space-y-1 mt-2">
                    <button className="w-full text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                      New Session
                    </button>
                    <button className="w-full text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {selectedMaster && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Sessions for {selectedMasterData?.name}
            </h2>
          </div>

          {sessionsLoading ? (
            <div className="p-6 text-center">Loading sessions...</div>
          ) : masterSessions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No sessions found for this games master.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {masterSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                >
                  {/* Session Header */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {session.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}
                      >
                        {session.status}
                      </span>
                    </div>

                    {/* Session Info */}
                    <div className="space-y-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 8a6 6 0 01-7.743 5.743L10 14l-0.257-0.257A6 6 0 1118 8zM10 4a4 4 0 100 8 4 4 0 000-8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                          {session.joinCode}
                        </span>
                      </div>

                      {session.location && (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{session.location}</span>
                        </div>
                      )}
                    </div>

                    {session.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {session.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                        View Details
                      </button>
                      {session.status === 'SCHEDULED' && (
                        <button className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
                          Start
                        </button>
                      )}
                      {session.status === 'IN_PROGRESS' && (
                        <button className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors">
                          Manage
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Games Masters List */}
      {!selectedMaster && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              All Games Masters
            </h2>
          </div>

          {gamesMasters.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No games masters created yet.
            </div>
          ) : (
            <div className="divide-y">
              {gamesMasters.map((master) => (
                <div key={master.id} className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {master.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Created:{' '}
                        {new Date(master.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedMaster(master.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View Sessions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
