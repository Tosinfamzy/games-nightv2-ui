import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '@/hooks/useSessions'

export const Route = createFileRoute('/sessions/$id')({
  component: SessionDetailsPage,
})

function SessionDetailsPage() {
  const { id } = Route.useParams()
  const { data: session, isLoading } = useSession(id)

  if (isLoading) {
    return <div className="p-4">Loading session...</div>
  }

  if (!session) {
    return <div className="p-4">Session not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{session.name}</h1>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{session.description}</p>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium">{session.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
