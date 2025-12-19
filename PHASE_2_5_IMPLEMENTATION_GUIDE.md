# UI Robustness Implementation Guide - Phases 2-5

**Status as of 2025-12-11:** Phase 1 Complete ✅

This document provides detailed implementation instructions for Phases 2-5 of the UI robustness plan. Phase 1 (Critical Error Handling) has been completed.

---

## Table of Contents

- [Phase 1 Recap (COMPLETED)](#phase-1-recap-completed)
- [Phase 2: WebSocket Robustness](#phase-2-websocket-robustness)
- [Phase 3: Complete Incomplete Features](#phase-3-complete-incomplete-features)
- [Phase 4: Data Consistency & State Synchronization](#phase-4-data-consistency--state-synchronization)
- [Phase 5: Polish & UX Improvements](#phase-5-polish--ux-improvements)
- [Testing Strategy](#testing-strategy)
- [Reference Links](#reference-links)

---

## Phase 1 Recap (COMPLETED)

### What Was Implemented ✅

#### 1.1 Error Boundaries

**Files Created:**

- `src/components/ErrorBoundary.tsx` - Global error boundary
- `src/components/RouteErrorBoundary.tsx` - Route-level error boundary

**Files Modified:**

- `src/main.tsx` - Wrapped app in ErrorBoundary
- `src/routes/__root.tsx` - Wrapped routes in RouteErrorBoundary

#### 1.2 Mutation Error Handlers

**Files Modified (10 mutations):**

1. `src/components/JoinSessionForm.tsx` - Added onError to joinSessionMutation
2. `src/components/CreateSessionForm.tsx` - Added onError to createSessionMutation
3. `src/components/LiveScoreboard.tsx` - Added onError to submitScoreMutation
4. `src/routes/sessions/$id.tsx` - Added onError to 7 mutations:
   - startSessionMutation
   - completeSessionMutation
   - cancelSessionMutation
   - addPlayerMutation
   - removePlayerMutation
   - updatePlayerMutation
   - setPlayerReadyMutation (already had it)

**Pattern Used:**

```typescript
onError: (error) => {
  toastHelpers.operationError('operation name', error)
}
```

---

## Phase 2: WebSocket Robustness

**Estimated Time:** 3-4 days
**Priority:** HIGH
**Goal:** Handle WebSocket failures gracefully, implement offline support, improve reconnection

### 2.1 WebSocket Error Handling & Event Safety

**Problem:** All WebSocket event handlers lack try-catch blocks, leading to silent failures when event processing fails.

#### Files to Modify

##### 1. `src/lib/socket/socket-context.tsx`

**Current Issues:**

- Connection errors show generic toast (lines 87-118)
- Hard limit of 5 reconnection attempts (lines 57, 65, 73)
- No error context tracking
- Single `isConnected` flag for 3 sockets

**Changes Needed:**

**A. Improve Connection Error Handling**

**Location:** Lines 87-90, 101-104, 115-118

**Current Code:**

```typescript
sessionSocket.on('connect_error', (error) => {
  console.error('Sessions socket connection error:', error)
  showToast.error('Failed to connect to sessions. Retrying...')
})
```

**Replace With:**

```typescript
sessionSocket.on('connect_error', (error) => {
  console.error('Sessions socket connection error:', error)

  // Analyze error type for specific guidance
  let message = 'Failed to connect to sessions. '
  if (error?.message?.includes('CORS')) {
    message += 'Server configuration issue detected.'
  } else if (error?.message?.includes('unauthorized')) {
    message += 'Authentication failed. Please log in again.'
  } else if (error?.message?.includes('ECONNREFUSED')) {
    message += 'Server is unreachable. Please check your connection.'
  } else {
    message += 'Retrying...'
  }

  showToast.error(message)
})
```

**Apply same pattern to gameSocket and chatSocket error handlers.**

**B. Add Per-Socket Connection Tracking**

**Location:** After line 49 (state declarations)

**Add:**

```typescript
const [sessionsConnected, setSessionsConnected] = useState(false)
const [gamesConnected, setGamesConnected] = useState(false)
const [chatConnected, setChatConnected] = useState(false)
```

**Location:** Lines 77-85 (sessions socket connect handler)

**Replace:**

```typescript
sessionSocket.on('connect', () => {
  console.log('Sessions socket connected:', sessionSocket.id)
  setIsConnected(true)
})

sessionSocket.on('disconnect', () => {
  console.log('Sessions socket disconnected')
  setIsConnected(false)
})
```

**With:**

```typescript
sessionSocket.on('connect', () => {
  console.log('Sessions socket connected:', sessionSocket.id)
  setSessionsConnected(true)
  setIsConnected(true) // Keep for backward compatibility
})

sessionSocket.on('disconnect', () => {
  console.log('Sessions socket disconnected')
  setSessionsConnected(false)
  setIsConnected(false)
})
```

**Apply same pattern to gameSocket (setGamesConnected) and chatSocket (setChatConnected).**

**C. Update Context Value**

**Location:** Line 133 (SocketContext.Provider)

**Replace:**

```typescript
<SocketContext.Provider value={{ sessionsSocket, gamesSocket, chatSocket, isConnected }}>
```

**With:**

```typescript
<SocketContext.Provider value={{
  sessionsSocket,
  gamesSocket,
  chatSocket,
  isConnected,
  sessionsConnected,
  gamesConnected,
  chatConnected
}}>
```

**D. Update Interface**

**Location:** Line 19-24 (SocketContextValue interface)

**Replace:**

```typescript
export interface SocketContextValue {
  sessionsSocket: Socket | null
  gamesSocket: Socket | null
  chatSocket: Socket | null
  isConnected: boolean
}
```

**With:**

```typescript
export interface SocketContextValue {
  sessionsSocket: Socket | null
  gamesSocket: Socket | null
  chatSocket: Socket | null
  isConnected: boolean
  sessionsConnected: boolean
  gamesConnected: boolean
  chatConnected: boolean
  reconnect: () => void // Will add in 2.2
}
```

##### 2. `src/lib/socket/use-session-socket.ts`

**Problem:** 14 event listeners (lines 36-205) have NO error handling.

**Solution:** Wrap EVERY event handler in try-catch.

**Example - Current Code (Line 36-41):**

```typescript
const handlePlayerJoined = (data: any) => {
  console.log('Player joined:', data)
  queryClient.invalidateQueries({ queryKey: ['players', 'session', sessionId] })
  queryClient.invalidateQueries({ queryKey: ['session-readiness', sessionId] })
  queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
}
```

**Replace With:**

```typescript
const handlePlayerJoined = (data: any) => {
  try {
    console.log('Player joined:', data)

    // Validate data
    if (!data?.playerId) {
      throw new Error('Invalid player joined event: missing playerId')
    }

    queryClient.invalidateQueries({
      queryKey: ['players', 'session', sessionId],
    })
    queryClient.invalidateQueries({
      queryKey: ['session-readiness', sessionId],
    })
    queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
  } catch (error) {
    console.error('Error handling player joined event:', error)
    showToast.error('Failed to update player list. Please refresh.')
  }
}
```

**Apply this pattern to ALL 14 event handlers:**

1. handlePlayerJoined (line 36)
2. handlePlayerLeft (line 43)
3. handlePlayerOnline (line 50)
4. handlePlayerOffline (line 57)
5. handlePlayerReady (line 64)
6. handlePlayerNotReady (line 71)
7. handleSessionStatusChanged (line 78)
8. handleReadinessUpdated (line 88)
9. handleSessionStarted (line 94)
10. handleSessionCompleted (line 100)
11. handleGameAdded (line 106)
12. handleGameRemoved (line 112)
13. handleTeamCreated (line 118)
14. handleTeamDeleted (line 124)

**Don't forget to import showToast:**

```typescript
import { showToast } from '../toast'
```

##### 3. `src/lib/socket/use-game-socket.ts`

**Same approach as use-session-socket.ts.** Wrap ALL event handlers in try-catch.

**Import at top:**

```typescript
import { showToast } from '../toast'
```

**Event handlers to wrap:**

- All listeners in the file (check with grep for `.on(`pattern)

##### 4. `src/lib/socket/use-chat-socket.ts`

**Current State:** Has handleError at line 102, but other handlers need try-catch too.

**Wrap all handlers except the error handler itself.**

---

### 2.2 Enhanced Reconnection Logic

**Files to Modify:** `src/lib/socket/socket-context.tsx`

#### A. Remove Hard Reconnection Limits

**Location:** Lines 53-74 (socket creation)

**Current Code:**

```typescript
const sessionSocket = io(`${API_URL}/sessions`, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
})
```

**Replace With:**

```typescript
const sessionSocket = io(`${API_URL}/sessions`, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity, // Never give up
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000, // Cap at 30 seconds
  randomizationFactor: 0.1, // Enable exponential backoff
})
```

**Apply to all three sockets (sessions, games, chat).**

#### B. Add reconnect_failed Handler

**Location:** After each socket's connect_error handler

**Add for each socket:**

```typescript
sessionSocket.on('reconnect_failed', () => {
  console.error('Sessions socket reconnection failed')
  showToast.error(
    'Unable to reconnect to sessions. Please refresh the page.',
    10000,
  )
})

// Repeat for gameSocket and chatSocket
```

#### C. Add Manual Reconnect Function

**Location:** Before the return statement (around line 125)

**Add:**

```typescript
const reconnect = () => {
  console.log('Manual reconnect triggered')
  if (sessionSocket) {
    sessionSocket.disconnect()
    sessionSocket.connect()
  }
  if (gameSocket) {
    gameSocket.disconnect()
    gameSocket.connect()
  }
  if (chatSocket) {
    chatSocket.disconnect()
    chatSocket.connect()
  }
  showToast.info('Reconnecting...')
}
```

**Update the Provider value (line 133) to include reconnect:**

```typescript
<SocketContext.Provider value={{
  sessionsSocket,
  gamesSocket,
  chatSocket,
  isConnected,
  sessionsConnected,
  gamesConnected,
  chatConnected,
  reconnect
}}>
```

---

### 2.3 Offline State Management

#### Files to Create

##### 1. `src/hooks/useOnlineStatus.ts`

**Create new file with:**

```typescript
import { useEffect, useState } from 'react'
import { useSocketContext } from '../lib/socket/socket-context'

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { sessionsConnected, gamesConnected, chatConnected } =
    useSocketContext()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const allSocketsConnected =
    sessionsConnected && gamesConnected && chatConnected

  return {
    isOnline: isOnline && allSocketsConnected,
    isOffline: !isOnline || !allSocketsConnected,
    networkOnline: isOnline,
    socketsStatus: {
      sessionsConnected,
      gamesConnected,
      chatConnected,
      allConnected: allSocketsConnected,
    },
  }
}
```

##### 2. `src/components/OfflineBanner.tsx`

**Create new file with:**

```typescript
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useSocketContext } from '../lib/socket/socket-context';

export function OfflineBanner() {
  const { isOffline, networkOnline, socketsStatus } = useOnlineStatus();
  const { reconnect } = useSocketContext();

  if (!isOffline) return null;

  const getOfflineReason = () => {
    if (!networkOnline) {
      return 'No internet connection';
    }
    if (!socketsStatus.allConnected) {
      const disconnected = [];
      if (!socketsStatus.sessionsConnected) disconnected.push('sessions');
      if (!socketsStatus.gamesConnected) disconnected.push('games');
      if (!socketsStatus.chatConnected) disconnected.push('chat');
      return `Disconnected from ${disconnected.join(', ')}`;
    }
    return 'Connection lost';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            className="h-5 w-5 animate-pulse"
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
          <span className="font-medium">{getOfflineReason()}</span>
          {networkOnline && (
            <span className="text-sm opacity-90">- Reconnecting automatically...</span>
          )}
        </div>
        {networkOnline && (
          <button
            onClick={reconnect}
            className="px-3 py-1 bg-white text-yellow-700 rounded hover:bg-yellow-50 transition-colors text-sm font-medium"
          >
            Reconnect Now
          </button>
        )}
      </div>
    </div>
  );
}
```

##### 3. Integrate OfflineBanner

**File:** `src/routes/__root.tsx`

**Import at top:**

```typescript
import { OfflineBanner } from '../components/OfflineBanner'
```

**Add to component (after Header):**

```typescript
export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <OfflineBanner />

      <RouteErrorBoundary>
        <Outlet />
      </RouteErrorBoundary>
      <TanStackRouterDevtools />
    </>
  ),
});
```

#### Files to Modify

##### `src/main.tsx` - Configure Query Defaults for Offline

**Location:** Line 18-32 (QueryClient configuration)

**Add to queries default options:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
      networkMode: 'offlineFirst', // ← ADD THIS
      refetchOnReconnect: true, // ← ADD THIS
      refetchOnWindowFocus: 'always', // ← ADD THIS
    },
    mutations: {
      networkMode: 'online', // ← ADD THIS (only execute when online)
      // Global error handler for all mutations
      onError: (error) => {
        const message = getErrorMessage(error)
        showToast.error(message)
      },
    },
  },
})
```

---

### 2.4 Success Criteria for Phase 2

- [ ] All WebSocket event handlers wrapped in try-catch
- [ ] Connection errors show specific, actionable messages
- [ ] Per-socket connection status tracked (sessionsConnected, gamesConnected, chatConnected)
- [ ] Unlimited reconnection attempts with exponential backoff
- [ ] Manual reconnect button available in offline banner
- [ ] Offline banner displays when connection lost
- [ ] Offline banner shows which socket(s) disconnected
- [ ] Query client configured for offline-first behavior
- [ ] No silent WebSocket failures

---

## Phase 3: Complete Incomplete Features

**Estimated Time:** 2-3 days
**Priority:** MEDIUM
**Goal:** Implement all placeholders and resolve hardcoded values

### 3.1 Player Authentication Context

**Problem:** `currentPlayerId` is hardcoded in `src/routes/sessions/$id.tsx` (line 48-50):

```typescript
// TODO: Get current player ID from auth context
// For now, use the first player as a placeholder
const currentPlayerId = players?.[0]?.id || 'demo-player-id'
```

#### Files to Create

##### 1. `src/contexts/PlayerContext.tsx`

**Create new file (similar to GamesMasterContext.tsx):**

```typescript
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Player } from '../lib/api/types';

interface PlayerContextValue {
  player: Player | null;
  setPlayer: (player: Player) => void;
  clearPlayer: () => void;
  isAuthenticated: boolean;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider = ({ children }: PlayerProviderProps) => {
  const [player, setPlayerState] = useState<Player | null>(() => {
    const stored = localStorage.getItem('gn_player');
    return stored ? JSON.parse(stored) : null;
  });

  const setPlayer = (p: Player) => {
    setPlayerState(p);
    localStorage.setItem('gn_player', JSON.stringify(p));
  };

  const clearPlayer = () => {
    setPlayerState(null);
    localStorage.removeItem('gn_player');
  };

  return (
    <PlayerContext.Provider
      value={{
        player,
        setPlayer,
        clearPlayer,
        isAuthenticated: !!player,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
```

##### 2. `src/hooks/usePlayer.ts`

**Create export file:**

```typescript
export { usePlayer } from '../contexts/PlayerContext'
```

#### Files to Modify

##### 1. `src/contexts/index.ts`

**Add export:**

```typescript
export { GamesMasterProvider, useGamesMaster } from './GamesMasterContext'
export { PlayerProvider, usePlayer } from './PlayerContext'
```

##### 2. `src/main.tsx`

**Import PlayerProvider:**

```typescript
import { GamesMasterProvider, PlayerProvider } from './contexts'
```

**Wrap app (after GamesMasterProvider):**

```typescript
root.render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GamesMasterProvider>
          <PlayerProvider>
            <SocketProvider>
              <RouterProvider router={router} />
              <ReactQueryDevtools initialIsOpen={false} />
              <Toaster />
            </SocketProvider>
          </PlayerProvider>
        </GamesMasterProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
```

##### 3. `src/components/JoinSessionForm.tsx`

**Import usePlayer:**

```typescript
import { usePlayer } from '../hooks/usePlayer'
```

**Update component:**

```typescript
export function JoinSessionForm({ onJoinSuccess }: JoinSessionFormProps) {
  const { setPlayer } = usePlayer() // ← ADD THIS
  const [joinCode, setJoinCode] = useState('')
  const [playerName, setPlayerName] = useState('')

  const joinSessionMutation = useMutation({
    mutationFn: (data: JoinSessionRequest) => sessionService.joinSession(data),
    onSuccess: (response) => {
      // Save player to context ← ADD THIS
      setPlayer(response.player)

      showToast.success('Successfully joined session!')
      onJoinSuccess?.(response.session)
    },
    onError: (error) => {
      toastHelpers.operationError('join session', error)
    },
  })

  // ... rest of component
}
```

##### 4. `src/routes/sessions/$id.tsx`

**Import usePlayer:**

```typescript
import { usePlayer } from '../../hooks/usePlayer'
```

**Replace hardcoded player ID (line 48-50):**

```typescript
// OLD:
// TODO: Get current player ID from auth context
// For now, use the first player as a placeholder
const currentPlayerId = players?.[0]?.id || 'demo-player-id'

// NEW:
const { player } = usePlayer()
const currentPlayerId = player?.id
```

**Update SessionChat usage (line 457):**

```typescript
<SessionChat
  sessionId={session.id}
  playerId={currentPlayerId} // Now from context, not hardcoded
  playerName={player?.name || 'Guest'}
/>
```

##### 5. `src/components/SessionChat.tsx`

**Handle missing player gracefully:**

At the beginning of the component, add:

```typescript
if (!playerId) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800">
        Please join the session to use chat.
      </p>
    </div>
  );
}
```

---

### 3.2 Complete Game Details Placeholders

**Files to Modify:** `src/routes/games/$id.tsx`

**Current Issue:** Lines 149-161 have "Coming soon..." placeholders.

**Solution:**

Replace placeholders with actual implementations:

**A. Players & Teams Section (line 150-155)**

```typescript
{/* Players & Teams - Remove "Coming soon" */}
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-4">Teams</h3>
  {game.teams && game.teams.length > 0 ? (
    <div className="space-y-3">
      {game.teams.map((team: any) => (
        <div key={team.id} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{team.name}</span>
            <span
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: team.color }}
            />
          </div>
          <div className="text-sm text-gray-600">
            {team.players?.length || 0} players
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">No teams assigned yet</p>
  )}
</div>
```

**B. Scores Section (line 157-161)**

```typescript
{/* Scores - Remove "Coming soon" */}
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-4">Scores</h3>
  {game.scores && game.scores.length > 0 ? (
    <div className="space-y-2">
      {game.scores.map((score: any, index: number) => (
        <div key={index} className="flex justify-between items-center py-2 border-b">
          <span className="font-medium">{score.teamName}</span>
          <span className="text-lg font-bold text-blue-600">
            {score.totalPoints} pts
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">No scores recorded yet</p>
  )}
</div>
```

**Files to Modify:** `src/routes/sessions/$id.tsx`

**Current Issue:** Quick action buttons have no handlers (lines 523, 530)

**Solution:**

**A. "Manage Games" Button (line 523-529)**

```typescript
// OLD:
<button className="...">
  Manage Games
</button>

// NEW:
<button
  onClick={() => setActiveTab('games')}
  className="..."
>
  Manage Games
</button>
```

**B. "Create Teams" Button (line 530-538)**

```typescript
// OLD:
<button className="...">
  Create Teams
</button>

// NEW:
<button
  onClick={() => setActiveTab('teams')}
  className="..."
>
  Create Teams
</button>
```

---

### 3.3 Form Validation Improvements

#### A. ChatInput - Replace Browser Alert

**File:** `src/components/ChatInput.tsx`

**Location:** Lines 24-27

**Current Code:**

```typescript
if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
  alert(`Message too long! Maximum ${MAX_MESSAGE_LENGTH} characters.`)
  return
}
```

**Replace With:**

```typescript
import { showToast } from '../lib/toast' // Add import at top

// In handleSend:
if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
  showToast.warning(
    `Message too long! Maximum ${MAX_MESSAGE_LENGTH} characters.`,
  )
  return
}
```

**Better: Add inline validation:**

Add state for error:

```typescript
const [error, setError] = useState<string | null>(null)
```

Update onChange:

```typescript
onChange={(e) => {
  const value = e.target.value;
  setMessage(value);
  if (value.length > MAX_MESSAGE_LENGTH) {
    setError(`${value.length}/${MAX_MESSAGE_LENGTH} characters (too long)`);
  } else {
    setError(null);
  }
}}
```

Display error below input:

```typescript
{error && (
  <p className="text-xs text-red-600 mt-1">{error}</p>
)}
```

#### B. CreateSessionForm - Date Validation

**File:** `src/components/CreateSessionForm.tsx`

**Location:** Line 45 (handleSubmit function)

**Add validation before mutation:**

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()

  if (!gm) {
    setFormError('Games Master profile not found. Please try again.')
    return
  }

  // Validate date is in future ← ADD THIS
  if (date) {
    const selectedDate = new Date(date)
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Reset to start of day

    if (selectedDate < now) {
      setFormError('Session date must be in the future.')
      showToast.error('Please select a future date for the session.')
      return
    }
  }

  const sessionData: CreateSessionDTO = {
    // ... rest of code
  }
}
```

---

### 3.4 Success Criteria for Phase 3

- [ ] PlayerContext created and integrated
- [ ] Player saved to context after successful join
- [ ] currentPlayerId no longer hardcoded
- [ ] Player persists across page refresh
- [ ] Game details page has no "Coming soon" placeholders
- [ ] Quick action buttons navigate to correct tabs
- [ ] ChatInput uses toast instead of alert()
- [ ] CreateSessionForm validates date is in future
- [ ] No hardcoded player IDs remain in codebase

---

## Phase 4: Data Consistency & State Synchronization

**Estimated Time:** 2 days
**Priority:** MEDIUM
**Goal:** Ensure single source of truth, prevent race conditions

### 4.1 Resolve Readiness Data Race Condition

**Problem:** SessionReadinessDashboard polls every 5s AND WebSocket updates, causing race conditions.

**File:** `src/components/SessionReadinessDashboard.tsx`

**Location:** Line 42

**Current Code:**

```typescript
const { data: readiness } = useQuery({
  queryKey: ['session-readiness', sessionId],
  queryFn: () => sessionManagementService.getSessionReadiness(sessionId),
  refetchInterval: 5000, // ← POLLING - REMOVE THIS
})
```

**Replace With:**

```typescript
const { data: readiness } = useQuery({
  queryKey: ['session-readiness', sessionId],
  queryFn: () => sessionManagementService.getSessionReadiness(sessionId),
  staleTime: Infinity, // Trust WebSocket updates
  refetchOnMount: true, // Initial load only
})
```

**Reasoning:**

- WebSocket already updates readiness (use-session-socket.ts lines 88-101)
- Polling creates race conditions
- Single source of truth = WebSocket only

**Optional: Add Manual Refresh Button**

If users want to manually refresh:

```typescript
const { data: readiness, refetch } = useQuery({
  // ... config above
});

// In JSX:
<button
  onClick={() => refetch()}
  className="text-sm text-blue-600 hover:text-blue-700"
>
  Refresh
</button>
```

---

### 4.2 Query Invalidation Strategy

**Goal:** Ensure consistent invalidation patterns across all mutations.

#### Standard Invalidation Patterns

**Document these patterns in code comments:**

```typescript
// STANDARD INVALIDATION PATTERNS
//
// After player joins:
// - ['players', 'session', sessionId]
// - ['session-readiness', sessionId]
// - ['sessions', sessionId]
//
// After team created:
// - ['teams', 'session', sessionId]
// - ['session-readiness', sessionId]
//
// After game started:
// - ['games', gameId]
// - ['sessions', sessionId]
//
// After score submitted:
// - ['scores', 'game', gameId]
// - ['leaderboard', gameId]
// - ['games', gameId]
```

#### Files to Audit

Create a checklist and verify each mutation:

##### `src/routes/sessions/$id.tsx`

**Player ready mutation (already correct):**

```typescript
setPlayerReadyMutation - INVALIDATES:
  ✓ ['session-readiness', session.id]
  ✓ ['sessions', 'detail', session.id, 'players']
```

**Add player mutation - CHECK IF MISSING:**

```typescript
addPlayerMutation - SHOULD INVALIDATE:
  ✓ ['players', 'session', session.id]
  ✓ ['session-readiness', session.id]
  + ['sessions', session.id] ← ADD IF MISSING
```

**If missing, add:**

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['players', 'session', session.id] });
  queryClient.invalidateQueries({ queryKey: ['session-readiness', session.id] });
  queryClient.invalidateQueries({ queryKey: ['sessions', session.id] }); // ← ADD
  setShowAddPlayerForm(false);
  setNewPlayerName('');
},
```

##### `src/components/TeamFormationInterface.tsx`

**createTeamsMutation - CHECK INVALIDATIONS:**

```typescript
onSuccess: (teams) => {
  queryClient.invalidateQueries({ queryKey: ['teams', 'game', selectedGameForFormation] });
  queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
  // ADD IF MISSING:
  queryClient.invalidateQueries({ queryKey: ['session-readiness', sessionId] });
  toastHelpers.withCount('Created', teams.length, 'team');
  onTeamsCreated(teams as any);
},
```

##### General Pattern for ALL Mutations

**Checklist:**

1. Open each file with mutations
2. For each mutation, verify it invalidates related queries
3. Add missing invalidations following the patterns above
4. Ensure no stale data remains after operations

---

### 4.3 Optimistic Updates with Rollback

**Goal:** Make UI feel instant while ensuring data integrity.

**File:** `src/routes/sessions/$id.tsx`

**Location:** setPlayerReadyMutation (line 567)

**Current Code:**

```typescript
const setPlayerReadyMutation = useMutation({
  mutationFn: ({ playerId, ready }: { playerId: string; ready: boolean }) =>
    sessionManagementService.setPlayerReady(session.id, playerId, ready),
  onSuccess: (_, variables) => {
    queryClient.invalidateQueries({
      queryKey: ['session-readiness', session.id],
    })
    queryClient.invalidateQueries({
      queryKey: ['sessions', 'detail', session.id, 'players'],
    })
    const status = variables.ready ? 'ready' : 'not ready'
    showToast.success(`✓ Player marked as ${status}!`)
  },
  onError: (error) => {
    toastHelpers.operationError('update player ready status', error)
  },
})
```

**Replace With Optimistic Update:**

```typescript
const setPlayerReadyMutation = useMutation({
  mutationFn: ({ playerId, ready }: { playerId: string; ready: boolean }) =>
    sessionManagementService.setPlayerReady(session.id, playerId, ready),

  // ADD OPTIMISTIC UPDATE
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({
      queryKey: ['sessions', 'detail', session.id, 'players'],
    })

    // Snapshot previous value
    const previousPlayers = queryClient.getQueryData([
      'sessions',
      'detail',
      session.id,
      'players',
    ])

    // Optimistically update
    queryClient.setQueryData(
      ['sessions', 'detail', session.id, 'players'],
      (old: any) => {
        if (!old) return old
        return old.map((p: any) =>
          p.id === variables.playerId
            ? { ...p, status: variables.ready ? 'ready' : 'not_ready' }
            : p,
        )
      },
    )

    // Return context with snapshot
    return { previousPlayers }
  },

  onSuccess: (_, variables) => {
    queryClient.invalidateQueries({
      queryKey: ['session-readiness', session.id],
    })
    const status = variables.ready ? 'ready' : 'not ready'
    showToast.success(`✓ Player marked as ${status}!`)
  },

  onError: (error, variables, context) => {
    // ROLLBACK on error
    if (context?.previousPlayers) {
      queryClient.setQueryData(
        ['sessions', 'detail', session.id, 'players'],
        context.previousPlayers,
      )
    }
    toastHelpers.operationError('update player ready status', error)
  },

  // Always refetch to ensure sync
  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: ['sessions', 'detail', session.id, 'players'],
    })
  },
})
```

**Apply Same Pattern To:**

- Team assignment mutations
- Score submission (if applicable)
- Any other user-facing mutations where instant feedback matters

---

### 4.4 Success Criteria for Phase 4

- [ ] SessionReadinessDashboard polling removed
- [ ] All mutations follow consistent invalidation patterns
- [ ] No race conditions between polling and WebSocket
- [ ] Player ready mutation has optimistic update
- [ ] Optimistic updates rollback on error
- [ ] UI updates instantly on user actions
- [ ] Data syncs with server after mutations complete

---

## Phase 5: Polish & UX Improvements

**Estimated Time:** 1-2 days
**Priority:** LOW
**Goal:** Consistent UX, better feedback

### 5.1 Replace Browser Alerts with Modals

**Files to Modify:** `src/routes/sessions/$id.tsx`

**Locations:** Lines 257, 659

#### A. Create ConfirmDialog Component

**File:** `src/components/ConfirmDialog.tsx` (NEW)

```typescript
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className={`flex items-start space-x-3 mb-4 p-3 rounded-lg ${styles.bg} border ${styles.border}`}>
          <svg
            className={`h-6 w-6 flex-shrink-0 ${styles.icon}`}
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
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <div className="text-sm text-gray-700 mt-1">{message}</div>
          </div>
        </div>

        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### B. Update sessions/$id.tsx

