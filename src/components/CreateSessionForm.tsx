import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sessionService } from '../services/sessions'
import type { CreateSessionDTO } from '../services/sessions'
import type { Session } from '../types'

interface CreateSessionFormProps {
  onCreateSuccess?: (session: Session) => void
}

export function CreateSessionForm({ onCreateSuccess }: CreateSessionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
  })

  const createSessionMutation = useMutation({
    mutationFn: (data: CreateSessionDTO) => sessionService.create(data),
    onSuccess: (session) => {
      onCreateSuccess?.(session)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      createSessionMutation.mutate({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        date: new Date().toISOString(),
        gamesMasterId: 'demo-host', // Demo value
      })
    }
  }

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        Create Game Session
      </h2>

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
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="e.g., Friday Game Night"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
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
            value={formData.description}
            onChange={handleInputChange('description')}
            placeholder="Optional description of the games you'll play..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
            value={formData.location}
            onChange={handleInputChange('location')}
            placeholder="e.g., John's House, Community Center"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {createSessionMutation.error && (
          <div className="text-red-600 text-sm">
            {createSessionMutation.error instanceof Error
              ? createSessionMutation.error.message
              : 'Failed to create session'}
          </div>
        )}

        <button
          type="submit"
          disabled={!formData.name.trim() || createSessionMutation.isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          <strong>🎮 What happens next:</strong> You'll get a 6-digit join code
          to share with players!
        </p>
      </div>
    </div>
  )
}
