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
  // Get all (active) games in the library. GET /game-library already filters to
  // active games server-side. NOTE: there is no /game-library/active route — it
  // matches @Get(':id') and 400s ("uuid is expected"), so don't add a getActive
  // that calls it.
  getAll: (): Promise<Array<GameLibraryItem>> => {
    return fetchAPI<Array<GameLibraryItem>>('/game-library')
  },

  // Get a specific game
  getById: (id: string): Promise<GameLibraryItem> => {
    return fetchAPI<GameLibraryItem>(`/game-library/${id}`)
  },
}
