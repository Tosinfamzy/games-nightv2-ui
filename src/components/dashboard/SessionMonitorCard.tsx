import { Link } from '@tanstack/react-router'
import type { DashboardSession } from '../../lib/api/types'
import OnlinePlayerCount from '../OnlinePlayerCount'
import GameProgressCard from './GameProgressCard'

interface SessionMonitorCardProps {
  session: DashboardSession
  onViewDetails?: () => void
  className?: string
}

/**
 * Session monitoring card for GM Dashboard
 * Shows session overview with online players and active games
 */
export default function SessionMonitorCard({
  session,
  onViewDetails,
  className = '',
}: SessionMonitorCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
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

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Session Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {session.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📍 {session.location || 'No location'}</span>
              <span>•</span>
              <span>📅 {formatDate(session.scheduledFor)}</span>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}
          >
            {session.status}
          </span>
        </div>

        {/* Players Online Status */}
        <div className="mt-3">
          <OnlinePlayerCount
            players={session.players as any}
            showDetails={false}
          />
        </div>
      </div>

      {/* Games Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Active Games</h4>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
              {session.gamesInProgress} in progress
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium">
              {session.gamesCompleted} completed
            </span>
          </div>
        </div>

        {/* Game Cards */}
        {session.games.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <div className="text-3xl mb-2">🎮</div>
            <p className="text-sm">No games yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {session.games.map((game) => (
              <GameProgressCard
                key={game.id}
                game={game}
                sessionId={session.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
        <Link
          to="/sessions/$id"
          params={{ id: session.id }}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
        >
          View Details
        </Link>
        {session.status === 'SCHEDULED' && (
          <button
            onClick={onViewDetails}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Manage
          </button>
        )}
      </div>
    </div>
  )
}
