import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { fetchAPI } from '../client'

export interface CurrentGm {
  id: string
  name: string
  hostCode: string
}

/**
 * The GamesMaster linked to the signed-in Clerk user (created lazily on first
 * sign-in by the backend). Used to decide whether the current user is a given
 * session's host. Disabled — and returns no data — when signed out, so
 * anonymous players never call it.
 */
export function useCurrentGm() {
  const { isSignedIn } = useAuth()
  return useQuery<CurrentGm>({
    queryKey: ['current-gm'],
    queryFn: () => fetchAPI<CurrentGm>('/auth/games-master'),
    enabled: Boolean(isSignedIn),
    staleTime: 1000 * 60 * 5,
  })
}