**Add state for dialogs:**

```typescript
const [showCancelConfirm, setShowCancelConfirm] = useState(false)
const [playerToRemove, setPlayerToRemove] = useState<string | null>(null)
```

**Import ConfirmDialog:**

```typescript
import { ConfirmDialog } from '../../components/ConfirmDialog'
```

**Replace confirm() at line 257:**

```typescript
// OLD:
const handleCancelSession = () => {
  if (confirm('Are you sure you want to cancel this session?')) {
    cancelSessionMutation.mutate(session.id)
  }
}

// NEW:
const handleCancelSession = () => {
  setShowCancelConfirm(true)
}

const confirmCancelSession = () => {
  cancelSessionMutation.mutate(session.id)
  setShowCancelConfirm(false)
}
```

**Replace confirm() at line 659:**

```typescript
// OLD:
onClick={() => {
  if (confirm(`Remove ${player.name}?`)) {
    removePlayerMutation.mutate(player.id);
  }
}}

// NEW:
onClick={() => setPlayerToRemove(player.id)}
```

**Add dialogs to JSX (at end of component, before closing div):**

```typescript
{/* Cancel Session Confirmation */}
<ConfirmDialog
  isOpen={showCancelConfirm}
  title="Cancel Session?"
  message="Are you sure you want to cancel this session? This action cannot be undone."
  confirmText="Yes, Cancel Session"
  cancelText="No, Keep It"
  onConfirm={confirmCancelSession}
  onCancel={() => setShowCancelConfirm(false)}
  variant="danger"
/>

{/* Remove Player Confirmation */}
<ConfirmDialog
  isOpen={!!playerToRemove}
  title="Remove Player?"
  message={`Are you sure you want to remove this player from the session?`}
  confirmText="Yes, Remove"
  cancelText="No, Keep"
  onConfirm={() => {
    if (playerToRemove) {
      removePlayerMutation.mutate(playerToRemove);
      setPlayerToRemove(null);
    }
  }}
  onCancel={() => setPlayerToRemove(null)}
  variant="warning"
/>
```

