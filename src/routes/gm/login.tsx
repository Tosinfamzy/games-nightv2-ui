import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { RetrieveHostCode } from '../../components/RetrieveHostCode'
import { useGamesMaster } from '../../hooks/useGamesMaster'

export const Route = createFileRoute('/gm/login')({
  component: GamesMasterLoginPage,
})

function GamesMasterLoginPage() {
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
              Games Master Sign In
            </h1>
            <p className="text-gray-600">
              Retrieve your host code or sign in with an existing code
            </p>
          </div>

          <RetrieveHostCode />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New to Games Night?{' '}
              <button
                onClick={() => navigate({ to: '/gm/new' })}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create a Games Master profile
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
