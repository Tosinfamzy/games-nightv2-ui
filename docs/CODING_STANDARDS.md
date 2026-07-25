# Games Night V2 Frontend - Coding Standards & Guidelines

> This document guides all frontend development - human and AI agents alike.
> For backend standards, see the backend repository's CODING_STANDARDS.md

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT LIMITS                          │
├─────────────────────────────────────────────────────────────┤
│ Route/Page Component:     < 200 lines                       │
│ Feature Component:        < 150 lines                       │
│ UI Component:             < 100 lines                       │
├─────────────────────────────────────────────────────────────┤
│                    BEFORE WRITING CODE                       │
├─────────────────────────────────────────────────────────────┤
│ □ Is there an existing component I can reuse?               │
│ □ Is there an existing hook I can use?                      │
│ □ No 'any' types - use proper TypeScript                    │
│ □ Extract shared logic to hooks                             │
│ □ Use TanStack Query for server state                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Component Architecture

### 1.1 Component Size Limits

| Component Type | Max Lines | When to Split                            |
| -------------- | --------- | ---------------------------------------- |
| Route/Page     | 200       | Extract features to sub-components       |
| Feature        | 150       | Extract logic to hooks, UI to components |
| UI/Atomic      | 100       | Rarely needs splitting                   |

### 1.2 Component File Structure

```typescript
// 1. React imports
import { useState, useEffect } from 'react'

// 2. External library imports
import { useQuery, useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

// 3. Internal component imports
import { Button } from '@/components/ui/Button'
import { GameCard } from '@/components/GameCard'

// 4. Hook imports
import { useGame } from '@/hooks/useGame'
import { useSocketContext } from '@/lib/socket'

// 5. Service/utility imports
import { gameService } from '@/lib/api/services'
import { formatDate } from '@/lib/utils/date'

// 6. Type imports
import type { Game, Player } from '@/lib/api/types'

// 7. Props interface (above component)
interface GameDashboardProps {
  sessionId: string
  isHost: boolean
}

// 8. Component
export function GameDashboard({ sessionId, isHost }: GameDashboardProps) {
  // a. State declarations
  const [activeTab, setActiveTab] = useState<'overview' | 'scores'>('overview')

  // b. Queries and mutations
  const { data: games, isLoading } = useQuery({ ... })
  const startGameMutation = useMutation({ ... })

  // c. Effects (minimize these - prefer derived state)
  useEffect(() => { ... }, [dependency])

  // d. Event handlers
  const handleStartGame = () => { ... }

  // e. Early returns (loading, error states)
  if (isLoading) return <LoadingSkeleton />
  if (!games) return <EmptyState />

  // f. Main render
  return (
    <div>...</div>
  )
}
```

### 1.3 When to Extract Components

**Extract when:**

- Section has its own state
- Section is reused elsewhere
- Section is logically independent
- File exceeds line limits

```typescript
// BAD: Everything in one file
function SessionPage() {
  // 50 lines of header logic
  // 100 lines of players tab
  // 100 lines of games tab
  // 100 lines of teams tab
  // ... 400+ lines total
}

// GOOD: Extracted components
function SessionPage() {
  return (
    <div>
      <SessionHeader session={session} />
      <SessionTabs activeTab={activeTab} onTabChange={setActiveTab}>
        <PlayersTab players={players} />
        <GamesTab games={games} />
        <TeamsTab teams={teams} />
      </SessionTabs>
    </div>
  )
}
```

---

## 2. State Management

### 2.1 State Types & Solutions

| State Type        | Solution        | Example                   |
| ----------------- | --------------- | ------------------------- |
| Server/async data | TanStack Query  | Games, sessions, players  |
| Forms             | React Hook Form | Create game form          |
| Global UI         | Context/Zustand | Theme, socket connections |
| Local UI          | useState        | Modal open, active tab    |
| URL state         | Router params   | Session ID, game ID       |

### 2.2 TanStack Query Patterns

```typescript
// Query with proper typing
const {
  data: games,
  isLoading,
  error,
} = useQuery<Game[], Error>({
  queryKey: ['games', 'session', sessionId],
  queryFn: () => gameService.findBySession(sessionId),
  staleTime: 30_000, // 30 seconds
})

// Mutation with optimistic update
const updatePlayerMutation = useMutation({
  mutationFn: (data: UpdatePlayerDto) => playerService.update(data),

  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['players', playerId] })
    const previous = queryClient.getQueryData(['players', playerId])
    queryClient.setQueryData(['players', playerId], (old) => ({
      ...old,
      ...newData,
    }))
    return { previous }
  },

  onError: (err, newData, context) => {
    queryClient.setQueryData(['players', playerId], context?.previous)
    showToast.error('Failed to update player')
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['players', playerId] })
  },
})
```

