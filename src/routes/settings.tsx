import { createFileRoute, Link } from '@tanstack/react-router'
import { NotificationSettings } from '../components/NotificationSettings'

function SettingsPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link
          to="/sessions"
          className="text-blue-500 hover:text-blue-600 no-underline inline-flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Sessions
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="max-w-3xl">
        <NotificationSettings />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
