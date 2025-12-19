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
      <Header />
      <OfflineBanner />

      <RouteErrorBoundary>
        <Outlet />
      </RouteErrorBoundary>
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
