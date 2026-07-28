import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from '@clerk/clerk-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn } = useAuth()

  // Players (signed out) only need to join/rejoin. The management views are
  // host-only, so they're hidden until a games master signs in.
  const navLinks = [
    { to: '/join', label: 'Join Session' },
    { to: '/rejoin', label: 'Rejoin' },
    { to: '/players', label: 'Players', hostOnly: true },
    { to: '/sessions', label: 'Sessions', hostOnly: true },
    { to: '/games', label: 'Games', hostOnly: true },
    { to: '/teams', label: 'Teams', hostOnly: true },
    { to: '/scoring', label: 'Live Scoring', hostOnly: true },
  ]
  const visibleLinks = navLinks.filter((link) => isSignedIn || !link.hostOnly)

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold text-gray-800 hover:text-gray-600"
          >
            Games Night
          </Link>

          <div className="flex items-center gap-3">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-4">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm"
                  activeProps={{
                    className: 'text-blue-600 hover:text-blue-700',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Games-master auth */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 min-h-[44px]">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-2">
            <div className="flex flex-col space-y-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-3 rounded-md"
                  activeProps={{
                    className: 'text-blue-600 bg-blue-50 hover:text-blue-700',
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
