interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  icon?: React.ReactNode
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Reusable empty state component for better UX
 * Supports primary and secondary actions with icons
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-6 px-3',
    md: 'py-12 px-4',
    lg: 'py-16 px-6',
  }

  const iconSizes = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-7xl',
  }

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]} ${className}`}>
      {icon && (
        <div className={`${iconSizes[size]} mb-4 opacity-60`}>
          {icon}
        </div>
      )}
      <h3 className={`${titleSizes[size]} font-semibold text-gray-900 mb-2`}>
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {action.icon}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Variant for no data / no results scenarios
 */
export function NoDataState({
  title = 'No data yet',
  description = 'Check back later or try a different filter.',
  action,
}: {
  title?: string
  description?: string
  action?: EmptyStateAction
}) {
  return (
    <EmptyState
      icon={<span>📭</span>}
      title={title}
      description={description}
      action={action}
      size="sm"
    />
  )
}

/**
 * Variant for no search results
 */
export function NoResultsState({
  searchTerm,
  onClear,
}: {
  searchTerm?: string
  onClear?: () => void
}) {
  return (
    <EmptyState
      icon={<span>🔍</span>}
      title="No results found"
      description={
        searchTerm
          ? `We couldn't find anything matching "${searchTerm}"`
          : 'Try adjusting your search or filter criteria.'
      }
      action={
        onClear
          ? {
              label: 'Clear search',
              onClick: onClear,
              variant: 'secondary',
            }
          : undefined
      }
      size="sm"
    />
  )
}
