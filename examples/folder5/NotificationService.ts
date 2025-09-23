export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  recipient: string
  createdAt: Date
  read: boolean
}

export interface NotificationChannel {
  name: string
  enabled: boolean
  config: Record<string, unknown>
}

export type NotificationOptions = {
  channels: NotificationChannel[]
  retryAttempts: number
  retryDelay: number
}

export class NotificationService {
  private notifications: Notification[] = []
  private channels: Map<string, NotificationChannel> = new Map()
  private options: NotificationOptions

  constructor(options: Partial<NotificationOptions> = {}) {
    this.options = {
      channels: [],
      retryAttempts: 3,
      retryDelay: 1000,
      ...options
    }
    this.options.channels.forEach(channel => {
      this.channels.set(channel.name, channel)
    })
  }

  send(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): string {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36),
      createdAt: new Date(),
      read: false
    }
    this.notifications.push(newNotification)
    this.deliverNotification(newNotification)
    return newNotification.id
  }

  getNotifications(recipient: string): Notification[] {
    return this.notifications
      .filter(n => n.recipient === recipient)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      return true
    }
    return false
  }

  markAllAsRead(recipient: string): number {
    return this.notifications
      .filter(n => n.recipient === recipient && !n.read)
      .map(n => {
        n.read = true
        return n
      }).length
  }

  deleteNotification(notificationId: string): boolean {
    const index = this.notifications.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      this.notifications.splice(index, 1)
      return true
    }
    return false
  }

  addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.name, channel)
  }

  removeChannel(channelName: string): boolean {
    return this.channels.delete(channelName)
  }

  private async deliverNotification(notification: Notification): Promise<void> {
    for (const [name, channel] of this.channels) {
      if (channel.enabled) {
        try {
          await this.sendToChannel(notification, channel)
        } catch (error) {
          console.error(`Failed to send notification via ${name}:`, error)
        }
      }
    }
  }

  private async sendToChannel(notification: Notification, channel: NotificationChannel): Promise<void> {
    console.log(`Sending notification via ${channel.name}:`, notification.title)
  }
}

export function createNotificationService(options?: Partial<NotificationOptions>): NotificationService {
  return new NotificationService(options)
}
