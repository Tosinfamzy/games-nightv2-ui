import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import GameHistoryList from '../components/GameHistoryList'
import Leaderboard from '../components/Leaderboard'

function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'games' | 'leaderboard'>('games')

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link
          to="/sessions"
          className="text-blue-500 hover:text-blue-600 no-underline inline-flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Sessions
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Game History</h1>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('games')}
          className={`px-4 py-3 font-medium whitespace-nowrap min-w-max ${
            activeTab === 'games'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Games
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-3 font-medium whitespace-nowrap min-w-max ${
            activeTab === 'leaderboard'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl">
        {activeTab === 'games' && <GameHistoryList />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})
