/**
 * Loading skeleton for better perceived performance
 */
export default function LoadingSkeleton({
  count = 1,
  height = 'h-4',
  className = '',
}: {
  count?: number
  height?: string
  className?: string
}) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-gray-200 rounded ${height}`} />
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse border border-gray-200 rounded-lg p-4 space-y-3"
        >
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="flex gap-2 mt-4">
            <div className="h-8 bg-gray-200 rounded w-20" />
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for team cards with color indicator, name, and player slots
 */
export function TeamCardSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
        >
          {/* Team header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300" />
              <div className="h-5 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-100 rounded w-16" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-24" />
          </div>
          {/* Player slots */}
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-6 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for player cards in grid layout
 */
export function PlayerCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-5 bg-gray-200 rounded w-24" />
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
            <div className="h-6 bg-gray-100 rounded w-14" />
          </div>
          <div className="space-y-1 mb-3">
            <div className="h-3 bg-gray-100 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
          <div className="h-9 bg-gray-200 rounded w-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for chat messages
 */
export function ChatMessageSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          {/* Message bubble */}
          <div
            className={`space-y-2 max-w-[70%] ${i % 2 === 0 ? '' : 'items-end'}`}
          >
            <div className="h-3 bg-gray-100 rounded w-16" />
            <div className="bg-gray-200 rounded-lg p-3 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-48" />
              {i % 3 === 0 && <div className="h-4 bg-gray-300 rounded w-32" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for table rows
 */
export function TableRowSkeleton({
  count = 5,
  columns = 4,
}: {
  count?: number
  columns?: number
}) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex gap-4 p-3 border-b border-gray-200 bg-gray-50">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border-b border-gray-100">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className={`h-4 bg-gray-200 rounded flex-1 ${j === 0 ? 'w-1/4' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for leaderboard entries
 */
export function LeaderboardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            {/* Rank */}
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-300 rounded" />
            </div>
            {/* Team/Player info */}
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-28" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
          </div>
          {/* Score */}
          <div className="h-6 bg-gray-200 rounded w-12" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for game cards
 */
export function GameCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse border border-gray-200 rounded-lg p-4"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-100 rounded-full w-16" />
            <div className="h-6 bg-gray-100 rounded-full w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Inline spinner for buttons and small loading states
 */
export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${sizeClasses[size]}`}
    />
  )
}

/**
 * Full page loading state with centered spinner and optional message
 */
export function PageLoadingSkeleton({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500" />
      {message && (
        <p className="text-gray-600 text-sm animate-pulse">{message}</p>
      )}
    </div>
  )
}

/**
 * Session detail page skeleton for consistent loading state
 */
export function SessionDetailSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto animate-pulse">
        {/* Breadcrumb */}
        <div className="h-4 bg-gray-200 rounded w-48 mb-6" />

        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-64" />
              <div className="flex gap-4">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-32" />
                <div className="h-4 bg-gray-100 rounded w-28" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-6 bg-gray-200 rounded w-24 ml-auto" />
              <div className="flex gap-2 justify-end">
                <div className="h-8 bg-gray-100 rounded w-20" />
                <div className="h-8 bg-gray-100 rounded w-8" />
                <div className="h-8 bg-blue-100 rounded w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded w-20" />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <CardSkeleton count={3} />
        </div>
      </div>
    </div>
  )
}
