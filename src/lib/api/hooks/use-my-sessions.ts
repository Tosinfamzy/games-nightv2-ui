import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { fetchAPI } from '../client'
import type { Session } from '../types'

/**
 * The sessions hosted by the signed-in games master (scoped server-side to the
 * Clerk-authed GM). Disabled when signed out, so anonymous players never fetch
 * — and never see — other people's sessions.
 */
export function useMySessions() {
  const { isSignedIn } = useAuth()
  return useQuery<Array<Session>>({
    queryKey: ['my-sessions'],
    queryFn: () => fetchAPI<Array<Session>>('/auth/games-master/sessions'),
    enabled: Boolean(isSignedIn),
  })
}
