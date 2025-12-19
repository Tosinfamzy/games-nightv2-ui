import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sessionService } from '../lib/api/services'
import { usePlayer } from '../contexts/PlayerContext'
import { showToast, toastHelpers } from '../lib/toast'

export const Route = createFileRoute('/rejoin')({
  component: RejoinPage,
})

function RejoinPage() {
  const navigate = useNavigate()
  const { playerToken, setPlayer, clearPlayer } = usePlayer()
  const [manualToken, setManualToken] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [attemptedAutoRejoin, setAttemptedAutoRejoin] = useState(false)

  const rejoinMutation = useMutation({
    mutationFn: (token: string) => sessionService.rejoinSession(token),
    onSuccess: (response) => {
      // Create player object from response
      const player = {
        id: response.playerId,
        name: response.playerName,
        session: response.session,
        status: 'joined' as const,
      }

      // Save player and fresh token to context
      setPlayer(player as any, response.playerToken)

      showToast.success(response.message || 'Successfully rejoined session!')

      // Navigate to the session
      navigate({ to: '/sessions/$id', params: { id: response.session.id } })
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to rejoin session'

      if (errorMessage.includes('expired')) {
        showToast.error('Your session has expired. Please join again.')
      } else if (errorMessage.includes('Invalid')) {
        showToast.error('Invalid token. Please join the session again.')
      } else {
        toastHelpers.operationError('rejoin session', error)
      }

      // Clear invalid token
      clearPlayer()
      setShowManualInput(true)
    },
  })

  // Automatic rejoin on mount if token exists in localStorage
  useEffect(() => {
    if (playerToken && !attemptedAutoRejoin) {
      setAttemptedAutoRejoin(true)
      rejoinMutation.mutate(playerToken)
    }
  }, [playerToken, attemptedAutoRejoin])

  const handleManualRejoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualToken.trim()) {
      rejoinMutation.mutate(manualToken.trim())
    }
  }

  const handleJoinFresh = () => {
    navigate({ to: '/join' })
  }

  // Show loading state during automatic rejoin
  if (playerToken && !attemptedAutoRejoin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Rejoining your session...</p>
        </div>
      </div>
    )
  }

  // Show loading state during manual rejoin
  if (rejoinMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Rejoining session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Rejoin Session</h1>

        {!showManualInput && !playerToken ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No saved session found. You can either enter your player token to rejoin, or join a new session.
              </p>
            </div>

            <button
              onClick={() => setShowManualInput(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
            >
              Enter Token to Rejoin
            </button>

            <button
              onClick={handleJoinFresh}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 font-medium"
            >
              Join New Session
            </button>
          </div>
        ) : showManualInput || (!playerToken && !attemptedAutoRejoin) ? (
          <form onSubmit={handleManualRejoin} className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Lost your session?</strong> If you have your player token, enter it below to rejoin.
              </p>
            </div>

            <div>
              <label
                htmlFor="playerToken"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Player Token
              </label>
              <textarea
                id="playerToken"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste your player token here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono resize-none"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your token starts with "eyJ..." and was given to you when you joined
              </p>
            </div>

            <button
              type="submit"
              disabled={!manualToken.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Rejoin Session
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleJoinFresh}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 font-medium"
            >
              Join New Session Instead
            </button>
          </form>
        ) : null}

        {rejoinMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Failed to rejoin:</strong> Your session may have expired or the token is invalid.
              Please try joining a new session.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
