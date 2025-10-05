import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CreateSessionForm } from '../components/CreateSessionForm'
import { JoinSessionForm } from '../components/JoinSessionForm'
import { SessionDisplay } from '../components/SessionDisplay'
import type { Session } from '../lib/api/types'

export const Route = createFileRoute('/flow-demo')({
  component: FlowDemoPage,
})

function FlowDemoPage() {
  const [createdSession, setCreatedSession] = useState<Session | null>(null)
  const [joinedSession, setJoinedSession] = useState<Session | null>(null)
  // const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')

  const handleCreateSuccess = (session: Session) => {
    setCreatedSession(session)
  }

  const handleJoinSuccess = (session: Session) => {
    setJoinedSession(session)
  }

  const resetDemo = () => {
    setCreatedSession(null)
    setJoinedSession(null)
    // setActiveTab('create')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎮 Complete Session Flow Demo
            </h1>
            <p className="text-gray-600">
              See how hosts create sessions and players join them
            </p>
          </div>

          {!createdSession && !joinedSession ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Host Side */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">1</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Host Creates Session
                    </h2>
                  </div>
                  <CreateSessionForm onCreateSuccess={handleCreateSuccess} />
                </div>
              </div>

              {/* Player Side */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Player Joins Session
                    </h2>
                  </div>
                  <JoinSessionForm onJoinSuccess={handleJoinSuccess} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {createdSession && (
                <div>
                  <h2 className="text-2xl font-bold text-center mb-4">
                    ✅ Session Created Successfully!
                  </h2>
                  <SessionDisplay session={createdSession} />
                </div>
              )}

              {joinedSession && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
                    🎉 Player Joined Successfully!
                  </h2>
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      The player is now part of session:{' '}
                      <strong>{joinedSession.name}</strong>
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-blue-800">
                        In a real app, both the host and player would now see:
                        <br />• Live player list • Team assignments • Game
                        progress • Real-time scoring
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={resetDemo}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  🔄 Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
