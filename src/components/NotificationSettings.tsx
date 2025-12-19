import { useState, useEffect } from 'react'
import {
  notificationService,
  NotificationType,
} from '../lib/notifications/notification-service'

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [preferences, setPreferences] = useState({
    [NotificationType.SESSION]: true,
    [NotificationType.GAME]: true,
    [NotificationType.TEAM]: true,
    [NotificationType.CHAT]: true,
    [NotificationType.SYSTEM]: true,
  })

  useEffect(() => {
    // Load current preferences from service
    setEnabled(notificationService.getEnabled())
    setSoundEnabled(notificationService.getSoundEnabled())
    setPreferences(notificationService.getPreferences())
  }, [])

  const handleToggleEnabled = () => {
    const newValue = !enabled
    setEnabled(newValue)
    notificationService.setEnabled(newValue)
  }

  const handleToggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    notificationService.setSoundEnabled(newValue)
  }

  const handleToggleType = (type: NotificationType) => {
    const newPreferences = {
      ...preferences,
      [type]: !preferences[type],
    }
    setPreferences(newPreferences)
    notificationService.setTypeEnabled(type, newPreferences[type])
  }

  const notificationLabels: Record<NotificationType, string> = {
    [NotificationType.SESSION]:
      'Session Events (player joined/left, session ready)',
    [NotificationType.GAME]: 'Game Events (game started, rounds, turns)',
    [NotificationType.TEAM]: 'Team Events (teams created, assignments)',
    [NotificationType.CHAT]: 'Chat Messages (new messages from other players)',
    [NotificationType.SYSTEM]: 'System Events (connection status)',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>

      {/* Master toggle */}
      <div className="mb-6 pb-6 border-b">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-lg font-medium">Enable notifications</span>
            <p className="text-sm text-gray-600 mt-1">
              Receive real-time updates about game events
            </p>
          </div>
          <div className="relative inline-block w-12 h-6 transition duration-200 ease-linear rounded-full">
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleToggleEnabled}
              className="sr-only peer"
            />
            <div
              className={`block w-12 h-6 rounded-full transition ${
                enabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                enabled ? 'transform translate-x-6' : ''
              }`}
            ></div>
          </div>
        </label>
      </div>

      {/* Sound toggle */}
      <div className="mb-6 pb-6 border-b">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-lg font-medium">Play sounds</span>
            <p className="text-sm text-gray-600 mt-1">
              Play audio alerts for important notifications
            </p>
          </div>
          <div className="relative inline-block w-12 h-6 transition duration-200 ease-linear rounded-full">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={handleToggleSound}
              disabled={!enabled}
              className="sr-only peer"
            />
            <div
              className={`block w-12 h-6 rounded-full transition ${
                soundEnabled && enabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                soundEnabled && enabled ? 'transform translate-x-6' : ''
              }`}
            ></div>
          </div>
        </label>
      </div>

      {/* Type-specific toggles */}
      <div>
        <h3 className="text-lg font-medium mb-4">Notification Types</h3>
        <div className="space-y-4">
          {Object.values(NotificationType).map((type) => (
            <label
              key={type}
              className="flex items-start justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex-1 mr-4">
                <span className="font-medium capitalize">{type}</span>
                <p className="text-sm text-gray-600 mt-1">
                  {notificationLabels[type]}
                </p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-linear rounded-full flex-shrink-0">
                <input
                  type="checkbox"
                  checked={preferences[type]}
                  onChange={() => handleToggleType(type)}
                  disabled={!enabled}
                  className="sr-only peer"
                />
                <div
                  className={`block w-12 h-6 rounded-full transition ${
                    preferences[type] && enabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    preferences[type] && enabled
                      ? 'transform translate-x-6'
                      : ''
                  }`}
                ></div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Browser notification permission */}
      {'Notification' in window && Notification.permission === 'default' && (
        <div className="mt-8 pt-6 border-t">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Enable Browser Notifications
            </h4>
            <p className="text-sm text-blue-800 mb-4">
              Get notifications even when the tab is not active. Click the
              button below to allow browser notifications.
            </p>
            <button
              onClick={() => notificationService.requestBrowserPermission()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Allow Browser Notifications
            </button>
          </div>
        </div>
      )}

      {/* Permission granted message */}
      {'Notification' in window && Notification.permission === 'granted' && (
        <div className="mt-8 pt-6 border-t">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-900 font-medium">
                Browser notifications are enabled
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
