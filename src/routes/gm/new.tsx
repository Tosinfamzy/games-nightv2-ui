import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { CreateGamesMasterForm } from '../../components/CreateGamesMasterForm'
import { useGamesMaster } from '../../hooks/useGamesMaster'

export const Route = createFileRoute('/gm/new')({
  component: NewGamesMasterPage,
})

function NewGamesMasterPage() {
  const navigate = useNavigate()
  const { gm, isGM } = useGamesMaster()

  // If already a GM, redirect to create session
  useEffect(() => {
    if (isGM && gm) {
      navigate({ to: '/sessions/new' })
    }
  }, [isGM, gm, navigate])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Become a Games Master
            </h1>
            <p className="text-gray-600">
              Create your Games Master profile to start hosting game nights
            </p>
          </div>

          <CreateGamesMasterForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have a host code?{' '}
              <button
                onClick={() => navigate({ to: '/gm/login' })}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in with code
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
