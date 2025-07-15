import { createFileRoute } from '@tanstack/react-router'
import { useCreateSession } from '../../hooks/useSessions'

export const Route = createFileRoute('/sessions/new')({
  component: NewSessionPage,
})

function NewSessionPage() {
  const createSession = useCreateSession()

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Session</h1>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              createSession.mutate({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                date: new Date().toISOString(),
                gamesMasterId: '1', // TODO: Replace with actual user ID
              })
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Session Name
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

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                disabled={createSession.isPending}
              >
                {createSession.isPending ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
