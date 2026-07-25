import { useEffect, useState } from 'react'

interface SessionStatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
}

export function SessionStatusBadge({
  status,
  size = 'md',
  showDescription = false,
}: SessionStatusBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Trigger animation when status changes
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 600)
    return () => clearTimeout(timer)
  }, [status])

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: '📅',
          label: 'Scheduled',
          description: 'Session is planned and ready for players to join',
          pulse: false,
        }
      case 'IN_PROGRESS':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: '🎮',
          label: 'In Progress',
          description: 'Games are being played',
          pulse: true,
        }
      case 'COMPLETED':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: '✅',
          label: 'Completed',
          description: 'Session has ended',
          pulse: false,
        }
      case 'CANCELLED':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: '❌',
          label: 'Cancelled',
          description: 'Session was cancelled',
          pulse: false,
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: '❓',
          label: status,
          description: 'Unknown status',
          pulse: false,
        }
    }
  }

  const config = getStatusConfig(status)

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div
        className={`
          inline-flex items-center gap-2 rounded-full border font-medium
          ${sizeClasses[size]}
          ${config.color}
          ${isAnimating ? 'scale-110' : 'scale-100'}
          ${config.pulse ? 'animate-pulse' : ''}
          transition-all duration-300 ease-out
        `}
      >
        <span className="text-base">{config.icon}</span>
        <span>{config.label}</span>
      </div>
      {showDescription && (
        <p className="text-xs text-gray-600 max-w-xs">{config.description}</p>
      )}
    </div>
  )
}
