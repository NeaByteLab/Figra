import { NotificationService, createNotificationService } from '../../folder5/NotificationService'
import { TaskScheduler, createTaskScheduler } from '../../folder5/TaskScheduler'
import { MetricsCollector, createMetricsCollector } from '../../folder5/MetricsCollector'
import { createUser, updateUser, deleteUser } from '../../UserService'
import { createUser as createReportUser } from '../../ReportService'
import { createUser as createLogUser } from '../../LogService'
import { createUser as createCacheUser } from '../../CacheService'
import { createUser as createFileUser } from '../../FileService'

export interface DeepConsumer5Config {
  name: string
  level: number
  notifications: {
    channels: Array<{ name: string; enabled: boolean; config: Record<string, unknown> }>
  }
  tasks: {
    maxConcurrentTasks: number
    retryFailedTasks: boolean
  }
  metrics: {
    enabled: boolean
    precision: number
  }
}

export class DeepConsumer5 {
  private notificationService: NotificationService
  private taskScheduler: TaskScheduler
  private metricsCollector: MetricsCollector
  private config: DeepConsumer5Config
  private users: any[] = []

  constructor(config: DeepConsumer5Config) {
    this.config = config
    this.notificationService = createNotificationService({
      channels: config.notifications.channels
    })
    this.taskScheduler = createTaskScheduler({
      maxConcurrentTasks: config.tasks.maxConcurrentTasks,
      retryFailedTasks: config.tasks.retryFailedTasks
    })
    this.metricsCollector = createMetricsCollector()
    this.setupMetrics()
  }

  async initializeDeepServices(): Promise<void> {
    console.log('Initializing deep5 services...')
    try {
      const userServiceUser = createUser({ name: 'Deep5 User', email: 'deep5@example.com' })
      const reportUser = createReportUser({ name: 'Deep5 Report User', department: 'Deep Analytics' })
      const logUser = createLogUser({ name: 'Deep5 Log User', logLevel: 'warn' })
      const cacheUser = createCacheUser({ name: 'Deep5 Cache User', cacheKey: 'deep5_001' })
      const fileUser = createFileUser({ name: 'Deep5 File User', storage: 4096 })
      this.users = [userServiceUser, reportUser, logUser, cacheUser, fileUser]
      console.log('Deep5 users created:', this.users.length)
      this.config.notifications.channels.forEach(channel => {
        this.notificationService.addChannel(channel)
      })
      this.users.forEach((user, index) => {
        this.notificationService.send({
          title: 'Deep5 User Created',
          message: `User ${user.name || user.username} has been created`,
          type: 'info',
          recipient: user.id || user.username
        })
      })
      this.taskScheduler.addTask({
        name: 'deep5-user-cleanup',
        execute: () => this.cleanupUsers(),
        schedule: '0 3 * * *'
      })
      this.taskScheduler.addTask({
        name: 'deep5-metrics-collection',
        execute: () => this.collectMetrics(),
        schedule: '*/5 * * * *'
      })
      this.taskScheduler.start()
      this.metricsCollector.increment('deep5.users.created', this.users.length)
      this.metricsCollector.set('deep5.users.total', this.users.length)
      console.log('Deep5 services initialized successfully')
    } catch (error) {
      console.error('Failed to initialize deep5 services:', error)
      throw error
    }
  }

  async processDeepOperations(): Promise<void> {
    console.log('Processing deep5 operations...')
    try {
      if (this.users.length > 0) {
        const updatedUser = updateUser(this.users[0], { email: 'updated_deep5@example.com' })
        console.log('Deep5 user updated:', updatedUser.id)
      }
      deleteUser('deep5_test_user')
      console.log('Deep5 user deletion requested')
      this.notificationService.send({
        title: 'Deep5 Operations Complete',
        message: 'Deep5 operations have been completed successfully',
        type: 'success',
        recipient: 'deep5_system'
      })
      this.metricsCollector.increment('deep5.operations.completed', 1)
      this.metricsCollector.set('deep5.operations.lastRun', Date.now())
      const userMetrics = this.metricsCollector.getMetricSummary('deep5.users.created')
      const operationMetrics = this.metricsCollector.getMetricSummary('deep5.operations.completed')
      console.log('Deep5 metrics:', {
        usersCreated: userMetrics.sum,
        operationsCompleted: operationMetrics.sum,
        averageOperations: operationMetrics.average
      })
      console.log('Deep5 operations completed')
    } catch (error) {
      console.error('Deep5 operations failed:', error)
      this.metricsCollector.increment('deep5.operations.errors', 1)
    }
  }

  private setupMetrics(): void {
    this.metricsCollector.register({
      name: 'deep5.users.created',
      type: 'counter',
      description: 'Total users created in deep5'
    })
    this.metricsCollector.register({
      name: 'deep5.operations.completed',
      type: 'counter',
      description: 'Total operations completed in deep5'
    })
    this.metricsCollector.register({
      name: 'deep5.operations.errors',
      type: 'counter',
      description: 'Total operation errors in deep5'
    })
  }

  private async cleanupUsers(): Promise<void> {
    console.log('Running deep5 user cleanup task...')
    this.metricsCollector.increment('deep5.tasks.cleanup', 1)
  }

  private async collectMetrics(): Promise<void> {
    console.log('Collecting deep5 metrics...')
    this.metricsCollector.increment('deep5.tasks.metrics', 1)
  }

  getDeepStatus(): Record<string, unknown> {
    return {
      config: this.config,
      userCount: this.users.length,
      notifications: this.notificationService.getNotifications('deep5_system').length,
      tasks: this.taskScheduler.getAllTasks().length,
      metrics: this.metricsCollector.export(),
      level: 'deep5',
      services: ['NotificationService', 'TaskScheduler', 'MetricsCollector', 'UserService', 'ReportService', 'LogService', 'CacheService', 'FileService'],
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down DeepConsumer5...')
    this.taskScheduler.stop()
    console.log('DeepConsumer5 shutdown complete')
  }
}

export function createDeepConsumer5(config: DeepConsumer5Config): DeepConsumer5 {
  return new DeepConsumer5(config)
}
