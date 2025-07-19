import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { SessionDisplay } from '../components/SessionDisplay'

export const Route = createFileRoute('/demo')({
  component: DemoPage,
})

function DemoPage() {
  const [session, setSession] = useState<any>(null)

  const createDemoSession = () => {
    // Generate a random 6-digit join code for demo
    const joinCode = Math.floor(100000 + Math.random() * 900000).toString()

    const demoSession = {
      id: crypto.randomUUID(),
      joinCode,
      date: new Date().toISOString(),
      status: 'SCHEDULED',
      name: 'Demo Game Night',
      description: 'A demo session for testing',
    }

    setSession(demoSession)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Session Demo</h1>

          {!session ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">
                Create a Demo Session
              </h2>
              <p className="text-gray-600 mb-6">
                This will create a mock session with a join code that you can
                use to test the join functionality.
              </p>
              <button
                onClick={createDemoSession}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Demo Session
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <SessionDisplay session={session} />

              <div className="text-center">
                <button
                  onClick={() => setSession(null)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create Another Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
