import { useState } from 'react'
import { useGamesMaster } from '../hooks/useGamesMaster'
import { useNavigate } from '@tanstack/react-router'

export function RetrieveHostCode() {
  const [mode, setMode] = useState<'code' | 'name'>('code')
  const [codeInput, setCodeInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const {
    loadByCode,
    retrieveCodeByName,
    isLoading,
    isRetrieving,
    retrievedGMs,
  } = useGamesMaster()
  const navigate = useNavigate()

  const handleLoadByCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (codeInput.trim().length === 6) {
      loadByCode(codeInput.trim())
      // Will navigate on success via toast
      setTimeout(() => {
        navigate({ to: '/sessions/new' })
      }, 1500)
    }
  }

  const handleRetrieveByName = (e: React.FormEvent) => {
    e.preventDefault()
    if (nameInput.trim()) {
      retrieveCodeByName(nameInput.trim())
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🔑</div>
        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
        <p className="text-gray-600">Enter your host code to continue</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('code')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === 'code'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          I have my code
        </button>
        <button
          onClick={() => setMode('name')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === 'name'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Forgot my code
        </button>
      </div>

      {mode === 'code' ? (
        <form onSubmit={handleLoadByCode} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Host Code
            </label>
            <input
              type="text"
              id="code"
              value={codeInput}
              onChange={(e) =>
                setCodeInput(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                    .slice(0, 6),
                )
              }
              placeholder="ABC123"
              required
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Enter your 6-character code
            </p>
          </div>

          <button
            type="submit"
            disabled={codeInput.length !== 6 || isLoading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Loading...' : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRetrieveByName} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Games Master Name
            </label>
            <input
              type="text"
              id="name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll find your host code for you
            </p>
          </div>

          <button
            type="submit"
            disabled={!nameInput.trim() || isRetrieving}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isRetrieving ? 'Searching...' : 'Find My Code'}
          </button>

          {retrievedGMs && retrievedGMs.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">
                {retrievedGMs.length === 1
                  ? 'Found your code!'
                  : `Found ${retrievedGMs.length} profiles:`}
              </p>
              <div className="space-y-2">
                {retrievedGMs.map((gm) => (
                  <div
                    key={gm.id}
                    className="flex items-center justify-between p-3 bg-white rounded border border-green-100"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{gm.name}</p>
                      <p className="text-xs text-gray-500">
                        {gm.sessionCount} session
                        {gm.sessionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Code:</p>
                      <p className="text-lg font-bold text-blue-600 tracking-wider">
                        {gm.hostCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-green-700 mt-2">
                Copy your code and use "I have my code" tab above
              </p>
            </div>
          )}
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
        <button
          onClick={() => navigate({ to: '/gm/new' })}
          className="text-blue-500 hover:text-blue-600 font-medium text-sm"
        >
          Create Games Master Profile
        </button>
      </div>
    </div>
  )
}
