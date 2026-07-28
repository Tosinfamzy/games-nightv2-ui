import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { setClerkTokenGetter } from '../lib/api/client'

/**
 * Registers Clerk's session-token getter with the API client so the plain
 * `fetchAPI` function can attach the signed-in games master's Clerk token as a
 * Bearer credential. Renders nothing; clears the getter when signed out.
 */
export function ClerkTokenBridge() {
  const { getToken, isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn) {
      setClerkTokenGetter(() => getToken())
    } else {
      setClerkTokenGetter(null)
    }
    return () => setClerkTokenGetter(null)
  }, [getToken, isSignedIn])

  return null
}
