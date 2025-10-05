export interface TeamResponseDto {
  id: string
  name: string
  color?: string | null
  position: number
  isActive: boolean
  sessionId: string | null
  gameId: string | null
  playerIds: Array<string>
  scoreIds: Array<string>
  createdAt: string
  updatedAt: string
}
