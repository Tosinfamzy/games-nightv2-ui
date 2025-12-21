import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamService } from '../lib/api/services/team.service'
import { showToast } from '../lib/toast'
import { ConfirmDialog } from './ConfirmDialog'

interface QuickTeamActionsProps {
  gameId: string
  sessionId: string
  teamCount: number
  hasPlayers: boolean
  disabled?: boolean
}

export function QuickTeamActions({
  gameId,
  sessionId,
  teamCount,
  hasPlayers,
  disabled = false,
}: QuickTeamActionsProps) {
  const [showShuffleConfirm, setShowShuffleConfirm] = useState(false)
  const [showRebalanceConfirm, setShowRebalanceConfirm] = useState(false)
  const queryClient = useQueryClient()

  // Shuffle players mutation
  const shuffleMutation = useMutation({
    mutationFn: () => teamService.shufflePlayers(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'game', gameId] })
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
      showToast.success('Players shuffled successfully!')
      setShowShuffleConfirm(false)
    },
    onError: (error) => {
      showToast.error(
        `Failed to shuffle players: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      setShowShuffleConfirm(false)
    },
  })

  // Rebalance teams mutation
  const rebalanceMutation = useMutation({
    mutationFn: () => teamService.rebalanceTeams(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'game', gameId] })
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
      showToast.success('Teams rebalanced successfully!')
      setShowRebalanceConfirm(false)
    },
    onError: (error) => {
      showToast.error(
        `Failed to rebalance teams: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      setShowRebalanceConfirm(false)
    },
  })

  const isProcessing = shuffleMutation.isPending || rebalanceMutation.isPending

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Shuffle Button */}
        <button
          onClick={() => setShowShuffleConfirm(true)}
          disabled={disabled || !hasPlayers || isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          title="Randomly redistribute all players across teams"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="font-medium">Shuffle</span>
        </button>

        {/* Rebalance Button */}
        <button
          onClick={() => setShowRebalanceConfirm(true)}
          disabled={disabled || !hasPlayers || isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          title="Redistribute players to create balanced teams based on skill"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
            />
          </svg>
          <span className="font-medium">Rebalance</span>
        </button>

        {/* Team Info */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <span className="text-sm text-gray-600">
            {teamCount} {teamCount === 1 ? 'team' : 'teams'}
          </span>
        </div>
      </div>

      {/* Shuffle Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showShuffleConfirm}
        onClose={() => setShowShuffleConfirm(false)}
        onConfirm={() => shuffleMutation.mutate()}
        title="Shuffle Players?"
        message="This will randomly redistribute all players across the teams. Current team assignments will be lost."
        confirmLabel="Shuffle Players"
        variant="warning"
      />

      {/* Rebalance Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRebalanceConfirm}
        onClose={() => setShowRebalanceConfirm(false)}
        onConfirm={() => rebalanceMutation.mutate()}
        title="Rebalance Teams?"
        message="This will redistribute players to create balanced teams based on skill levels and player count. Current team assignments will be adjusted."
        confirmLabel="Rebalance Teams"
        variant="info"
      />
    </>
  )
}
