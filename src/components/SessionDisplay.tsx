import { useState } from 'react'

interface SessionDisplayProps {
  session: {
    id: string
    joinCode: string
    date: string
    status: string
  }
}

export function SessionDisplay({ session }: SessionDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyJoinCode = () => {
    navigator.clipboard.writeText(session.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Session Created!
        </h3>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          {session.status}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session ID
          </label>
          <p className="text-gray-900 font-mono text-sm">{session.id}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Join Code
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-blue-600 tracking-wider">
              {session.joinCode}
            </span>
            <button
              onClick={copyJoinCode}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Share this code with players to let them join
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            How players can join:
          </h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Go to the join page</li>
            <li>
              2. Enter the 6-digit code: <strong>{session.joinCode}</strong>
            </li>
            <li>3. Enter their name</li>
            <li>4. Click "Join Session"</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
