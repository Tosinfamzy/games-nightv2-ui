import { fetchAPI } from '../client'
import type { TeamResponseDto } from '../types/team.dto'

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
}

export { mapDto as mapTeamDto }
