import { DataProcessor, createDataProcessor, PROCESSING_CONSTANTS } from '../folder2/DataProcessor'
import { CacheManager, createCacheManager } from '../folder2/CacheManager'
import { EventEmitter, createEventEmitter } from '../folder2/EventEmitter'
import { HttpClient, createHttpClient } from '../folder3/HttpClient'
import { ConfigManager, createConfigManager, CONFIG_TYPES } from '../folder3/ConfigManager'
import { QueueManager, createQueueManager } from '../folder3/QueueManager'
import { DatabaseConnection, createDatabaseConnection } from '../folder4/DatabaseConnection'
import { SecurityManager, createSecurityManager } from '../folder4/SecurityManager'
import { FileSystemManager, createFileSystemManager } from '../folder4/FileSystemManager'
import { NotificationService, createNotificationService } from '../folder5/NotificationService'
import { TaskScheduler, createTaskScheduler } from '../folder5/TaskScheduler'
import { MetricsCollector, createMetricsCollector } from '../folder5/MetricsCollector'

export interface ServiceConfig {
  database: {
    host: string
    port: number
    database: string
    username: string
    password: string
  }
  cache: {
    ttl: number
    maxSize: number
  }
  security: {
    secretKey: string
    algorithm: string
    expiresIn: string
  }
}

export class ServiceConsumer {
  private dataProcessor: DataProcessor
  private cacheManager: CacheManager<string>
  private eventEmitter: EventEmitter
  private httpClient: HttpClient
  private configManager: ConfigManager
  private queueManager: QueueManager
  private database: DatabaseConnection
  private securityManager: SecurityManager
  private fileSystem: FileSystemManager
  private notificationService: NotificationService
  private taskScheduler: TaskScheduler
  private metricsCollector: MetricsCollector

  constructor(config: ServiceConfig) {
    this.dataProcessor = createDataProcessor({
      batchSize: PROCESSING_CONSTANTS.DEFAULT_BATCH_SIZE,
      timeout: PROCESSING_CONSTANTS.DEFAULT_TIMEOUT
    })
    this.cacheManager = createCacheManager<string>({
      ttl: config.cache.ttl,
      maxSize: config.cache.maxSize
    })
    this.eventEmitter = createEventEmitter()
    this.httpClient = createHttpClient('https://api.example.com')
    this.configManager = createConfigManager()
    this.queueManager = createQueueManager()
    this.database = createDatabaseConnection(config.database)
    this.securityManager = createSecurityManager(config.security)
    this.fileSystem = createFileSystemManager('/tmp', ['read', 'write'])
    this.notificationService = createNotificationService()
    this.taskScheduler = createTaskScheduler()
    this.metricsCollector = createMetricsCollector()
    this.setupEventHandlers()
    this.setupMetrics()
  }

  async initializeServices(): Promise<void> {
    try {
      await this.database.connect()
      console.log('Database connected')
      this.configManager.set('app.name', 'ServiceConsumer')
      this.configManager.set('app.version', '1.0.0')
      this.configManager.set('features.cache', true)
      this.configManager.set('features.notifications', true)
      this.notificationService.addChannel({
        name: 'email',
        enabled: true,
        config: { smtp: 'smtp.example.com' }
      })
      this.taskScheduler.addTask({
        name: 'cleanup-cache',
        execute: () => this.cleanupCache(),
        schedule: '0 2 * * *'
      })
      this.taskScheduler.start()
      console.log('All services initialized successfully')
    } catch (error) {
      console.error('Failed to initialize services:', error)
      throw error
    }
  }

  async processData(data: unknown[]): Promise<void> {
    data.forEach(item => this.dataProcessor.addData({ value: item, metadata: {} }))
    const processedData = await this.dataProcessor.processData()
    console.log(`Processed ${processedData.length} items`)
    const cacheKey = `processed_${Date.now()}`
    this.cacheManager.set(cacheKey, JSON.stringify(processedData))
    console.log('Data cached with key:', cacheKey)
    this.eventEmitter.emit('dataProcessed', {
      count: processedData.length,
      cacheKey,
      timestamp: new Date()
    })
  }

  async handleUserRequest(userId: string, action: string): Promise<void> {
    try {
      const token = this.securityManager.generateToken({
        userId,
        email: 'user@example.com',
        role: 'user'
      })
      this.cacheManager.set(`session_${userId}`, token)
      this.notificationService.send({
        title: 'Action Completed',
        message: `User ${userId} performed ${action}`,
        type: 'info',
        recipient: userId
      })
      this.metricsCollector.increment('user.actions', 1, { action, userId })
      this.metricsCollector.set('user.lastActivity', Date.now(), { userId })
      console.log(`User ${userId} action ${action} completed`)
    } catch (error) {
      console.error('User request failed:', error)
      this.metricsCollector.increment('user.errors', 1, { action, userId })
    }
  }

  async performHttpRequest(): Promise<void> {
    try {
      const response = await this.httpClient.get('/users')
      console.log('HTTP request successful:', response.status)
      this.cacheManager.set('users_data', JSON.stringify(response.data))
    } catch (error) {
      console.error('HTTP request failed:', error)
    }
  }

  private setupEventHandlers(): void {
    this.eventEmitter.on('dataProcessed', (data) => {
      console.log('Data processing event:', data)
    })
    this.eventEmitter.on('userAction', (data) => {
      this.metricsCollector.increment('events.userAction', 1)
    })
  }

  private setupMetrics(): void {
    this.metricsCollector.register({
      name: 'user.actions',
      type: 'counter',
      description: 'Total user actions'
    })
    this.metricsCollector.register({
      name: 'user.errors',
      type: 'counter',
      description: 'Total user errors'
    })
    this.metricsCollector.register({
      name: 'cache.hits',
      type: 'gauge',
      description: 'Cache hit rate'
    })
  }

  private async cleanupCache(): Promise<void> {
    console.log('Running cache cleanup task...')
    this.cacheManager.clear()
    this.metricsCollector.increment('tasks.cacheCleanup', 1)
  }

  getServiceStatus(): Record<string, unknown> {
    return {
      database: this.database.isConnected(),
      cache: this.cacheManager.size(),
      config: this.configManager.getAll(),
      queue: this.queueManager.size(),
      metrics: this.metricsCollector.export(),
      tasks: this.taskScheduler.getAllTasks().length
    }
  }

  async shutdown(): Promise<void> {
    this.taskScheduler.stop()
    await this.database.disconnect()
    this.cacheManager.clear()
    console.log('All services shut down')
  }
}

export function createServiceConsumer(config: ServiceConfig): ServiceConsumer {
  return new ServiceConsumer(config)
}
