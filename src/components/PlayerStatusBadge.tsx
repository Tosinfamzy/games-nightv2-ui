interface PlayerStatusBadgeProps {
  isOnline: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Player online/offline status indicator
 */
export default function PlayerStatusBadge({
  isOnline,
  showLabel = false,
  size = 'md',
  className = '',
}: PlayerStatusBadgeProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const dotSize = sizeClasses[size]

  if (showLabel) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
          isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        } ${className}`}
      >
        <span
          className={`${dotSize} rounded-full ${
            isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}
        />
        {isOnline ? 'Online' : 'Offline'}
      </span>
    )
  }

  return (
    <span
      className={`inline-block ${dotSize} rounded-full ${
        isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
      } ${className}`}
      title={isOnline ? 'Online' : 'Offline'}
      aria-label={isOnline ? 'Player is online' : 'Player is offline'}
    />
  )
}
