import { fetchAPI } from '../client'

export interface GameLibraryItem {
  id: string
  name: string
  description: string
  minPlayers: number
  maxPlayers: number
  estimatedDuration: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  categories: Array<string>
  equipment?: string
  rules?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// The game library is a shared, server-managed catalog. It is read-only over
// the API (create/update/activate/deactivate/delete were removed backend-side,
// as no per-tenant ownership exists), so only read methods live here.
export const gameLibraryService = {
  // Get all games in library
  getAll: (): Promise<Array<GameLibraryItem>> => {
    return fetchAPI<Array<GameLibraryItem>>('/game-library')
  },

  // Get active games only
  getActive: (): Promise<Array<GameLibraryItem>> => {
    return fetchAPI<Array<GameLibraryItem>>('/game-library/active')
  },

  // Get a specific game
  getById: (id: string): Promise<GameLibraryItem> => {
    return fetchAPI<GameLibraryItem>(`/game-library/${id}`)
  },
}
