import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Player } from '../lib/api/types'

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
    localStorage.setItem('gn_player', JSON.stringify(p))

    if (token) {
      setPlayerTokenState(token)
      localStorage.setItem('gn_player_token', token)
    }
  }

  const setPlayerToken = (token: string) => {
    setPlayerTokenState(token)
    localStorage.setItem('gn_player_token', token)
  }

  const clearPlayer = () => {
    setPlayerState(null)
    setPlayerTokenState(null)
    localStorage.removeItem('gn_player')
    localStorage.removeItem('gn_player_token')
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
