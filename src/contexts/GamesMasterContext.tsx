import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface GamesMaster {
  id: string
  name: string
  hostCode: string
  sessionCount: number
  createdAt: string
  updatedAt: string
}

interface GamesMasterContextValue {
  gm: GamesMaster | null
  setGM: (gm: GamesMaster | null) => void
  clearGM: () => void
  isGM: boolean
}

const GamesMasterContext = createContext<GamesMasterContextValue | undefined>(
  undefined,
)

const STORAGE_KEY = 'gamesMaster'

export function GamesMasterProvider({ children }: { children: ReactNode }) {
  const [gm, setGMState] = useState<GamesMaster | null>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored !== 'undefined' && stored !== 'null') {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Failed to parse stored GM:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    return null
  })

  const setGM = (newGM: GamesMaster | null) => {
    setGMState(newGM)
    if (newGM) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newGM))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const clearGM = () => {
    setGMState(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value: GamesMasterContextValue = {
    gm,
    setGM,
    clearGM,
    isGM: !!gm,
  }

  return (
    <GamesMasterContext.Provider value={value}>
      {children}
    </GamesMasterContext.Provider>
  )
}

export function useGamesMasterContext() {
  const context = useContext(GamesMasterContext)
  if (!context) {
    throw new Error(
      'useGamesMasterContext must be used within GamesMasterProvider',
    )
  }
  return context
}
