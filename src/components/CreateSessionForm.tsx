import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gamesMasterService, sessionService } from '../lib/api/services'
import type { CreateSessionDTO, Session } from '../lib/api/types'

interface CreateSessionFormProps {
  onCreateSuccess?: (session: Session) => void
}

export function CreateSessionForm({ onCreateSuccess }: CreateSessionFormProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [gamesMasterId, setGamesMasterId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    data: gamesMasters = [],
    isLoading: gamesMastersLoading,
    isError: gamesMastersError,
  } = useQuery({
    queryKey: ['gamesMasters'],
    queryFn: gamesMasterService.getAll,
  })

  useEffect(() => {
    if (!gamesMasterId && gamesMasters.length > 0) {
      setGamesMasterId(gamesMasters[0].id)
    }
  }, [gamesMasterId, gamesMasters])

  const createSessionMutation = useMutation({
    mutationFn: sessionService.create,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      onCreateSuccess?.(session)
      // Reset form
      setName('')
      setDescription('')
      setDate('')
      setLocation('')
      setGamesMasterId(gamesMasters[0]?.id ?? '')
      setFormError(null)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!gamesMasterId) {
      setFormError(
        gamesMasters.length === 0
          ? 'Please create a games master before scheduling a session.'
          : 'Select a games master for this session.',
      )
      return
    }

    const sessionData: CreateSessionDTO = {
      name,
      description,
      date: new Date(date).toISOString(),
      location: location || undefined,
      gamesMasterId,
    }

    createSessionMutation.mutate(sessionData)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Create New Session
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="gamesMasterId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Games Master *
          </label>
          <select
            id="gamesMasterId"
            value={gamesMasterId}
            onChange={(e) => {
              setGamesMasterId(e.target.value)
              setFormError(null)
            }}
            disabled={
              gamesMastersLoading ||
              gamesMastersError ||
              gamesMasters.length === 0
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {gamesMasters.length === 0 ? (
              <option value="">
                {gamesMastersLoading
                  ? 'Loading games masters...'
                  : 'No games masters available'}
              </option>
            ) : (
              gamesMasters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.name}
                </option>
              ))
            )}
          </select>
          {gamesMastersError && (
            <p className="text-red-500 text-sm mt-1">
              Unable to load games masters. Please try again.
            </p>
          )}
          {!gamesMastersLoading && gamesMasters.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Create a games master first so you can assign them to this
              session.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Session Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter session name"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter session description"
          />
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date & Time *
          </label>
          <input
            type="datetime-local"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter location (optional)"
          />
        </div>

        <button
          type="submit"
          disabled={
            createSessionMutation.isPending ||
            gamesMastersLoading ||
            gamesMasters.length === 0
          }
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
        </button>

        {formError && (
          <div className="text-red-500 text-sm mt-2">{formError}</div>
        )}

        {createSessionMutation.error && (
          <div className="text-red-500 text-sm mt-2">
            Error:{' '}
            {createSessionMutation.error instanceof Error
              ? createSessionMutation.error.message
              : 'Failed to create session'}
          </div>
        )}
      </form>
    </div>
  )
}
