import { fetchAPI } from '../client'

export interface AddGamesToSessionDTO {
  gameLibraryIds: Array<string>
}

export interface RemoveGamesFromSessionDTO {
  gameId: string
}

export interface CreateTeamDTO {
  name: string
  gameId?: string
  color?: string
  playerIds?: Array<string>
}

export interface AssignPlayersToTeamDTO {
  playerIds: Array<string>
}

export interface SessionReadiness {
  sessionId: string
  totalPlayers: number
  readyPlayers: number
  allReady: boolean
  playersStatus: Array<{
    playerId: string
    playerName: string
    isReady: boolean
    status: string
  }>
}

export const sessionManagementService = {
  // Game management
  addGamesToSession: (sessionId: string, data: AddGamesToSessionDTO) =>
    fetchAPI(`/sessions/${sessionId}/games`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeGamesFromSession: (
    sessionId: string,
    data: RemoveGamesFromSessionDTO,
  ) =>
    fetchAPI(`/sessions/${sessionId}/games`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),

  getSessionGames: (sessionId: string) =>
    fetchAPI(`/sessions/${sessionId}/games`),

  // Team management
  createTeam: (sessionId: string, data: CreateTeamDTO) =>
    fetchAPI(`/sessions/${sessionId}/teams`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSessionTeams: (sessionId: string) =>
    fetchAPI(`/sessions/${sessionId}/teams`),

  assignPlayersToTeam: (
    sessionId: string,
    teamId: string,
    data: AssignPlayersToTeamDTO,
  ) =>
    fetchAPI(`/sessions/${sessionId}/teams/${teamId}/players`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Session readiness
  getSessionReadiness: (sessionId: string): Promise<SessionReadiness> =>
    fetchAPI(`/sessions/${sessionId}/readiness`),

  setPlayerReady: (sessionId: string, playerId: string, ready: boolean) =>
    fetchAPI(`/sessions/${sessionId}/players/${playerId}/ready`, {
      method: 'POST',
      body: JSON.stringify({ ready }),
    }),

  // Session lifecycle
  checkSessionCanStart: (sessionId: string) =>
    fetchAPI(`/sessions/${sessionId}/can-start`),

  getSessionStats: (sessionId: string) =>
    fetchAPI(`/sessions/${sessionId}/stats`),
}
