import { Component } from 'react'
import { useLocation } from '@tanstack/react-router'
import type { ReactNode } from 'react'

interface RouteErrorBoundaryProps {
  children: ReactNode
}

interface RouteErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Route-Level Error Boundary Component
 *
 * Catches errors within specific routes and displays route-specific
 * fallback UI with navigation options.
 *
 * @example
 * <RouteErrorBoundary>
 *   <SessionDetailsPage />
 * </RouteErrorBoundary>
 */
class RouteErrorBoundaryClass extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RouteErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    // Soft reset: clear the error and re-render the children. For a transient
    // error (e.g. a momentarily-undefined field from a socket update) this
    // recovers without a full reload; if the error is genuinely persistent it
    // simply re-catches, same as before.
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <RouteErrorFallback
          error={this.state.error}
          onReset={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Route Error Fallback UI Component
 */
function RouteErrorFallback({
  error,
  onReset,
}: {
  error: Error
  onReset: () => void
}) {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Page Error</h2>

          {/* Error Description */}
          <p className="text-gray-600 mb-4">
            This page encountered an error while loading.
          </p>

          {/* Error Details (development only) */}
          {import.meta.env.DEV && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                Error Details (Development Only):
              </h3>
              <p className="text-sm text-yellow-800 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Recovery Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onReset}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Wrapper component to use RouteErrorBoundary with router hooks
 */
export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  const location = useLocation()
  // Key the boundary to the current path so navigating to a different route
  // remounts it and clears a stale error — otherwise a transient render error
  // traps the user on "Page Error" and the nav links do nothing until a full
  // page reload.
  return (
    <RouteErrorBoundaryClass key={location.pathname}>
      {children}
    </RouteErrorBoundaryClass>
  )
}
