import { useEffect, useState } from 'react'
import {
  NotificationType,
  notificationService,
} from '../lib/notifications/notification-service'

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(notificationService.getEnabled())
  const [soundEnabled, setSoundEnabled] = useState(
    notificationService.getSoundEnabled(),
  )
  const [preferences, setPreferences] = useState(
    notificationService.getAllPreferences(),
  )
  const [browserPermission, setBrowserPermission] = useState(
    notificationService.getBrowserPermission(),
  )

  useEffect(() => {
    // Update browser permission state when it changes
    const checkPermission = () => {
      setBrowserPermission(notificationService.getBrowserPermission())
    }
    checkPermission()
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

  const handleRequestBrowserPermission = async () => {
    const permission = await notificationService.requestBrowserPermission()
    setBrowserPermission(permission)
  }

  const notificationTypeLabels: Record<NotificationType, string> = {
    [NotificationType.SESSION]: 'Session Events',
    [NotificationType.GAME]: 'Game Events',
    [NotificationType.TEAM]: 'Team Events',
    [NotificationType.CHAT]: 'Chat Messages',
    [NotificationType.SYSTEM]: 'System Alerts',
  }

  const notificationTypeDescriptions: Record<NotificationType, string> = {
    [NotificationType.SESSION]:
      'Player joins/leaves, readiness changes, session ready',
    [NotificationType.GAME]: 'Game started, rounds, turns, game completed',
    [NotificationType.TEAM]: 'Team creation, player assignments',
    [NotificationType.CHAT]: 'New chat messages when not viewing chat',
    [NotificationType.SYSTEM]: 'Connection status, errors, warnings',
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>

      {/* Master Toggle */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-semibold text-gray-900">
              Enable Notifications
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Turn all notifications on or off
            </p>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggleEnabled}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>

      {/* Sound Toggle */}
      <div className="mb-6 p-4 border rounded-lg">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-semibold text-gray-900">Play Sounds</span>
            <p className="text-sm text-gray-600 mt-1">
              Play audio alerts for important notifications
            </p>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={handleToggleSound}
            disabled={!enabled}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
      </div>

      {/* Notification Types */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Notification Types</h3>
        <div className="space-y-3">
          {Object.values(NotificationType).map((type) => (
            <div key={type} className="p-4 border rounded-lg">
              <label className="flex items-start justify-between cursor-pointer">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">
                    {notificationTypeLabels[type]}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {notificationTypeDescriptions[type]}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences[type]}
                  onChange={() => handleToggleType(type)}
                  disabled={!enabled}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ml-4 flex-shrink-0"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Browser Notifications */}
      <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          Browser Notifications
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Get notifications even when the tab is not active (requires browser
          permission)
        </p>

        {browserPermission === 'granted' && (
          <div className="flex items-center text-green-700">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Permission granted</span>
          </div>
        )}

        {browserPermission === 'denied' && (
          <div className="text-red-700">
            <p className="text-sm font-medium">Permission denied</p>
            <p className="text-xs mt-1">
              Please enable notifications in your browser settings
            </p>
          </div>
        )}

        {browserPermission === 'default' && (
          <button
            onClick={handleRequestBrowserPermission}
            disabled={!enabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enable Browser Notifications
          </button>
        )}

        {!browserPermission && (
          <p className="text-sm text-gray-600">
            Browser notifications are not supported in this browser
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">About Notifications</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Toast notifications appear in the corner of your screen</li>
          <li>
            • Important events (session ready, your turn) play sounds if enabled
          </li>
          <li>
            • Browser notifications work even when the tab is in the background
          </li>
          <li>• Your preferences are saved automatically</li>
        </ul>
      </div>
    </div>
  )
}
