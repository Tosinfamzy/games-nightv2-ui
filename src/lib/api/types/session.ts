import type { BaseEntity } from './common'

export interface Session extends BaseEntity {
  name: string
  description?: string
  status: SessionStatus
  gamesMasterId: string
}

export enum SessionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateSessionDto {
  name: string
  description?: string
  gamesMasterId: string
}

export interface UpdateSessionDto {
  name?: string
  description?: string
  status?: SessionStatus
}
