import { render, renderHook, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { SocketContext, type SocketContextValue } from '../lib/socket/socket-context';
import { createMockSocket } from './mocks/socket-mocks';

/**
 * Creates a test QueryClient with sensible defaults for testing
 */
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
  });
}

/**
 * Creates a mock SocketContext value for testing
 */
export function createMockSocketContext(
  overrides?: Partial<SocketContextValue>
): SocketContextValue {
  return {
    sessionsSocket: createMockSocket(),
    gamesSocket: createMockSocket(),
    chatSocket: createMockSocket(),
    isConnected: true,
    ...overrides,
  };
}

interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  socketContext?: SocketContextValue;
}

/**
 * Wrapper component that provides all necessary contexts for testing
 */
function AllProviders({
  children,
  queryClient,
  socketContext,
}: AllProvidersProps) {
  const testQueryClient = queryClient || createTestQueryClient();
  const mockSocketContext = socketContext || createMockSocketContext();

  return (
    <QueryClientProvider client={testQueryClient}>
      <SocketContext.Provider value={mockSocketContext}>
        {children}
      </SocketContext.Provider>
    </QueryClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  socketContext?: SocketContextValue;
}

/**
 * Custom render function that wraps components with all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { queryClient, socketContext, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient} socketContext={socketContext}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Custom renderHook function that wraps hooks with all necessary providers
 */
export function renderHookWithProviders<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: CustomRenderOptions & { initialProps?: TProps }
) {
  const { queryClient, socketContext, initialProps, ...renderOptions } =
    options || {};

  return renderHook(hook, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient} socketContext={socketContext}>
        {children}
      </AllProviders>
    ),
    initialProps,
    ...renderOptions,
  });
}

/**
 * Wrapper for testing hooks that only need QueryClient
 */
export function createQueryWrapper(queryClient?: QueryClient) {
  const testQueryClient = queryClient || createTestQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Wait for React Query to settle (all queries to finish)
 */
export async function waitForQueryToSettle(queryClient: QueryClient) {
  await queryClient.refetchQueries();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
