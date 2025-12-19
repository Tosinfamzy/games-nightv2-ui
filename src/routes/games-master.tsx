import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gamesMasterService } from '../lib/api/services/games-master.service'
import { useGMDashboard } from '../hooks/useGMDashboard'
import StatCard from '../components/dashboard/StatCard'
import SessionMonitorCard from '../components/dashboard/SessionMonitorCard'

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

  // Fetch dashboard data for selected master with real-time updates
  const {
    dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    isConnected,
  } = useGMDashboard(selectedMaster || undefined)

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

  const selectedMasterData = gamesMasters.find((m) => m.id === selectedMaster)

  if (mastersLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading games masters...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Games Master Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor sessions, players, and games in real-time
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Games Master
          </button>
        </div>

        {/* Create Games Master Form */}
        {showCreateForm && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {createMasterMutation.isPending
                    ? 'Creating...'
                    : 'Create Games Master'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Games Master Selection */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
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

      {/* Dashboard Content */}
      {selectedMasterData && (
        <div className="space-y-6">
          {/* Master Profile Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
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
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-sm">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span className="text-sm">Connecting...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {dashboardLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          )}

          {/* Error State */}
          {dashboardError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  Failed to load dashboard data
                </span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                {dashboardError instanceof Error
                  ? dashboardError.message
                  : 'An error occurred'}
              </p>
            </div>
          )}

          {/* Dashboard Stats */}
          {dashboard && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Sessions"
                  value={dashboard.stats.totalSessions}
                  icon="📊"
                  color="blue"
                  subtitle="All time"
                />
                <StatCard
                  label="Active Sessions"
                  value={dashboard.stats.activeSessions}
                  icon="🎮"
                  color="green"
                  subtitle="Currently running"
                />
                <StatCard
                  label="Online Players"
                  value={dashboard.stats.onlinePlayers}
                  icon="👥"
                  color="purple"
                  subtitle={`of ${dashboard.stats.totalPlayers} total`}
                />
                <StatCard
                  label="Games in Progress"
                  value={dashboard.stats.gamesInProgress}
                  icon="🏆"
                  color="orange"
                  subtitle={`${dashboard.stats.gamesCompleted} completed`}
                />
              </div>

              {/* Sessions Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Session Monitor
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dashboard.sessions.length} session
                    {dashboard.sessions.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {dashboard.sessions.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No sessions yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first session to get started
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Create Session
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {dashboard.sessions.map((session) => (
                      <SessionMonitorCard key={session.id} session={session} />
                    ))}
                  </div>
                )}
              </div>

              {/* Dashboard Footer */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                <p>
                  Last updated:{' '}
                  {new Date(dashboard.lastUpdated).toLocaleTimeString()}
                </p>
                <p className="mt-1">
                  Dashboard updates automatically via WebSocket
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* All Games Masters List */}
      {!selectedMaster && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Games Masters
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select a games master to view their dashboard
            </p>
          </div>

          {gamesMasters.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No games masters yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first games master to get started
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Games Master
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {gamesMasters.map((master) => (
                <div
                  key={master.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Dashboard
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
