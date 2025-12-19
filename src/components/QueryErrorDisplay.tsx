import { Link } from '@tanstack/react-router'

interface QueryErrorDisplayProps {
  error: Error | null
  onRetry?: () => void
  showBackButton?: boolean
  backTo?: string
}

export function QueryErrorDisplay({
  error,
  onRetry,
  showBackButton = true,
  backTo = '/sessions',
}: QueryErrorDisplayProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-red-200 p-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Data
          </h2>

          {/* Error Message */}
          <p className="text-gray-600 mb-4">
            {error?.message ||
              'An unexpected error occurred while loading data.'}
          </p>

          {/* Error Details (dev mode only) */}
          {import.meta.env.DEV && error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="text-sm font-semibold text-red-900 mb-2">
                Error Details (Development Only):
              </h3>
              <p className="text-sm text-red-800 font-mono break-all">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-sm text-red-700 cursor-pointer hover:text-red-900">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            )}
            {showBackButton && (
              <Link
                to={backTo}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Go Back
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