---

### 5.2 Consistent Empty States

**Goal:** Use reusable EmptyState component everywhere.

#### Check if EmptyState component exists

**Search for:** `src/components/EmptyState.tsx`

If it doesn't exist, create it:

```typescript
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

#### Apply to All Lists

**Files to Update:**

##### 1. `src/routes/sessions/index.tsx` (line 34-36)

**Replace:**

```typescript
if (sessions.length === 0) {
  return <div>No sessions found.</div>
}
```

**With:**

```typescript
import { EmptyState } from '../../components/EmptyState';

if (sessions.length === 0) {
  return (
    <EmptyState
      icon={
        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
      title="No Sessions Yet"
      message="Create your first game session to get started."
      action={{
        label: 'Create Session',
        onClick: () => navigate({ to: '/sessions/new' })
      }}
    />
  );
}
```

##### 2. Apply same pattern to other empty states throughout the app

Search for patterns like:

- `No players found`
- `No teams`
- `No games`
- `No messages`

Replace with EmptyState component.

---

### 5.3 Success Criteria for Phase 5

- [ ] No browser confirm() or alert() dialogs remain
- [ ] ConfirmDialog component created and used
- [ ] All destructive actions show confirmation modal
- [ ] EmptyState component created (if not exists)
- [ ] All lists use EmptyState component consistently
- [ ] Empty states have helpful messages and actions
- [ ] UX is consistent across all pages

---

## Testing Strategy

### Phase 2 Testing

- [ ] Disconnect WiFi, verify offline banner appears
- [ ] Reconnect WiFi, verify banner disappears
- [ ] Click manual reconnect button, verify it works
- [ ] Throw error in WebSocket event handler, verify app doesn't crash
- [ ] Check browser console for WebSocket errors being caught
- [ ] Verify per-socket connection status in UI
- [ ] Test exponential backoff (watch reconnection delays in console)

### Phase 3 Testing

- [ ] Join session, verify player saved to localStorage
- [ ] Refresh page, verify player still authenticated
- [ ] Check SessionChat shows correct player name
- [ ] Verify no "Coming soon" text on game details page
- [ ] Click "Manage Games" button, verify navigates to games tab
- [ ] Click "Create Teams" button, verify navigates to teams tab
- [ ] Type long message in chat, verify toast appears (not alert)
- [ ] Select past date in create session, verify error shown

### Phase 4 Testing

- [ ] Open session in two browser tabs
- [ ] Mark player ready in tab 1, verify tab 2 updates via WebSocket (not polling)
- [ ] Toggle player ready, verify UI updates instantly
- [ ] Disconnect WiFi during ready toggle, verify rollback occurs
- [ ] Verify no polling requests in Network tab for readiness

### Phase 5 Testing

- [ ] Click cancel session, verify modal appears (not browser confirm)
- [ ] Click remove player, verify modal appears
- [ ] View empty players list, verify EmptyState component shown
- [ ] Test keyboard navigation in confirm dialogs
- [ ] Verify all modals can be dismissed with Escape key

---

## Reference Links

### Files Modified in Phase 1

- ✅ `src/components/ErrorBoundary.tsx`
- ✅ `src/components/RouteErrorBoundary.tsx`
- ✅ `src/main.tsx`
- ✅ `src/routes/__root.tsx`
- ✅ `src/components/JoinSessionForm.tsx`
- ✅ `src/components/CreateSessionForm.tsx`
- ✅ `src/components/LiveScoreboard.tsx`
- ✅ `src/routes/sessions/$id.tsx`

### Key Files for Phase 2

- `src/lib/socket/socket-context.tsx`
- `src/lib/socket/use-session-socket.ts`
- `src/lib/socket/use-game-socket.ts`
- `src/lib/socket/use-chat-socket.ts`
- `src/hooks/useOnlineStatus.ts` (create)
- `src/components/OfflineBanner.tsx` (create)

### Key Files for Phase 3

- `src/contexts/PlayerContext.tsx` (create)
- `src/routes/sessions/$id.tsx`
- `src/routes/games/$id.tsx`
- `src/components/JoinSessionForm.tsx`
- `src/components/SessionChat.tsx`
- `src/components/ChatInput.tsx`
- `src/components/CreateSessionForm.tsx`

### Key Files for Phase 4

- `src/components/SessionReadinessDashboard.tsx`
- `src/routes/sessions/$id.tsx`
- `src/components/TeamFormationInterface.tsx`
- All files with mutations

### Key Files for Phase 5

- `src/components/ConfirmDialog.tsx` (create)
- `src/components/EmptyState.tsx` (create if not exists)
- `src/routes/sessions/$id.tsx`
- `src/routes/sessions/index.tsx`
- All files with empty states

---

## Success Metrics

**Phase 2 Complete:**

- ✅ Zero silent WebSocket failures
- ✅ Offline banner functional
- ✅ Unlimited reconnection attempts
- ✅ Per-socket status tracking

**Phase 3 Complete:**

- ✅ No hardcoded player IDs
- ✅ Player auth persistent
- ✅ No placeholder UI
- ✅ No browser alerts for validation

**Phase 4 Complete:**

- ✅ No polling race conditions
- ✅ Consistent query invalidation
- ✅ Optimistic updates working
- ✅ Instant UI feedback

**Phase 5 Complete:**

- ✅ No browser confirm/alert dialogs
- ✅ Consistent empty states
- ✅ Professional UX throughout

---

## Getting Help

If you need clarification on any implementation:

1. Check the original plan file: `/Users/oluwatosinfamurewa/.claude/plans/velvety-whistling-elephant.md`
2. Review completed Phase 1 code for patterns
3. Check the exploration findings in the plan for context
4. Test incrementally - don't implement entire phases at once

---

**Document Version:** 1.0
**Last Updated:** 2025-12-11
**Phase 1 Completed By:** Claude Sonnet 4.5
**Next Phase:** Phase 2 - WebSocket Robustness
