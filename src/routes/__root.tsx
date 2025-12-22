import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import Header from '../components/Header'
import { RouteErrorBoundary } from '../components/RouteErrorBoundary'
import { OfflineBanner } from '../components/OfflineBanner'
import { useAutoRejoin } from '../hooks/useAutoRejoin'

function RootComponent() {
  // Automatically attempt to rejoin if user has orphaned token
  useAutoRejoin()

  return (
    <>
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Header />
      <OfflineBanner />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <RouteErrorBoundary>
          <Outlet />
        </RouteErrorBoundary>
      </main>
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
