import { useGameTimer } from '../hooks/useGameTimer';

interface GameTimerProps {
  gameId: string;
  showTeamName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Game timer display component
 * Shows countdown timer for the current turn
 */
export default function GameTimer({
  gameId,
  showTeamName = true,
  size = 'md',
  className = '',
}: GameTimerProps) {
  const {
    formattedTime,
    currentTeamName,
    isWarning,
    isExpired,
    autoAdvanced,
    hasTimer,
    isConnected,
  } = useGameTimer(gameId);

  // Don't show timer if game doesn't have one
  if (!hasTimer) {
    return null;
  }

  // Size variants
  const sizeClasses = {
    sm: {
      container: 'px-4 py-3',
      time: 'text-3xl',
      label: 'text-xs',
      team: 'text-sm',
    },
    md: {
      container: 'px-6 py-4',
      time: 'text-5xl',
      label: 'text-sm',
      team: 'text-base',
    },
    lg: {
      container: 'px-8 py-6',
      time: 'text-7xl',
      label: 'text-base',
      team: 'text-lg',
    },
  };

  const sizes = sizeClasses[size];

  // Color based on state
  const getColorClasses = () => {
    if (isExpired) {
      return 'bg-red-600 text-white border-red-700';
    }
    if (isWarning) {
      return 'bg-orange-500 text-white border-orange-600 animate-pulse';
    }
    return 'bg-blue-600 text-white border-blue-700';
  };

  return (
    <div className={`${className}`}>
      <div
        className={`rounded-lg border-2 ${sizes.container} ${getColorClasses()} transition-all duration-300 shadow-lg`}
      >
        {/* Connection status */}
        {!isConnected && (
          <div className="mb-2 flex items-center justify-center gap-2 text-yellow-200">
            <svg
              className="w-4 h-4 animate-spin"
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
            <span className={sizes.label}>Connecting...</span>
          </div>
        )}

        {/* Team name */}
        {showTeamName && currentTeamName && (
          <div className="text-center mb-2">
            <p className={`font-semibold ${sizes.team} opacity-90`}>
              {currentTeamName}'s Turn
            </p>
          </div>
        )}

        {/* Timer display */}
        <div className="text-center">
          <div className={`font-mono font-bold ${sizes.time} tracking-wider`}>
            {formattedTime}
          </div>
          <p className={`${sizes.label} opacity-75 mt-1`}>
            {isExpired ? "Time's Up!" : 'Time Remaining'}
          </p>
        </div>

        {/* Auto-advanced notification */}
        {autoAdvanced && (
          <div className="mt-3 text-center">
            <p className={`${sizes.label} bg-white bg-opacity-20 rounded px-2 py-1 inline-block`}>
              Turn auto-advanced due to timeout
            </p>
          </div>
        )}

        {/* Warning message */}
        {isWarning && !isExpired && (
          <div className="mt-3 text-center">
            <p className={`${sizes.label} font-semibold animate-bounce`}>
              ⚠️ Hurry up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
