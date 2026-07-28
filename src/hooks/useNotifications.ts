import { useCallback } from 'react'
import {
  NotificationPriority,
  NotificationType,
  notificationService,
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

  const notifyPlayerReady = useCallback((playerName: string) => {
    notificationService.notify({
      type: NotificationType.SESSION,
      priority: NotificationPriority.LOW,
      title: 'Player Ready',
      message: `${playerName} is ready`,
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
      title: "🎯 It's your turn!",
      message: `Your team (${teamName}) is up — go!`,
      playSound: true,
      persist: true,
    })
  }, [])

  // Fired for everyone NOT on the active team, so the room knows who's up.
  const notifyTeamTurn = useCallback((teamName: string) => {
    notificationService.notify({
      type: NotificationType.GAME,
      priority: NotificationPriority.LOW,
      title: 'Now playing',
      message: `${teamName}'s turn`,
      playSound: false,
    })
  }, [])

  const notifyGameCompleted = useCallback(
    (gameName: string, winner?: string) => {
      notificationService.notify({
        type: NotificationType.GAME,
        priority: NotificationPriority.MEDIUM,
        title: 'Game Completed',
        message: winner
          ? `${gameName} won by ${winner}!`
          : `${gameName} has ended`,
        playSound: true,
      })
    },
    [],
  )

  const notifyTeamsCreated = useCallback((teamCount: number) => {
    notificationService.notify({
      type: NotificationType.TEAM,
      priority: NotificationPriority.MEDIUM,
      title: 'Teams Created',
      message: `${teamCount} ${teamCount === 1 ? 'team has' : 'teams have'} been formed`,
      playSound: false,
    })
  }, [])

  const notifyTeamAssignment = useCallback(
    (playerName: string, teamName: string) => {
      notificationService.notify({
        type: NotificationType.TEAM,
        priority: NotificationPriority.LOW,
        title: 'Team Assignment',
        message: `${playerName} joined ${teamName}`,
        playSound: false,
      })
    },
    [],
  )

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

  const notifyConnectionLost = useCallback(() => {
    notificationService.notify({
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.HIGH,
      title: 'Connection Lost',
      message: 'Attempting to reconnect...',
      playSound: false,
    })
  }, [])

  return {
    notifyPlayerJoined,
    notifyPlayerLeft,
    notifyPlayerReady,
    notifySessionReady,
    notifyGameStarted,
    notifyRoundStarted,
    notifyYourTurn,
    notifyTeamTurn,
    notifyGameCompleted,
    notifyTeamsCreated,
    notifyTeamAssignment,
    notifyNewMessage,
    notifyConnectionRestored,
    notifyConnectionLost,
  }
}