### 2.3 Avoid Prop Drilling

```typescript
// BAD: Passing through 3+ levels
<SessionPage session={session}>
  <SessionContent session={session}>
    <PlayersSection session={session}>
      <PlayerCard session={session} player={player} />  // Only needs player
    </PlayersSection>
  </SessionContent>
</SessionPage>

// GOOD: Context for shared data
const SessionContext = createContext<SessionContextValue | null>(null)

function SessionPage() {
  return (
    <SessionProvider sessionId={id}>
      <SessionContent />
    </SessionProvider>
  )
}

function PlayerCard({ player }: { player: Player }) {
  const { session } = useSessionContext()  // Get from context when needed
}
```

---

## 3. Custom Hooks

### 3.1 When to Create Hooks

Create a custom hook when:

- Logic is shared across 2+ components
- Logic makes component hard to read
- Logic is independently testable
- Hook already exists - extend it

### 3.2 Hook Patterns

```typescript
// Data fetching hook
export function useGame(gameId: string) {
  return useQuery({
    queryKey: ['games', gameId],
    queryFn: () => gameService.findOne(gameId),
    enabled: !!gameId,
  })
}

// Mutation hook with toast feedback
export function useStartGame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gameId: string) => gameService.start(gameId),
    onSuccess: () => {
      showToast.success('Game started!')
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
    onError: (error) => {
      showToast.error(`Failed to start game: ${error.message}`)
    },
  })
}

// UI state hook
export function useConfirmDialog() {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const open = (config: ConfirmConfig) => setState({ isOpen: true, ...config })
  const close = () => setState((s) => ({ ...s, isOpen: false }))
  const confirm = () => {
    state.onConfirm()
    close()
  }

  return { ...state, open, close, confirm }
}
```

### 3.3 Hook Naming

```typescript
// Data hooks: use[Entity]
useGame(id)
usePlayers(sessionId)
useSessionReadiness(sessionId)

// Mutation hooks: use[Action][Entity]
useStartGame()
useUpdatePlayer()
useDeleteTeam()

// UI hooks: use[Feature]
useConfirmDialog()
useToast()
useMediaQuery()
```

---

## 4. TypeScript Standards

### 4.1 Never Use `any`

```typescript
// BAD
const handleEvent = (data: any) => { ... }
const [state, setState] = useState<any>(null)

// GOOD
interface GameEvent { gameId: string; type: GameEventType }
const handleEvent = (data: GameEvent) => { ... }
const [state, setState] = useState<Game | null>(null)

// When type is truly unknown, use unknown and narrow
const handleUnknownEvent = (data: unknown) => {
  if (isGameEvent(data)) {
    // data is now GameEvent
  }
}
```

### 4.2 Props Interfaces

Always define props interfaces above the component.

```typescript
// Required props
interface PlayerCardProps {
  player: Player
  onSelect: (playerId: string) => void
}

// With optional props
interface PlayerCardProps {
  player: Player
  onSelect?: (playerId: string) => void
  showStatus?: boolean
  className?: string
}

// With children
interface CardProps {
  title: string
  children: React.ReactNode
}

// Component
export function PlayerCard({
  player,
  onSelect,
  showStatus = true,
}: PlayerCardProps) {
  // ...
}
```

### 4.3 Event Handler Types

```typescript
// Form events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { ... }
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... }

// Mouse events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... }

// Custom events (from props)
interface Props {
  onPlayerSelect: (playerId: string) => void
  onGameStart: (gameId: string, config: GameConfig) => void
}
```

---

## 5. Styling & UI

### 5.1 Tailwind Conventions

```typescript
// Use consistent spacing scale
// BAD: arbitrary values
<div className="mt-[13px] p-[7px]">

// GOOD: Tailwind scale
<div className="mt-3 p-2">

// Responsive: mobile-first
<div className="flex flex-col sm:flex-row">
<div className="text-sm sm:text-base lg:text-lg">

// Touch targets: minimum 44px
<button className="min-h-[44px] min-w-[44px] p-3">
```

### 5.2 Component Variants

```typescript
// Use props for variants, not separate components
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export function Button({ variant, size, children }: ButtonProps) {
  return (
    <button className={cn(baseStyles, variantStyles[variant], sizeStyles[size])}>
      {children}
    </button>
  )
}
```

---

## 6. Error Handling

### 6.1 Query Error Handling

