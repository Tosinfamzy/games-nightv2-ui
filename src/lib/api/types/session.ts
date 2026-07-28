import type { BaseEntity } from './common'

export interface Session extends BaseEntity {
  name: string
  description?: string
  date: string
  location?: string
  status: SessionStatus
  joinCode: string
  host: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  gamesMasterId?: string
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateSessionDto {
  name: string
  description?: string
  gamesMasterId?: string
}

export interface UpdateSessionDto {
  name?: string
  description?: string
  status?: SessionStatus
}
