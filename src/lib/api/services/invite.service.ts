import { fetchAPI } from '../client'
import type { Session } from '../types'

export type RsvpStatus = 'PENDING' | 'GOING' | 'MAYBE' | 'NOT_GOING'

/** Result of joining a session (shared by join-by-code and join-via-invite). */
export interface JoinResult {
  session: Session
  playerId: string
  playerName: string
  message: string
  playerToken: string
}

/** The three states a guest can actually respond with. */
export type RsvpResponse = Exclude<RsvpStatus, 'PENDING'>

/** Event details bundled with an invite when viewed by token. */
export interface InviteSession {
  id: string
  name: string
  date: string
  description?: string | null
  location?: string | null
  /** Custom map link for the location (e.g. a Google Maps pin). */
  locationUrl?: string | null
  status: string
  joinCode?: string
  host?: { name: string } | null
}

export interface Invite {
  id: string
  sessionId: string
  name?: string | null
  email?: string | null
  inviteToken: string
  rsvpStatus: RsvpStatus
  plusOnes: number
  /** Names of the plus-ones, in order (may contain blanks for unnamed +1s). */
  plusOneNames?: Array<string>
  note?: string | null
  playerId?: string | null
  respondedAt?: string | null
  createdAt: string
  updatedAt: string
  /** Present on the public `getByToken` response. */
  session?: InviteSession
}

export interface InviteSummary {
  total: number
  pending: number
  going: number
  maybe: number
  notGoing: number
  headcount: number
}

export interface CreateInviteDTO {
  name: string
  email?: string
}

export interface RsvpDTO {
  status: RsvpResponse
  name?: string
  plusOnes?: number
  /** Names of the plus-ones; length sets the count. Blanks allowed. */
  plusOneNames?: Array<string>
  note?: string
}

/** Public event view behind a session's single shareable RSVP link. */
export interface PublicRsvpView {
  sessionId: string
  sessionName: string
  /** Session lifecycle status — the page only shows the RSVP form when SCHEDULED. */
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  date: string
  location?: string | null
  /** Custom map link for the location (e.g. a Google Maps pin). */
  locationUrl?: string | null
  description?: string | null
  /** The host's invite message, shown as a greeting on the RSVP page. */
  inviteMessage?: string | null
  hostName?: string | null
  goingHeadcount: number
}

/** A guest self-RSVPing via the shareable link (name + email required). */
export interface PublicRsvpDTO {
  name: string
  status: RsvpResponse
  email: string
  plusOnes?: number
  /** Names of the plus-ones; length sets the count. Blanks allowed. */
  plusOneNames?: Array<string>
  note?: string
}

export const inviteService = {
  // ----- Games-master guest-list management -----
  listBySession: (sessionId: string): Promise<Array<Invite>> => {
    return fetchAPI<Array<Invite>>(`/sessions/${sessionId}/invites`)
  },

  summary: (sessionId: string): Promise<InviteSummary> => {
    return fetchAPI<InviteSummary>(`/sessions/${sessionId}/invites/summary`)
  },

  create: (sessionId: string, data: CreateInviteDTO): Promise<Invite> => {
    return fetchAPI<Invite>(`/sessions/${sessionId}/invites`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  remove: (sessionId: string, inviteId: string): Promise<void> => {
    return fetchAPI<void>(`/sessions/${sessionId}/invites/${inviteId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Host-side check-in: add the guest (and one player per plus-one) as live
   * players, without them needing a device. Returns how many players were added.
   */
  checkIn: (
    sessionId: string,
    inviteId: string,
  ): Promise<{ invite: Invite; playersAdded: number }> => {
    return fetchAPI<{ invite: Invite; playersAdded: number }>(
      `/sessions/${sessionId}/invites/${inviteId}/check-in`,
      { method: 'POST' },
    )
  },

  // ----- Public RSVP (token-based) -----
  getByToken: (token: string): Promise<Invite> => {
    return fetchAPI<Invite>(`/invites/${token}`)
  },

  rsvp: (token: string, data: RsvpDTO): Promise<Invite> => {
    return fetchAPI<Invite>(`/invites/${token}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Join the live session straight from an invite link — no join code. The guest
   * is checked in against their RSVP. Only works while the session is joinable.
   */
  joinViaInvite: (token: string, name?: string): Promise<JoinResult> => {
    return fetchAPI<JoinResult>(`/invites/${token}/join`, {
      method: 'POST',
      body: JSON.stringify(name ? { name } : {}),
    })
  },

  // ----- Open self-serve RSVP (single shareable session link) -----
  getPublicView: (rsvpToken: string): Promise<PublicRsvpView> => {
    return fetchAPI<PublicRsvpView>(`/rsvp/${rsvpToken}`)
  },

  selfRsvp: (rsvpToken: string, data: PublicRsvpDTO): Promise<Invite> => {
    return fetchAPI<Invite>(`/rsvp/${rsvpToken}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
