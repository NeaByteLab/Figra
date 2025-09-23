import { NotificationService, createNotificationService } from '../../../../folder5/NotificationService'
import { TaskScheduler, createTaskScheduler } from '../../../../folder5/TaskScheduler'
import { MetricsCollector, createMetricsCollector } from '../../../../folder5/MetricsCollector'
import { createUser, updateUser, deleteUser } from '../../../../UserService'
import { createUser as createOrderUser } from '../../../../OrderService'
import { createUser as createPaymentUser } from '../../../../PaymentService'
import { createUser as createProductUser } from '../../../../ProductService'
import { createUser as createReportUser } from '../../../../ReportService'

export interface DeepConsumer13Config {
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

export class DeepConsumer13 {
  private notificationService: NotificationService
  private taskScheduler: TaskScheduler
  private metricsCollector: MetricsCollector
  private config: DeepConsumer13Config
  private users: any[] = []

  constructor(config: DeepConsumer13Config) {
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
    console.log('Initializing deep13 services...')
    try {
      const userServiceUser = createUser({ name: 'Deep13 User', email: 'deep13@example.com' })
      const orderUser = createOrderUser({ name: 'Deep13 Order User', address: '222 Deep13 St' })
      const paymentUser = createPaymentUser({ name: 'Deep13 Payment User', paymentMethod: 'crypto' })
      const productUser = createProductUser({ name: 'Deep13 Product User', role: 'cto' })
      const reportUser = createReportUser({ name: 'Deep13 Report User', department: 'Deep13 Analytics' })
      this.users = [userServiceUser, orderUser, paymentUser, productUser, reportUser]
      console.log('Deep13 users created:', this.users.length)
      this.config.notifications.channels.forEach(channel => {
        this.notificationService.addChannel(channel)
      })
      this.users.forEach((user, index) => {
        this.notificationService.send({
          title: 'Deep13 User Created',
          message: `User ${user.name || user.username} has been created at level deep7`,
          type: 'info',
          recipient: user.id || user.username
        })
      })
      this.taskScheduler.addTask({
        name: 'deep13-user-cleanup',
        execute: () => this.cleanupUsers(),
        schedule: '0 4 * * *'
      })
      this.taskScheduler.addTask({
        name: 'deep13-metrics-collection',
        execute: () => this.collectMetrics(),
        schedule: '*/10 * * * *'
      })
      this.taskScheduler.addTask({
        name: 'deep13-notification-cleanup',
        execute: () => this.cleanupNotifications(),
        schedule: '0 1 * * *'
      })
      this.taskScheduler.start()
      this.metricsCollector.increment('deep13.users.created', this.users.length)
      this.metricsCollector.set('deep13.users.total', this.users.length)
      this.metricsCollector.set('deep13.level', 7)
      console.log('Deep13 services initialized successfully')
    } catch (error) {
      console.error('Failed to initialize deep13 services:', error)
      throw error
    }
  }

  async processDeepOperations(): Promise<void> {
    console.log('Processing deep13 operations...')
    try {
      if (this.users.length > 0) {
        const updatedUser = updateUser(this.users[0], { email: 'updated_deep13@example.com' })
        console.log('Deep13 user updated:', updatedUser.id)
      }
      deleteUser('deep13_test_user')
      console.log('Deep13 user deletion requested')
      this.notificationService.send({
        title: 'Deep13 Operations Complete',
        message: 'Deep13 operations have been completed successfully at level deep7',
        type: 'success',
        recipient: 'deep13_system'
      })
      this.metricsCollector.increment('deep13.operations.completed', 1)
      this.metricsCollector.set('deep13.operations.lastRun', Date.now())
      this.metricsCollector.increment('deep13.notifications.sent', 1)
      const userMetrics = this.metricsCollector.getMetricSummary('deep13.users.created')
      const operationMetrics = this.metricsCollector.getMetricSummary('deep13.operations.completed')
      const notificationMetrics = this.metricsCollector.getMetricSummary('deep13.notifications.sent')
      console.log('Deep13 metrics:', {
        usersCreated: userMetrics.sum,
        operationsCompleted: operationMetrics.sum,
        notificationsSent: notificationMetrics.sum,
        averageOperations: operationMetrics.average,
        level: 7
      })
      console.log('Deep13 operations completed')
    } catch (error) {
      console.error('Deep13 operations failed:', error)
      this.metricsCollector.increment('deep13.operations.errors', 1)
    }
  }

  private setupMetrics(): void {
    this.metricsCollector.register({
      name: 'deep13.users.created',
      type: 'counter',
      description: 'Total users created in deep13'
    })
    this.metricsCollector.register({
      name: 'deep13.operations.completed',
      type: 'counter',
      description: 'Total operations completed in deep13'
    })
    this.metricsCollector.register({
      name: 'deep13.operations.errors',
      type: 'counter',
      description: 'Total operation errors in deep13'
    })
    this.metricsCollector.register({
      name: 'deep13.notifications.sent',
      type: 'counter',
      description: 'Total notifications sent in deep13'
    })
  }

  private async cleanupUsers(): Promise<void> {
    console.log('Running deep13 user cleanup task...')
    this.metricsCollector.increment('deep13.tasks.cleanup', 1)
  }

  private async collectMetrics(): Promise<void> {
    console.log('Collecting deep13 metrics...')
    this.metricsCollector.increment('deep13.tasks.metrics', 1)
  }

  private async cleanupNotifications(): Promise<void> {
    console.log('Running deep13 notification cleanup task...')
    this.metricsCollector.increment('deep13.tasks.notificationCleanup', 1)
  }

  getDeepStatus(): Record<string, unknown> {
    return {
      config: this.config,
      userCount: this.users.length,
      notifications: this.notificationService.getNotifications('deep13_system').length,
      tasks: this.taskScheduler.getAllTasks().length,
      metrics: this.metricsCollector.export(),
      level: 'deep7',
      services: ['NotificationService', 'TaskScheduler', 'MetricsCollector', 'UserService', 'OrderService', 'PaymentService', 'ProductService', 'ReportService'],
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down DeepConsumer13...')
    this.taskScheduler.stop()
    console.log('DeepConsumer13 shutdown complete')
  }
}

export function createDeepConsumer13(config: DeepConsumer13Config): DeepConsumer13 {
  return new DeepConsumer13(config)
}
