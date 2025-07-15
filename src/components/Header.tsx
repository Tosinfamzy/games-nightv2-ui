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
          </div>
        </nav>
      </div>
    </header>
  )
}
