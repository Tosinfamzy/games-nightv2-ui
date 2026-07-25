import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { sessionService } from '../lib/api/services'
import { showToast, toastHelpers } from '../lib/toast'
import { useGamesMaster } from '../hooks/useGamesMaster'
import { usePlayer } from '../contexts/PlayerContext'
import type { CreateSessionResponse } from '../lib/api/services'
import type { CreateSessionDTO, Session } from '../lib/api/types'

interface CreateSessionFormProps {
  onCreateSuccess?: (session: Session) => void
}

export function CreateSessionForm({ onCreateSuccess }: CreateSessionFormProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { gm, isGM } = useGamesMaster()
  const { setPlayer } = usePlayer()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // Redirect to GM creation if no GM found
  useEffect(() => {
    if (!isGM) {
      navigate({ to: '/gm/new' })
    }
  }, [isGM, navigate])

  const createSessionMutation = useMutation<
    CreateSessionResponse,
    Error,
    CreateSessionDTO
  >({
    mutationFn: sessionService.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })

      // Save GM's player and token to PlayerContext
      setPlayer(response.gmPlayer, response.playerToken)

      showToast.success(
        response.message ||
          'Session created successfully! You have been added as a player.',
      )
      onCreateSuccess?.(response.session)
      // Reset form
      setName('')
      setDescription('')
      setDate('')
      setLocation('')
      setFormError(null)
    },
    onError: (error) => {
      toastHelpers.operationError('create session', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!gm) {
      setFormError('Games Master profile not found. Please try again.')
      return
    }

    // Validate date is in future
    if (date) {
      const selectedDate = new Date(date)
      const now = new Date()
      now.setHours(0, 0, 0, 0) // Reset to start of day

      if (selectedDate < now) {
        setFormError('Session date must be in the future.')
        showToast.error('Please select a future date for the session.')
        return
      }
    }

    const sessionData: CreateSessionDTO = {
      name,
      description,
      date: new Date(date).toISOString(),
      location: location || undefined,
      gamesMasterId: gm.id,
    }

    createSessionMutation.mutate(sessionData)
  }

  // Loading state while checking GM
  if (!gm) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Create New Session
      </h2>

      {/* GM Info Display */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700">Hosting as</p>
            <p className="font-bold text-blue-900">{gm.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-600">Host Code</p>
            <p className="font-mono font-bold text-blue-700">{gm.hostCode}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            name="sessionName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            style={{ fontSize: '16px' }}
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
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            autoComplete="off"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            style={{ fontSize: '16px' }}
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
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            style={{ fontSize: '16px' }}
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
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            autoComplete="off"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            style={{ fontSize: '16px' }}
            placeholder="Enter location (optional)"
          />
        </div>

        <button
          type="submit"
          disabled={createSessionMutation.isPending}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-base font-medium"
        >
          {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
        </button>

        {formError && (
          <div className="text-red-500 text-sm mt-2">{formError}</div>
        )}
      </form>
    </div>
  )
}
