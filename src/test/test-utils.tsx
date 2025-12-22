import type { ReactElement, ReactNode } from 'react'
import { render, renderHook } from '@testing-library/react'
import type { RenderOptions, RenderHookOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

// Create a test query client
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Create mock socket context
export function createMockSocketContext(overrides?: {
  isConnected?: boolean
  sessionsSocket?: Partial<ReturnType<typeof vi.fn>>
  gamesSocket?: Partial<ReturnType<typeof vi.fn>>
}) {
  return {
    sessionsSocket: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      connected: overrides?.isConnected ?? true,
      ...overrides?.sessionsSocket,
    },
    gamesSocket: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      connected: overrides?.isConnected ?? true,
      ...overrides?.gamesSocket,
    },
    isConnected: overrides?.isConnected ?? true,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
}

// Create a custom render function with all providers
function AllTheProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Render hook with providers
interface RenderHookWithProvidersOptions<TProps> {
  queryClient?: QueryClient
  socketContext?: ReturnType<typeof createMockSocketContext>
  initialProps?: TProps
}

export function renderHookWithProviders<TResult, TProps = unknown>(
  hook: (props: TProps) => TResult,
  options: RenderHookWithProvidersOptions<TProps> = {},
) {
  const { queryClient = createTestQueryClient(), initialProps } = options

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  return renderHook(hook, {
    wrapper,
    initialProps,
  } as RenderHookOptions<TProps>)
}

export * from '@testing-library/react'
export { customRender as render }
export { customRender as renderWithProviders }
