import { Link } from '@tanstack/react-router'

/**
 * Branded fallback for unknown / stale URLs. Wired into the router as
 * `defaultNotFoundComponent` so a bad link lands somewhere friendly with a way
 * home, rather than TanStack's bare "Not Found" text.
 */
export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🎲</div>
        <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="text-gray-600 mt-2">
          This link’s rolled off the table. The page may have moved, or the game
          night it pointed to has wrapped up.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 min-h-[44px]"
        >
          ← Back to Games Night
        </Link>
      </div>
    </div>
  )
}
