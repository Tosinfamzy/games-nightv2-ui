import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionManagementService } from '../lib/api/services/session-management.service'
import type { CreateTeamDTO } from '../lib/api/services/session-management.service'

interface Player {
  id: string
  name: string
  status: 'ready' | 'not_ready' | 'playing'
}

interface ManualTeamCreatorProps {
  sessionId: string
  players: Array<Player>
  onTeamCreated?: () => void
  onCancel?: () => void
}

const TEAM_COLORS = [
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500' },
  { name: 'Red', value: '#EF4444', bg: 'bg-red-500' },
  { name: 'Green', value: '#10B981', bg: 'bg-green-500' },
  { name: 'Purple', value: '#8B5CF6', bg: 'bg-purple-500' },
  { name: 'Orange', value: '#F59E0B', bg: 'bg-orange-500' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500' },
  { name: 'Teal', value: '#14B8A6', bg: 'bg-teal-500' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500' },
]

export function ManualTeamCreator({
  sessionId,
  players,
  onTeamCreated,
  onCancel,
}: ManualTeamCreatorProps) {
  const queryClient = useQueryClient()
  const [teamName, setTeamName] = useState('')
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0])
  const [selectedPlayers, setSelectedPlayers] = useState<Array<string>>([])

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: CreateTeamDTO) => {
      return await sessionManagementService.createTeam(sessionId, teamData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'session', sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['players', 'session', sessionId],
      })
      onTeamCreated?.()
      // Reset form
      setTeamName('')
      setSelectedColor(TEAM_COLORS[0])
      setSelectedPlayers([])
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return

    const teamData: CreateTeamDTO = {
      name: teamName.trim(),
      color: selectedColor.value,
      playerIds: selectedPlayers,
    }

    createTeamMutation.mutate(teamData)
  }

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    )
  }

  const availablePlayers = players.filter(
    (player) =>
      // Only show players who aren't already assigned to teams
      player.status !== 'playing',
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Create New Team</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team Name */}
        <div>
          <label
            htmlFor="teamName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Team Name *
          </label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter team name"
            required
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TEAM_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedColor.name === color.name
                    ? 'border-gray-900 ring-2 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${color.bg}`} />
                  <span className="text-sm font-medium">{color.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Player Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Players (Optional)
          </label>
          <div className="text-xs text-gray-500 mb-3">
            You can add players now or assign them later
          </div>

          {availablePlayers.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No available players to assign
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
              {availablePlayers.map((player) => (
                <label
                  key={player.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(player.id)}
                    onChange={() => togglePlayerSelection(player.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {player.name}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          player.status === 'ready'
                            ? 'bg-green-100 text-green-700'
                            : player.status === 'not_ready'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {player.status === 'not_ready'
                          ? 'Not Ready'
                          : player.status}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {selectedPlayers.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {selectedPlayers.length} player
              {selectedPlayers.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={createTeamMutation.isPending || !teamName.trim()}
            className="w-full sm:flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-base"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Error Display */}
        {createTeamMutation.error && (
          <div className="text-red-600 text-sm">
            Error:{' '}
            {createTeamMutation.error instanceof Error
              ? createTeamMutation.error.message
              : 'Failed to create team'}
          </div>
        )}
      </form>
    </div>
  )
}
