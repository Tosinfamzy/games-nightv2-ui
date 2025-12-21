import { fetchAPI } from '../client'
import type {
  TeamResponseDto,
  CreateTeamsDto,
  TeamFormationSuggestionsResponse,
} from '../types/team.dto'
import { TeamFormationStrategy } from '../types/team.dto'

export interface Team {
  id: string
  name: string
  color?: string
  position: number
  isActive: boolean
  sessionId?: string | null
  gameId?: string | null
  playerIds: Array<string>
  scoreIds: Array<string>
  createdAt: string
  updatedAt: string
}

export interface CreateTeamDTO {
  name: string
  gameId: string
  sessionId: string
  color?: string
  position?: number
  playerIds?: Array<string>
}

export interface UpdateTeamDTO {
  name?: string
  color?: string
  position?: number
  playerIds?: Array<string>
  isActive?: boolean
}

const mapDto = (dto: TeamResponseDto): Team => ({
  id: dto.id,
  name: dto.name,
  color: dto.color ?? undefined,
  position: dto.position,
  isActive: dto.isActive,
  sessionId: dto.sessionId ?? undefined,
  gameId: dto.gameId ?? undefined,
  playerIds: dto.playerIds ?? [],
  scoreIds: dto.scoreIds ?? [],
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
})

export const teamService = {
  async getAll(): Promise<Array<Team>> {
    const data = await fetchAPI<Array<TeamResponseDto>>('/teams')
    return data.map(mapDto)
  },

  async getBySession(sessionId: string): Promise<Array<Team>> {
    const data = await fetchAPI<Array<TeamResponseDto>>(
      `/teams/session/${sessionId}`,
    )
    return data.map(mapDto)
  },

  async getByGame(gameId: string): Promise<Array<Team>> {
    const data = await fetchAPI<Array<TeamResponseDto>>(`/teams/game/${gameId}`)
    return data.map(mapDto)
  },

  async getById(id: string): Promise<Team> {
    const data = await fetchAPI<TeamResponseDto>(`/teams/${id}`)
    return mapDto(data)
  },

  create(data: CreateTeamDTO): Promise<Team> {
    return fetchAPI<TeamResponseDto>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(mapDto)
  },

  update(id: string, data: UpdateTeamDTO): Promise<Team> {
    return fetchAPI<TeamResponseDto>(`/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }).then(mapDto)
  },

  addPlayers(teamId: string, playerIds: Array<string>): Promise<Team> {
    return fetchAPI<TeamResponseDto>(`/teams/${teamId}/players`, {
      method: 'POST',
      body: JSON.stringify({ playerIds }),
    }).then(mapDto)
  },

  removePlayers(teamId: string, playerIds: Array<string>): Promise<Team> {
    return fetchAPI<TeamResponseDto>(`/teams/${teamId}/players`, {
      method: 'DELETE',
      body: JSON.stringify({ playerIds }),
    }).then(mapDto)
  },

  delete(id: string): Promise<void> {
    return fetchAPI<void>(`/teams/${id}`, {
      method: 'DELETE',
    })
  },

  createTeams: async (
    gameId: string,
    data: CreateTeamsDto,
  ): Promise<Team[]> => {
    const result = await fetchAPI<TeamResponseDto[]>(
      `/teams/game/${gameId}/create-teams`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
    )
    return result.map(mapDto)
  },

  rebalanceTeams: async (
    gameId: string,
    strategy?: TeamFormationStrategy,
  ): Promise<Team[]> => {
    const result = await fetchAPI<TeamResponseDto[]>(
      `/teams/game/${gameId}/rebalance`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: strategy || TeamFormationStrategy.BALANCED,
        }),
      },
    )
    return result.map(mapDto)
  },

  /**
   * Shuffle players randomly across all teams
   */
  shufflePlayers: async (gameId: string): Promise<Team[]> => {
    const result = await fetchAPI<TeamResponseDto[]>(
      `/teams/game/${gameId}/shuffle`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    return result.map(mapDto)
  },

  getTeamSuggestions: async (
    gameId: string,
  ): Promise<TeamFormationSuggestionsResponse> => {
    return fetchAPI<TeamFormationSuggestionsResponse>(
      `/teams/game/${gameId}/suggestions`,
      {
        method: 'GET',
      },
    )
  },

  getTeamStats: async (gameId: string): Promise<any> => {
    return fetchAPI<any>(`/teams/game/${gameId}/stats`, {
      method: 'GET',
    })
  },

  /**
   * Swap a player from one team to another
   */
  swapPlayer: async (
    playerId: string,
    fromTeamId: string,
    toTeamId: string,
  ): Promise<Team[]> => {
    const result = await fetchAPI<TeamResponseDto[]>(`/teams/swap-player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, fromTeamId, toTeamId }),
    })
    return result.map(mapDto)
  },

  /**
   * Dissolve a team and return its players to the unassigned pool
   */
  dissolveTeam: async (teamId: string): Promise<{ message: string }> => {
    return fetchAPI<{ message: string }>(`/teams/${teamId}/dissolve`, {
      method: 'DELETE',
    })
  },

  /**
   * Reassign a player to a different team (removes from current team if any)
   */
  reassignPlayer: async (playerId: string, newTeamId: string): Promise<Team> => {
    const result = await fetchAPI<TeamResponseDto>(`/teams/reassign-player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, newTeamId }),
    })
    return mapDto(result)
  },
}

export { mapDto as mapTeamDto }
