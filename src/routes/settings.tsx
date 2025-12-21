import { createFileRoute } from '@tanstack/react-router'
import { NotificationSettings } from '../components/NotificationSettings'

function SettingsPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your preferences and notifications
        </p>
      </div>

      <NotificationSettings />
    </div>
  )
}

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
