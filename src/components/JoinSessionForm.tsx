import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sessionService } from '../lib/api/services'
import { showToast, toastHelpers } from '../lib/toast'
import { usePlayer } from '../contexts/PlayerContext'
import type { JoinSessionRequest, Session } from '../lib/api/types'

interface JoinSessionFormProps {
  onJoinSuccess?: (session: Session) => void
  initialJoinCode?: string
  sessionPreview?: Session
}

export function JoinSessionForm({
  onJoinSuccess,
  initialJoinCode = '',
  sessionPreview,
}: JoinSessionFormProps) {
  const { setPlayer } = usePlayer()
  const [joinCode, setJoinCode] = useState(initialJoinCode)
  const [playerName, setPlayerName] = useState('')

  // Update join code if initialJoinCode changes
  useEffect(() => {
    if (initialJoinCode) {
      setJoinCode(initialJoinCode)
    }
  }, [initialJoinCode])

  const joinSessionMutation = useMutation({
    mutationFn: (data: JoinSessionRequest) => sessionService.joinSession(data),
    onSuccess: (response) => {
      // Create player object from response
      const player = {
        id: response.playerId,
        name: response.playerName,
        session: response.session,
        status: 'joined' as const,
      }

      // Save player and token to context for app-wide access
      setPlayer(player as any, response.playerToken)

      showToast.success(response.message || 'Successfully joined session!')
      onJoinSuccess?.(response.session)
    },
    onError: (error) => {
      toastHelpers.operationError('join session', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinCode.length === 6 && playerName.trim()) {
      joinSessionMutation.mutate({
        joinCode,
        playerName: playerName.trim(),
      })
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {sessionPreview ? 'Enter Your Name' : 'Join Game Session'}
      </h2>

      {!sessionPreview && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Demo Mode:</strong> Try joining with code{' '}
            <code className="bg-blue-100 px-1 rounded">123456</code> or{' '}
            <code className="bg-blue-100 px-1 rounded">999999</code>
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-busy={joinSessionMutation.isPending}
      >
        {!sessionPreview && (
          <div>
            <label
              htmlFor="joinCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Session Code
            </label>
            <input
              type="text"
              id="joinCode"
              value={joinCode}
              onChange={(e) =>
                setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="123456"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              style={{ fontSize: '24px' }}
              maxLength={6}
              required
              readOnly={!!initialJoinCode}
              aria-describedby="joinCode-help"
            />
            <p id="joinCode-help" className="text-xs text-gray-500 mt-1">
              Enter the 6-digit code from your host
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="playerName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Name
          </label>
          <input
            type="text"
            id="playerName"
            name="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            autoComplete="name"
            inputMode="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            style={{ fontSize: '16px' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={
            joinCode.length !== 6 ||
            !playerName.trim() ||
            joinSessionMutation.isPending
          }
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-base btn-interactive"
        >
          {joinSessionMutation.isPending ? 'Joining...' : 'Join Session'}
        </button>
      </form>
    </div>
  )
}
