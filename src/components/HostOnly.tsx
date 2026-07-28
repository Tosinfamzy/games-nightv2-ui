import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react'
import type { ReactNode } from 'react'

/**
 * Gates a page to signed-in games masters. Signed out shows a sign-in prompt
 * (and, crucially, does NOT mount the children — so their data queries never
 * run for anonymous players). Used for the host management pages.
 */
export function HostOnly({
  children,
  title = 'Games master only',
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <>
      <SignedOut>
        <div className="container mx-auto p-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center mt-8">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-gray-600 mb-6">
              Sign in as a games master to access this page. Playing tonight?
              You don&apos;t need this — just join with your host&apos;s code or
              link.
            </p>
            <SignInButton mode="modal">
              <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 font-medium">
                Sign in
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>{children}</SignedIn>
    </>
  )
}
