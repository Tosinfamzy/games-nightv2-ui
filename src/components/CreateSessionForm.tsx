import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../services/sessions'
import type { CreateSessionDTO } from '../services/sessions'
import type { Session } from '../types'

interface CreateSessionFormProps {
  onCreateSuccess?: (session: Session) => void
}

export function CreateSessionForm({ onCreateSuccess }: CreateSessionFormProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')

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
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const sessionData: CreateSessionDTO = {
      name,
      description,
      date: new Date(date).toISOString(),
      location: location || undefined,
      gamesMasterId: '1', // TODO: Get from auth context
    }

    createSessionMutation.mutate(sessionData)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Session</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
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
          disabled={createSessionMutation.isPending}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
        </button>

        {createSessionMutation.error && (
          <div className="text-red-500 text-sm mt-2">
            Error: {createSessionMutation.error instanceof Error ? createSessionMutation.error.message : 'Failed to create session'}
          </div>
        )}
      </form>
    </div>
  )
}