```typescript
// In queries
const { data, error, isError } = useQuery({
  queryKey: ['games', id],
  queryFn: () => gameService.findOne(id),
})

// In component
if (isError) {
  return <QueryErrorDisplay error={error} onRetry={() => refetch()} />
}
```

### 6.2 Mutation Error Handling

```typescript
const mutation = useMutation({
  mutationFn: createGame,
  onError: (error) => {
    if (error instanceof ValidationError) {
      showToast.error(`Validation failed: ${error.message}`)
    } else if (error instanceof NotFoundError) {
      showToast.error('Session not found')
    } else {
      showToast.error('An unexpected error occurred')
    }
  },
})
```

### 6.3 Error Boundaries

```typescript
// Wrap feature sections
<ErrorBoundary fallback={<FeatureError />}>
  <GameDashboard />
</ErrorBoundary>
```

---

## 7. File Organization

### 7.1 Folder Structure

```
src/
├── components/
│   ├── ui/                    # Atomic UI (Button, Input, Card)
│   ├── [Feature]/             # Feature components (GameCard, PlayerList)
│   └── layout/                # Layout components (Header, Footer)
├── contexts/                  # React contexts
├── hooks/                     # Custom hooks
│   ├── useGame.ts
│   └── useConfirmDialog.ts
├── lib/
│   ├── api/
│   │   ├── client.ts         # Fetch wrapper
│   │   ├── services/         # API service modules
│   │   └── types/            # API types/DTOs
│   ├── socket/
│   │   ├── socket-context.tsx
│   │   ├── use-game-socket.ts
│   │   └── use-session-socket.ts
│   ├── utils/                # Helper functions
│   └── constants/            # Constants
├── routes/                   # TanStack Router pages
└── main.tsx
```

### 7.2 Import Aliases

Use path aliases for cleaner imports.

```typescript
// tsconfig.json paths
{
  "paths": {
    "@/*": ["./src/*"]
  }
}

// Usage
import { Button } from '@/components/ui/Button'
import { useGame } from '@/hooks/useGame'
import { gameService } from '@/lib/api/services'
```

---

## 8. Testing

### 8.1 Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { GameCard } from './GameCard'

describe('GameCard', () => {
  const mockGame: Game = {
    id: '1',
    name: 'Test Game',
    status: 'scheduled',
  }

  it('renders game name', () => {
    render(<GameCard game={mockGame} />)
    expect(screen.getByText('Test Game')).toBeInTheDocument()
  })

  it('calls onStart when start button clicked', () => {
    const onStart = vi.fn()
    render(<GameCard game={mockGame} onStart={onStart} />)

    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    expect(onStart).toHaveBeenCalledWith('1')
  })
})
```

### 8.2 Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useGame } from './useGame'

describe('useGame', () => {
  it('returns game data', async () => {
    const { result } = renderHook(() => useGame('game-1'), {
      wrapper: QueryClientProvider,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(
      expect.objectContaining({
        id: 'game-1',
      }),
    )
  })
})
```

---

## 9. Anti-Patterns to Avoid

### 9.1 Large Route Components

```typescript
// BAD: 500+ line route component
function SessionPage() {
  // All logic and UI in one file
}

// GOOD: Route as composition root
function SessionPage() {
  const { session } = useSession(id)

  return (
    <SessionProvider session={session}>
      <SessionHeader />
      <SessionTabs />
    </SessionProvider>
  )
}
```

### 9.2 Inline Object Creation in JSX

```typescript
// BAD: Creates new object every render
<Component style={{ marginTop: 10 }} options={{ sort: true }} />

// GOOD: Stable references
const style = { marginTop: 10 }
const options = useMemo(() => ({ sort: true }), [])
<Component style={style} options={options} />
```

### 9.3 Missing Loading/Error States

```typescript
// BAD: Only happy path
function GameList() {
  const { data } = useGames()
  return <ul>{data.map(...)}</ul>  // Crashes if data is undefined
}

// GOOD: Handle all states
function GameList() {
  const { data, isLoading, error } = useGames()

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorDisplay error={error} />
  if (!data?.length) return <EmptyState />

  return <ul>{data.map(...)}</ul>
}
```

---

## 10. Checklist Before PR

- [ ] No `any` types
- [ ] Components < 200 lines
- [ ] Loading and error states handled
- [ ] Touch targets >= 44px on interactive elements
- [ ] Mobile responsive (test at 375px width)
- [ ] No console.log statements
- [ ] Tests added/updated
- [ ] No prop drilling (use context if 3+ levels)
- [ ] Server state uses TanStack Query
- [ ] Forms use React Hook Form

---

_Last Updated: January 2026_
