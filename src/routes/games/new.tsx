import { Link, createFileRoute } from '@tanstack/react-router'
import { useCreateGame } from '../../hooks/useGames'

export const Route = createFileRoute('/games/new')({
  component: NewGamePage,
})

function NewGamePage() {
  const createGame = useCreateGame()

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Game</h1>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              createGame.mutate({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                sessionId: formData.get('sessionId') as string,
                minPlayers: parseInt(formData.get('minPlayers') as string, 10),
                maxPlayers: parseInt(formData.get('maxPlayers') as string, 10),
                maxRounds: parseInt(formData.get('maxRounds') as string, 10),
                scores: [],
                teams: [],
              })
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Game Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="minPlayers"
                  className="block text-sm font-medium text-gray-700"
                >
                  Min Players
                </label>
                <input
                  type="number"
                  id="minPlayers"
                  name="minPlayers"
                  min="1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="maxPlayers"
                  className="block text-sm font-medium text-gray-700"
                >
                  Max Players
                </label>
                <input
                  type="number"
                  id="maxPlayers"
                  name="maxPlayers"
                  min="1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="maxRounds"
                  className="block text-sm font-medium text-gray-700"
                >
                  Max Rounds
                </label>
                <input
                  type="number"
                  id="maxRounds"
                  name="maxRounds"
                  min="1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="sessionId"
                className="block text-sm font-medium text-gray-700"
              >
                Session
              </label>
              <input
                type="text"
                id="sessionId"
                name="sessionId"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link
                to="/games"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                disabled={createGame.isPending}
              >
                {createGame.isPending ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
