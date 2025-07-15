import { Link, createFileRoute } from '@tanstack/react-router'

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Games Night
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Organize and track your game sessions with friends
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/sessions"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Game Sessions
            </h2>
            <p className="text-gray-600">
              Create and manage your game sessions
            </p>
          </Link>

          <Link
            to="/games"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Active Games
            </h2>
            <p className="text-gray-600">View and manage your ongoing games</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: HomePage,
})
