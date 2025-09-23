import { HttpClient, createHttpClient } from '../../../folder3/HttpClient'
import { ConfigManager, createConfigManager, CONFIG_TYPES } from '../../../folder3/ConfigManager'
import { QueueManager, createQueueManager } from '../../../folder3/QueueManager'
import { createUser, updateUser, deleteUser } from '../../../ReportService'
import { createUser as createNotificationUser } from '../../../NotificationService'
import { createUser as createLogUser } from '../../../LogService'
import { createUser as createCacheUser } from '../../../CacheService'

export interface DeepConsumer3Config {
  name: string
  level: number
  http: {
    baseUrl: string
    timeout: number
  }
  config: {
    strict: boolean
    validate: boolean
  }
  queue: {
    maxRetries: number
    retryDelay: number
  }
}

export class DeepConsumer3 {
  private httpClient: HttpClient
  private configManager: ConfigManager
  private queueManager: QueueManager
  private config: DeepConsumer3Config
  private users: any[] = []

  constructor(config: DeepConsumer3Config) {
    this.config = config
    this.httpClient = createHttpClient(config.http.baseUrl, {
      'Content-Type': 'application/json',
      'X-Deep-Level': 'deep3'
    })
    this.configManager = createConfigManager({
      strict: config.config.strict,
      validate: config.config.validate
    })
    this.queueManager = createQueueManager({
      maxRetries: config.queue.maxRetries,
      retryDelay: config.queue.retryDelay
    })
  }

  async initializeDeepServices(): Promise<void> {
    console.log('Initializing deep3 services...')
    try {
      const reportUser = createUser({ name: 'Deep Report User', department: 'Analytics' })
      const notificationUser = createNotificationUser({ name: 'Deep Notification User', preferences: ['email', 'sms'] })
      const logUser = createLogUser({ name: 'Deep Log User', logLevel: 'info' })
      const cacheUser = createCacheUser({ name: 'Deep Cache User', cacheKey: 'deep3_001' })
      this.users = [reportUser, notificationUser, logUser, cacheUser]
      console.log('Deep3 users created:', this.users.length)
      this.configManager.set('deep.level', 3)
      this.configManager.set('deep.name', 'DeepConsumer3')
      this.configManager.set('deep.enabled', true)
      this.configManager.set('deep.services', ['HttpClient', 'ConfigManager', 'QueueManager'])
      this.queueManager.enqueue({ type: 'user_processing', data: this.users })
      this.queueManager.enqueue({ type: 'config_setup', data: this.configManager.getAll() })
      console.log('Deep3 services initialized successfully')
    } catch (error) {
      console.error('Failed to initialize deep3 services:', error)
      throw error
    }
  }

  async processDeepOperations(): Promise<void> {
    console.log('Processing deep3 operations...')
    try {
      const response = await this.httpClient.get('/deep3/users')
      console.log('Deep3 HTTP request successful:', response.status)
      if (this.users.length > 0) {
        const updatedUser = updateUser(this.users[0], { department: 'Updated Analytics' })
        console.log('Deep3 user updated:', updatedUser.id)
      }
      deleteUser('deep3_test_user')
      console.log('Deep3 user deletion requested')
      const queueSize = this.queueManager.size()
      console.log('Deep3 queue size:', queueSize)
      this.configManager.set('deep.lastProcessed', new Date().toISOString())
      this.configManager.set('deep.queueSize', queueSize)
      console.log('Deep3 operations completed')
    } catch (error) {
      console.error('Deep3 operations failed:', error)
    }
  }

  getDeepStatus(): Record<string, unknown> {
    return {
      config: this.config,
      userCount: this.users.length,
      queueSize: this.queueManager.size(),
      configData: this.configManager.getAll(),
      configTypes: CONFIG_TYPES,
      level: 'deep3',
      services: ['HttpClient', 'ConfigManager', 'QueueManager', 'ReportService', 'NotificationService', 'LogService', 'CacheService'],
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  }

  shutdown(): void {
    console.log('Shutting down DeepConsumer3...')
    this.queueManager.clear()
    console.log('DeepConsumer3 shutdown complete')
  }
}

export function createDeepConsumer3(config: DeepConsumer3Config): DeepConsumer3 {
  return new DeepConsumer3(config)
}
