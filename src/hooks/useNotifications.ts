import { useCallback } from 'react'
import {
  notificationService,
  NotificationType,
  NotificationPriority,
} from '../lib/notifications/notification-service'

export const useNotifications = () => {
  const notifyPlayerJoined = useCallback((playerName: string) => {
    notificationService.notify({
      type: NotificationType.SESSION,
      priority: NotificationPriority.LOW,
      title: 'Player Joined',
      message: `${playerName} joined the session`,
      playSound: false,
    })
  }, [])

  const notifyPlayerLeft = useCallback((playerName: string) => {
    notificationService.notify({
      type: NotificationType.SESSION,
      priority: NotificationPriority.LOW,
      title: 'Player Left',
      message: `${playerName} left the session`,
      playSound: false,
    })
  }, [])

  const notifySessionReady = useCallback(() => {
    notificationService.notify({
      type: NotificationType.SESSION,
      priority: NotificationPriority.HIGH,
      title: 'Session Ready',
      message: 'All players are ready! You can start the session.',
      playSound: true,
      persist: true,
    })
  }, [])

  const notifyGameStarted = useCallback((gameName: string) => {
    notificationService.notify({
      type: NotificationType.GAME,
      priority: NotificationPriority.HIGH,
      title: 'Game Started',
      message: `${gameName} has begun!`,
      playSound: true,
    })
  }, [])

  const notifyRoundStarted = useCallback((roundNumber: number) => {
    notificationService.notify({
      type: NotificationType.GAME,
      priority: NotificationPriority.MEDIUM,
      title: 'New Round',
      message: `Round ${roundNumber} has started`,
      playSound: true,
    })
  }, [])

  const notifyYourTurn = useCallback((teamName: string) => {
    notificationService.notify({
      type: NotificationType.GAME,
      priority: NotificationPriority.HIGH,
      title: "It's Your Turn!",
      message: `${teamName}'s turn to play`,
      playSound: true,
      persist: true,
    })
  }, [])

  const notifyTeamsCreated = useCallback((teamCount: number) => {
    notificationService.notify({
      type: NotificationType.TEAM,
      priority: NotificationPriority.MEDIUM,
      title: 'Teams Created',
      message: `${teamCount} teams have been formed`,
      playSound: false,
    })
  }, [])

  const notifyNewMessage = useCallback(
    (senderName: string, preview: string) => {
      notificationService.notify({
        type: NotificationType.CHAT,
        priority: NotificationPriority.LOW,
        title: `New message from ${senderName}`,
        message: preview.substring(0, 50) + (preview.length > 50 ? '...' : ''),
        playSound: false,
      })
    },
    [],
  )

  const notifyConnectionRestored = useCallback(() => {
    notificationService.notify({
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.MEDIUM,
      title: 'Connection Restored',
      message: 'You are back online',
      playSound: false,
    })
  }, [])

  return {
    notifyPlayerJoined,
    notifyPlayerLeft,
    notifySessionReady,
    notifyGameStarted,
    notifyRoundStarted,
    notifyYourTurn,
    notifyTeamsCreated,
    notifyNewMessage,
    notifyConnectionRestored,
  }
}
