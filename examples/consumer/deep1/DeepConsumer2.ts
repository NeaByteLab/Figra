import { DataProcessor, createDataProcessor, PROCESSING_CONSTANTS } from '../../folder2/DataProcessor'
import { CacheManager, createCacheManager } from '../../folder2/CacheManager'
import { EventEmitter, createEventEmitter } from '../../folder2/EventEmitter'
import { createUser, updateUser, deleteUser } from '../../UserService'
import { createUser as createOrderUser } from '../../OrderService'
import { createUser as createPaymentUser } from '../../PaymentService'
import { createUser as createProductUser } from '../../ProductService'

export interface DeepConsumer2Config {
  name: string
  level: number
  processing: {
    batchSize: number
    timeout: number
  }
  cache: {
    ttl: number
    maxSize: number
  }
}

export class DeepConsumer2 {
  private dataProcessor: DataProcessor
  private cacheManager: CacheManager<string>
  private eventEmitter: EventEmitter
  private config: DeepConsumer2Config
  private users: any[] = []

  constructor(config: DeepConsumer2Config) {
    this.config = config
    this.dataProcessor = createDataProcessor({
      batchSize: config.processing.batchSize,
      timeout: config.processing.timeout
    })
    this.cacheManager = createCacheManager<string>({
      ttl: config.cache.ttl,
      maxSize: config.cache.maxSize
    })
    this.eventEmitter = createEventEmitter()
    this.setupEventHandlers()
  }

  async initializeDeepProcessing(): Promise<void> {
    console.log('Initializing deep processing...')
    try {
      const userServiceUser = createUser({ name: 'Deep User', email: 'deep@example.com' })
      const orderUser = createOrderUser({ name: 'Deep Order User', address: '456 Deep St' })
      const paymentUser = createPaymentUser({ name: 'Deep Payment User', paymentMethod: 'card' })
      const productUser = createProductUser({ name: 'Deep Product User', role: 'admin' })
      this.users = [userServiceUser, orderUser, paymentUser, productUser]
      console.log('Deep users created:', this.users.length)
      const userData = this.users.map(user => ({ value: user, metadata: { service: 'deep' } }))
      userData.forEach(data => this.dataProcessor.addData(data))
      const cacheKey = `deep_users_${Date.now()}`
      this.cacheManager.set(cacheKey, JSON.stringify(this.users))
      console.log('Deep users cached with key:', cacheKey)
      this.eventEmitter.emit('deepUsersCreated', {
        count: this.users.length,
        cacheKey,
        timestamp: new Date()
      })
      console.log('Deep processing initialized successfully')
    } catch (error) {
      console.error('Failed to initialize deep processing:', error)
      throw error
    }
  }

  async processDeepData(): Promise<void> {
    console.log('Processing deep data...')
    try {
      const processedData = await this.dataProcessor.processData()
      console.log(`Processed ${processedData.length} deep items`)
      if (this.users.length > 0) {
        const updatedUser = updateUser(this.users[0], { email: 'updated_deep@example.com' })
        console.log('Deep user updated:', updatedUser.id)
      }
      deleteUser('deep_test_user')
      console.log('Deep user deletion requested')
      this.eventEmitter.emit('deepProcessingComplete', {
        processedCount: processedData.length,
        userCount: this.users.length,
        timestamp: new Date()
      })
      console.log('Deep data processing completed')
    } catch (error) {
      console.error('Deep data processing failed:', error)
    }
  }

  private setupEventHandlers(): void {
    this.eventEmitter.on('deepUsersCreated', (data) => {
      console.log('Deep users created event:', data)
    })
    this.eventEmitter.on('deepProcessingComplete', (data) => {
      console.log('Deep processing complete event:', data)
    })
  }

  getDeepStatus(): Record<string, unknown> {
    return {
      config: this.config,
      userCount: this.users.length,
      cacheSize: this.cacheManager.size(),
      processingConstants: PROCESSING_CONSTANTS,
      level: 'deep1',
      services: ['DataProcessor', 'CacheManager', 'EventEmitter', 'UserService', 'OrderService', 'PaymentService', 'ProductService'],
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  }

  shutdown(): void {
    console.log('Shutting down DeepConsumer2...')
    this.cacheManager.clear()
    console.log('DeepConsumer2 shutdown complete')
  }
}

export function createDeepConsumer2(config: DeepConsumer2Config): DeepConsumer2 {
  return new DeepConsumer2(config)
}
