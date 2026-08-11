import { useEffect, useState } from 'react'

interface StartSessionButtonProps {
  onStart: () => void
  isLoading: boolean
  isReady: boolean
  disabled?: boolean
  readyToStart?: {
    playersReady: boolean
    teamsFormed: boolean
    gamesAvailable: boolean
  }
  /**
   * Human-readable reasons the session can't start yet, straight from the
   * backend's can-start check. When present, these are shown instead of the
   * client-side checklist so the button never disagrees with the server.
   */
  reasons?: Array<string>
  /**
   * Non-blocking advisories from the backend (e.g. a game short on players).
   * Shown even when the session CAN start — people arrive over the night, so
   * these are flagged, not enforced.
   */
  warnings?: Array<string>
}

export function StartSessionButton({
  onStart,
  isLoading,
  isReady,
  disabled = false,
  readyToStart,
  reasons,
  warnings,
}: StartSessionButtonProps) {
  const [showCelebration, setShowCelebration] = useState(false)

  // Show celebration when becomes ready
  useEffect(() => {
    if (isReady && !isLoading) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isReady, isLoading])

  const isDisabled = disabled || isLoading || !isReady

  return (
    <div className="relative">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute -inset-4 animate-ping opacity-75 bg-green-400 rounded-full" />
      )}

      <button
        onClick={onStart}
        disabled={isDisabled}
        className={`
          relative px-8 py-4 rounded-lg font-semibold text-lg
          transition-all duration-300 transform
          ${
            isReady && !isDisabled
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:from-green-600 hover:to-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
          ${isLoading ? 'animate-pulse' : ''}
          ${showCelebration ? 'ring-4 ring-green-300 scale-105' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {isLoading ? '⏳' : isReady ? '🚀' : '⏸️'}
          </span>
          <span>{isLoading ? 'Starting...' : 'Start Session'}</span>
          {isReady && !isLoading && <span className="animate-bounce">✨</span>}
        </div>
      </button>

      {/* Blockers straight from the backend — authoritative, so the button
          never claims ready when the server would reject the start. */}
      {!isReady && reasons && reasons.length > 0 && (
        <div className="mt-3 space-y-1 text-sm">
          {reasons.map((reason) => (
            <div key={reason} className="flex items-center gap-2 text-gray-500">
              <span>⏳</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Fallback client-side checklist when no backend reasons are provided. */}
      {!isReady && (!reasons || reasons.length === 0) && readyToStart && (
        <div className="mt-3 space-y-1 text-sm">
          <div
            className={`flex items-center gap-2 ${
              readyToStart.playersReady ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <span>{readyToStart.playersReady ? '✅' : '⏳'}</span>
            <span>All players ready</span>
          </div>
          <div
            className={`flex items-center gap-2 ${
              readyToStart.teamsFormed ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <span>{readyToStart.teamsFormed ? '✅' : '⏳'}</span>
            <span>Teams formed</span>
          </div>
          <div
            className={`flex items-center gap-2 ${
              readyToStart.gamesAvailable ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <span>{readyToStart.gamesAvailable ? '✅' : '⏳'}</span>
            <span>Games available</span>
          </div>
        </div>
      )}

      {/* Non-blocking warnings — you can still start; these just flag that a
          game is short-handed for now (more guests may arrive). */}
      {warnings && warnings.length > 0 && (
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1 text-sm">
          <p className="font-medium text-amber-800">
            ⚠️ Heads-up (won't stop you starting):
          </p>
          {warnings.map((warning) => (
            <div
              key={warning}
              className="flex items-start gap-2 text-amber-700"
            >
              <span>•</span>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Encouraging message when ready */}
      {isReady && !isLoading && (
        <p className="mt-2 text-center text-green-600 font-medium animate-pulse">
          🎉 Everything is ready! Let's start!
        </p>
      )}
    </div>
  )
}
