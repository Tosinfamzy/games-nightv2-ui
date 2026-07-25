import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useGamesMaster } from '../hooks/useGamesMaster'

export function CreateGamesMasterForm() {
  const [name, setName] = useState('')
  const [showCode, setShowCode] = useState(false)
  const { gm, createGamesMaster, isCreating } = useGamesMaster()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      createGamesMaster(name.trim())
      setShowCode(true)
    }
  }

  const handleContinue = () => {
    navigate({ to: '/sessions/new' })
  }

  // If GM was just created, show success message with code
  if (showCode && gm) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">Welcome, {gm.name}!</h2>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-blue-700 mb-2">Your Host Code</p>
            <div className="text-4xl font-bold text-blue-600 tracking-widest mb-2">
              {gm.hostCode}
            </div>
            <p className="text-xs text-blue-600">
              Save this code to manage your sessions later!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleContinue}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Create Your First Session
            </button>

            <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium mb-1">What's a host code?</p>
              <p>
                Use this code to manage your sessions from any device. Lost it?
                Just enter your name to retrieve it!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-2xl font-bold mb-2">Start Hosting</h2>
        <p className="text-gray-600">Create your Games Master profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be your Games Master name
          </p>
        </div>

        <button
          type="submit"
          disabled={!name.trim() || isCreating}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isCreating ? 'Creating...' : 'Start Hosting'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Already have a host code?</p>
        <button
          onClick={() => navigate({ to: '/gm/login' })}
          className="text-blue-500 hover:text-blue-600 font-medium text-sm"
        >
          Enter Host Code
        </button>
      </div>
    </div>
  )
}
