import { useGameTimer } from '../hooks/useGameTimer';

interface TimerControlsProps {
  gameId: string;
  onAdvanceTurn?: () => void;
  onPauseTimer?: () => void;
  onResumeTimer?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Timer control buttons for Games Master
 * Note: Actual timer control is handled by game service, not timer-specific endpoints
 */
export default function TimerControls({
  gameId,
  onAdvanceTurn,
  onPauseTimer,
  onResumeTimer,
  disabled = false,
  className = '',
}: TimerControlsProps) {
  const {
    hasTimer,
    isExpired,
    isWarning,
    formattedTime,
  } = useGameTimer(gameId);

  if (!hasTimer) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No timer configured for this game
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Timer status */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Timer Status:</span>
          <span className={`text-sm font-mono ${
            isExpired ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-blue-600'
          }`}>
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex gap-2">
        {onAdvanceTurn && (
          <button
            onClick={onAdvanceTurn}
            disabled={disabled}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Advance Turn
          </button>
        )}

        {onPauseTimer && (
          <button
            onClick={onPauseTimer}
            disabled={disabled}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            title="Pause timer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        )}

        {onResumeTimer && (
          <button
            onClick={onResumeTimer}
            disabled={disabled}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            title="Resume timer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Timer automatically advances turn when time expires
      </p>
    </div>
  );
}
