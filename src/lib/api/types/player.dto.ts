export interface PlayerResponseDto {
  id: string
  name: string
  status: 'joined' | 'ready' | 'playing' | 'disconnected'
  lastConnectedAt: string | null
  sessionId: string | null
  teamIds: Array<string>
  scoreIds: Array<string>
  createdAt: string
  updatedAt: string
}

export interface PlayerListItemDto extends PlayerResponseDto {
  session?: {
    id: string
    name?: string
    status?: string
    joinCode?: string
  }
  teams?: Array<{
    id: string
    name?: string
  }>
}
