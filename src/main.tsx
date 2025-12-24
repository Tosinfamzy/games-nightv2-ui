import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { Toaster } from 'react-hot-toast' // Temporarily disabled for React 19 compatibility
import { SocketProvider } from './lib/socket'
import { GamesMasterProvider, PlayerProvider } from './contexts'
import { getErrorMessage, showToast } from './lib/toast'
import { ErrorBoundary } from './components/ErrorBoundary'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3, // Retry failed queries up to 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, max 30s
      networkMode: 'offlineFirst', // Use cached data when offline
      refetchOnReconnect: true, // Refetch when connection restored
      refetchOnWindowFocus: 'always', // Always refetch on focus
    },
    mutations: {
      networkMode: 'online', // Only execute mutations when online
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
        <QueryClientProvider client={queryClient}>
          <GamesMasterProvider>
            <PlayerProvider>
              <SocketProvider>
                <RouterProvider router={router} />
                <ReactQueryDevtools initialIsOpen={false} />
                {/* <Toaster /> - Disabled for React 19 compatibility testing */}
              </SocketProvider>
            </PlayerProvider>
          </GamesMasterProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
