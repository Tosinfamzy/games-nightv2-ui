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

export interface CreateGameLibraryItemDTO {
  name: string
  description: string
  minPlayers: number
  maxPlayers: number
  estimatedDuration: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  categories: Array<string>
  equipment?: string
  rules?: string
}

export interface UpdateGameLibraryItemDTO {
  name?: string
  description?: string
  minPlayers?: number
  maxPlayers?: number
  estimatedDuration?: number
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  categories?: Array<string>
  equipment?: string
  rules?: string
  isActive?: boolean
}

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

  // Create a new game
  create: (data: CreateGameLibraryItemDTO): Promise<GameLibraryItem> => {
    return fetchAPI<GameLibraryItem>('/game-library', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update a game
  update: (
    id: string,
    data: UpdateGameLibraryItemDTO,
  ): Promise<GameLibraryItem> => {
    return fetchAPI<GameLibraryItem>(`/game-library/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Delete a game
  delete: (id: string): Promise<void> => {
    return fetchAPI<void>(`/game-library/${id}`, {
      method: 'DELETE',
    })
  },

  // Toggle active status
  activate: (id: string): Promise<GameLibraryItem> => {
    return fetchAPI<GameLibraryItem>(`/game-library/${id}/activate`, {
      method: 'PATCH',
    })
  },

  // Deactivate game
  deactivate: (id: string): Promise<GameLibraryItem> => {
    return fetchAPI<GameLibraryItem>(`/game-library/${id}/deactivate`, {
      method: 'PATCH',
    })
  },
}
