import { showToast } from '../toast'

export enum NotificationType {
  SESSION = 'session',
  GAME = 'game',
  TEAM = 'team',
  CHAT = 'chat',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

interface NotificationConfig {
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  playSound?: boolean
  persist?: boolean
  actionUrl?: string
}

class NotificationService {
  private enabled: boolean = true
  private soundEnabled: boolean = true
  private preferences: Record<NotificationType, boolean> = {
    [NotificationType.SESSION]: true,
    [NotificationType.GAME]: true,
    [NotificationType.TEAM]: true,
    [NotificationType.CHAT]: true,
    [NotificationType.SYSTEM]: true,
  }

  notify(config: NotificationConfig): void {
    // Check if notifications enabled
    if (!this.enabled || !this.preferences[config.type]) {
      return
    }

    // Show toast notification
    const message = `${config.title}: ${config.message}`
    switch (config.priority) {
      case NotificationPriority.CRITICAL:
        showToast.error(message, config.persist ? 10000 : undefined)
        break
      case NotificationPriority.HIGH:
        showToast.warning(message, config.persist ? 8000 : undefined)
        break
      case NotificationPriority.MEDIUM:
        showToast.success(message)
        break
      case NotificationPriority.LOW:
        showToast.info(message)
        break
    }

    // Play sound if enabled
    if (this.soundEnabled && config.playSound) {
      this.playNotificationSound()
    }

    // Browser notification (if permission granted)
    this.showBrowserNotification(config)
  }

  private playNotificationSound(): void {
    try {
      // Simple beep for now (can be enhanced later with audio files)
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.1

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }

  private showBrowserNotification(config: NotificationConfig): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(config.title, {
          body: config.message,
          icon: '/favicon.ico',
          tag: config.type,
        })
      } catch (error) {
        console.error('Failed to show browser notification:', error)
      }
    }
  }

  // Preferences management
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    localStorage.setItem('gn_notifications_enabled', JSON.stringify(enabled))
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled
    localStorage.setItem('gn_notifications_sound', JSON.stringify(enabled))
  }

  setTypeEnabled(type: NotificationType, enabled: boolean): void {
    this.preferences[type] = enabled
    localStorage.setItem(
      'gn_notifications_preferences',
      JSON.stringify(this.preferences),
    )
  }

  getEnabled(): boolean {
    return this.enabled
  }

  getSoundEnabled(): boolean {
    return this.soundEnabled
  }

  getTypeEnabled(type: NotificationType): boolean {
    return this.preferences[type]
  }

  getAllPreferences(): Record<NotificationType, boolean> {
    return { ...this.preferences }
  }

  requestBrowserPermission(): Promise<NotificationPermission> {
    if ('Notification' in window && Notification.permission === 'default') {
      return Notification.requestPermission()
    }
    return Promise.resolve(Notification.permission)
  }

  getBrowserPermission(): NotificationPermission | null {
    if ('Notification' in window) {
      return Notification.permission
    }
    return null
  }

  // Load preferences from localStorage
  loadPreferences(): void {
    try {
      const enabled = localStorage.getItem('gn_notifications_enabled')
      const sound = localStorage.getItem('gn_notifications_sound')
      const prefs = localStorage.getItem('gn_notifications_preferences')

      if (enabled !== null) this.enabled = JSON.parse(enabled)
      if (sound !== null) this.soundEnabled = JSON.parse(sound)
      if (prefs !== null) this.preferences = JSON.parse(prefs)
    } catch (error) {
      console.error('Failed to load notification preferences:', error)
      // Keep defaults if parsing fails
    }
  }
}

export const notificationService = new NotificationService()
notificationService.loadPreferences()
