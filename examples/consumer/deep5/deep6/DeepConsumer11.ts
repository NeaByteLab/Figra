import { HttpClient, createHttpClient } from '../../../folder3/HttpClient'
import { ConfigManager, createConfigManager, CONFIG_TYPES } from '../../../folder3/ConfigManager'
import { QueueManager, createQueueManager } from '../../../folder3/QueueManager'
import { createUser, updateUser, deleteUser } from '../../../AuthService'
import { createUser as createOrderUser } from '../../../OrderService'
import { createUser as createPaymentUser } from '../../../PaymentService'
import { createUser as createProductUser } from '../../../ProductService'
import { createUser as createReportUser } from '../../../ReportService'

export interface DeepConsumer11Config {
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

export class DeepConsumer11 {
  private httpClient: HttpClient
  private configManager: ConfigManager
  private queueManager: QueueManager
  private config: DeepConsumer11Config
  private users: any[] = []

  constructor(config: DeepConsumer11Config) {
    this.config = config
    this.httpClient = createHttpClient(config.http.baseUrl, {
      'Content-Type': 'application/json',
      'X-Deep-Level': 'deep6'
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
    console.log('Initializing deep11 services...')
    try {
      const authUser = createUser({ username: 'deep11_auth', password: 'deep11_secret' })
      const orderUser = createOrderUser({ name: 'Deep11 Order User', address: '111 Deep11 St' })
      const paymentUser = createPaymentUser({ name: 'Deep11 Payment User', paymentMethod: 'venmo' })
      const productUser = createProductUser({ name: 'Deep11 Product User', role: 'founder' })
      const reportUser = createReportUser({ name: 'Deep11 Report User', department: 'Deep11 Analytics' })
      this.users = [authUser, orderUser, paymentUser, productUser, reportUser]
      console.log('Deep11 users created:', this.users.length)
      this.configManager.set('deep.level', 6)
      this.configManager.set('deep.name', 'DeepConsumer11')
      this.configManager.set('deep.enabled', true)
      this.configManager.set('deep.services', ['HttpClient', 'ConfigManager', 'QueueManager'])
      this.configManager.set('deep.users.count', this.users.length)
      this.queueManager.enqueue({ type: 'user_processing', data: this.users, level: 'deep6' })
      this.queueManager.enqueue({ type: 'config_setup', data: this.configManager.getAll() })
      this.queueManager.enqueue({ type: 'http_requests', data: { baseUrl: this.config.http.baseUrl } })
      console.log('Deep11 services initialized successfully')
    } catch (error) {
      console.error('Failed to initialize deep11 services:', error)
      throw error
    }
  }

  async processDeepOperations(): Promise<void> {
    console.log('Processing deep11 operations...')
    try {
      const response = await this.httpClient.get('/deep11/users')
      console.log('Deep11 HTTP request successful:', response.status)
      if (this.users.length > 0) {
        const updatedUser = updateUser(this.users[0], { username: 'updated_deep11_auth' })
        console.log('Deep11 user updated:', updatedUser.id)
      }
      deleteUser('deep11_test_user')
      console.log('Deep11 user deletion requested')
      const queueSize = this.queueManager.size()
      console.log('Deep11 queue size:', queueSize)
      this.configManager.set('deep.lastProcessed', new Date().toISOString())
      this.configManager.set('deep.queueSize', queueSize)
      this.configManager.set('deep.httpRequests', 1)
      const postResponse = await this.httpClient.post('/deep11/process', {
        users: this.users.length,
        level: 'deep6'
      })
      console.log('Deep11 POST request successful:', postResponse.status)
      console.log('Deep11 operations completed')
    } catch (error) {
      console.error('Deep11 operations failed:', error)
    }
  }

  getDeepStatus(): Record<string, unknown> {
    return {
      config: this.config,
      userCount: this.users.length,
      queueSize: this.queueManager.size(),
      configData: this.configManager.getAll(),
      configTypes: CONFIG_TYPES,
      level: 'deep6',
      services: ['HttpClient', 'ConfigManager', 'QueueManager', 'AuthService', 'OrderService', 'PaymentService', 'ProductService', 'ReportService'],
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  }

  shutdown(): void {
    console.log('Shutting down DeepConsumer11...')
    this.queueManager.clear()
    console.log('DeepConsumer11 shutdown complete')
  }
}

export function createDeepConsumer11(config: DeepConsumer11Config): DeepConsumer11 {
  return new DeepConsumer11(config)
}
