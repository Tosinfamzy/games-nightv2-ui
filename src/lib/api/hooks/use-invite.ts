import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inviteService } from '../services/invite.service'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type {
  CreateInviteDTO,
  Invite,
  InviteSummary,
  RsvpDTO,
} from '../services/invite.service'

export const inviteKeys = {
  all: ['invites'] as const,
  session: (sessionId: string) =>
    [...inviteKeys.all, 'session', sessionId] as const,
  summary: (sessionId: string) =>
    [...inviteKeys.all, 'summary', sessionId] as const,
  token: (token: string) => [...inviteKeys.all, 'token', token] as const,
}

// ----- Games-master queries -----

export const useSessionInvites = (
  sessionId: string,
): UseQueryResult<Array<Invite>, Error> =>
  useQuery({
    queryKey: inviteKeys.session(sessionId),
    queryFn: () => inviteService.listBySession(sessionId),
    enabled: Boolean(sessionId),
  })

export const useInviteSummary = (
  sessionId: string,
): UseQueryResult<InviteSummary, Error> =>
  useQuery({
    queryKey: inviteKeys.summary(sessionId),
    queryFn: () => inviteService.summary(sessionId),
    enabled: Boolean(sessionId),
  })

// ----- Public (token) query -----

export const useInviteByToken = (
  token: string,
): UseQueryResult<Invite, Error> =>
  useQuery({
    queryKey: inviteKeys.token(token),
    queryFn: () => inviteService.getByToken(token),
    enabled: Boolean(token),
    retry: 1,
  })

// ----- Mutations -----

export const useAddInvite = (
  sessionId: string,
): UseMutationResult<Invite, Error, CreateInviteDTO> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => inviteService.create(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.session(sessionId) })
      queryClient.invalidateQueries({ queryKey: inviteKeys.summary(sessionId) })
    },
  })
}

export const useRemoveInvite = (
  sessionId: string,
): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteId) => inviteService.remove(sessionId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.session(sessionId) })
      queryClient.invalidateQueries({ queryKey: inviteKeys.summary(sessionId) })
    },
  })
}

export const useRsvp = (
  token: string,
): UseMutationResult<Invite, Error, RsvpDTO> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => inviteService.rsvp(token, data),
    onSuccess: (invite) => {
      queryClient.setQueryData(inviteKeys.token(token), invite)
    },
  })
}
