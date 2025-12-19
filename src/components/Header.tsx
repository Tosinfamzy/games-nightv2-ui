import { Link } from '@tanstack/react-router'

export default function Header() {
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

          <div className="flex gap-4">
            <Link
              to="/join"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
              activeProps={{
                className: 'text-blue-600 hover:text-blue-700',
              }}
            >
              Join Session
            </Link>
            <Link
              to="/rejoin"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
              activeProps={{
                className: 'text-blue-600 hover:text-blue-700',
              }}
            >
              Rejoin
            </Link>
            <Link
              to="/games-master"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
            >
              Games Master
            </Link>
            <Link
              to="/players"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
              activeProps={{
                className: 'text-blue-600 hover:text-blue-700',
              }}
            >
              Players
            </Link>
            <Link
              to="/sessions"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
              activeProps={{
                className: 'text-blue-600 hover:text-blue-700',
              }}
            >
              Sessions
            </Link>
            <Link
              to="/games"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
              activeProps={{
                className: 'text-blue-600 hover:text-blue-700',
              }}
            >
              Games
            </Link>
            <Link
              to="/teams"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
              activeProps={{
                className: 'text-blue-600 hover:text-blue-700',
              }}
            >
              Teams
            </Link>
            <Link
              to="/scoring"
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
              activeProps={{
                className: 'text-blue-600 hover:text-blue-700',
              }}
            >
              Live Scoring
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
