import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Player } from '../lib/api/types'

/**
 * localStorage flag marking the current player token as a host-connection token
 * (minted for a Clerk-only host to open sockets; it has no player record). Lets
 * useAutoRejoin skip it instead of attempting — and on failure wiping — a rejoin.
 */
export const HOST_TOKEN_MARKER = 'gn_host_minted'

/**
 * Storage that never throws. Some in-app browsers (Instagram/Facebook) and
 * Safari Private Mode block or throw on localStorage — an unguarded write there
 * would crash the join flow (the token would never get set → no real-time). We
 * persist when we can and degrade to in-memory-only (this session) when we can't.
 */
const safeStore = {
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* storage blocked — keep going with in-memory state */
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

interface PlayerContextValue {
  player: Player | null
  playerToken: string | null
  setPlayer: (player: Player, token?: string) => void
  setPlayerToken: (token: string) => void
  clearPlayer: () => void
  isAuthenticated: boolean
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined)

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider')
  }
  return context
}

interface PlayerProviderProps {
  children: ReactNode
}

export const PlayerProvider = ({ children }: PlayerProviderProps) => {
  const [player, setPlayerState] = useState<Player | null>(() => {
    try {
      const stored = localStorage.getItem('gn_player')
      if (!stored || stored === 'undefined' || stored === 'null') {
        return null
      }
      return JSON.parse(stored)
    } catch (error) {
      console.warn('Failed to parse player from localStorage:', error)
      // Clear invalid data
      localStorage.removeItem('gn_player')
      return null
    }
  })

  const [playerToken, setPlayerTokenState] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem('gn_player_token')
      if (!stored || stored === 'undefined' || stored === 'null') {
        return null
      }
      return stored
    } catch (error) {
      console.warn('Failed to get player token from localStorage:', error)
      localStorage.removeItem('gn_player_token')
      return null
    }
  })

  const setPlayer = (p: Player, token?: string) => {
    setPlayerState(p)
    safeStore.set('gn_player', JSON.stringify(p))
    // A real player record — no longer a bare host-minted token.
    safeStore.remove(HOST_TOKEN_MARKER)

    if (token) {
      setPlayerTokenState(token)
      safeStore.set('gn_player_token', token)
    }
  }

  // Used only to give a Clerk-only host a realtime socket token (no player
  // record). Mark it so useAutoRejoin doesn't treat it as an orphaned token and
  // wipe it on a failed rejoin.
  const setPlayerToken = (token: string) => {
    setPlayerTokenState(token)
    safeStore.set('gn_player_token', token)
    safeStore.set(HOST_TOKEN_MARKER, '1')
  }

  const clearPlayer = () => {
    setPlayerState(null)
    setPlayerTokenState(null)
    safeStore.remove('gn_player')
    safeStore.remove('gn_player_token')
    safeStore.remove(HOST_TOKEN_MARKER)
  }

  return (
    <PlayerContext.Provider
      value={{
        player,
        playerToken,
        setPlayer,
        setPlayerToken,
        clearPlayer,
        isAuthenticated: !!player,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}
