import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { ClerkProvider } from '@clerk/clerk-react'
import { SocketProvider } from './lib/socket'
import { PlayerProvider } from './contexts'
import { getErrorMessage, showToast } from './lib/toast'
import { APIError } from './lib/api/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ClerkTokenBridge } from './components/ClerkTokenBridge'
import { NotFound } from './components/NotFound'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined
if (!clerkPublishableKey) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY — set it in your environment (see .env.example)',
  )
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3, // Retry failed queries up to 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, max 30s
      networkMode: 'offlineFirst', // Use cached data when offline
      refetchOnReconnect: true, // Refetch when connection restored
      // Refetch on focus but respect staleTime — 'always' ignored staleTime and
      // caused refetch storms as guests tab in/out on congested party wifi.
      // Reconnect + the live sockets already keep data fresh.
      refetchOnWindowFocus: true,
    },
    mutations: {
      networkMode: 'online', // Only execute mutations when online
      // Retry ONLY pure network failures — a fetch that rejects (TypeError)
      // before any response, so the request most likely never reached the
      // server. Never retry once the server responded (APIError, any status):
      // retrying a mutation the server already processed could double-apply a
      // non-idempotent action like a score submit or next-turn. This covers the
      // common "wifi blip as the host taps" case without risking double writes.
      retry: (failureCount, error) =>
        !(error instanceof APIError) && failureCount < 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 4000),
      // Global error handler for all mutations
      onError: (error) => {
        const message = getErrorMessage(error)
        showToast.error(message)
      },
    },
  },
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: NotFound,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
          <QueryClientProvider client={queryClient}>
            <ClerkTokenBridge />
            <PlayerProvider>
              <SocketProvider>
                <RouterProvider router={router} />
                {import.meta.env.DEV && (
                  <ReactQueryDevtools initialIsOpen={false} />
                )}
                <Toaster position="top-right" richColors closeButton />
              </SocketProvider>
            </PlayerProvider>
          </QueryClientProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
