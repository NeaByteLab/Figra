import { DeepService, createDeepService } from '../../../folder1/deep1/DeepService'
import { DeepUtils, createDeepTree, DEEP_CONSTANTS } from '../../../folder1/deep1/DeepUtils'
import { DeepProcessor, createDeepProcessor, DEFAULT_RULES } from '../../../folder1/deep1/DeepProcessor'
import { createUser, updateUser, deleteUser } from '../../../AuthService'
import { createUser as createCacheUser } from '../../../CacheService'
import { createUser as createFileUser } from '../../../FileService'
import { createUser as createLogUser } from '../../../LogService'
import { createUser as createNotificationUser } from '../../../NotificationService'

export interface DeepConsumer8Config {
  name: string
  level: number
  deepProcessing: {
    maxDepth: number
    enabled: boolean
  }
  processing: {
    maxIterations: number
    stopOnError: boolean
  }
}

export class DeepConsumer8 {
  private deepService: DeepService
  private deepUtils: typeof DeepUtils
  private deepProcessor: DeepProcessor
  private config: DeepConsumer8Config
  private users: any[] = []
  private deepTree: any

  constructor(config: DeepConsumer8Config) {
    this.config = config
    this.deepService = createDeepService({
      level: config.deepProcessing.maxDepth,
      name: 'DeepConsumer8',
      enabled: config.deepProcessing.enabled
    })
    this.deepUtils = DeepUtils
    this.deepProcessor = createDeepProcessor({
      rules: [...DEFAULT_RULES],
      maxIterations: config.processing.maxIterations,
      stopOnError: config.processing.stopOnError
    })
    this.setupDeepProcessing()
  }

  async initializeDeepServices(): Promise<void> {
    console.log('Initializing deep8 services...')
    try {
      const authUser = createUser({ username: 'deep8_auth', password: 'deep8_secret' })
      const cacheUser = createCacheUser({ name: 'Deep8 Cache User', cacheKey: 'deep8_001' })
      const fileUser = createFileUser({ name: 'Deep8 File User', storage: 8192 })
      const logUser = createLogUser({ name: 'Deep8 Log User', logLevel: 'trace' })
      const notificationUser = createNotificationUser({ name: 'Deep8 Notification User', preferences: ['webhook', 'sms'] })
      this.users = [authUser, cacheUser, fileUser, logUser, notificationUser]
      console.log('Deep8 users created:', this.users.length)
      this.deepTree = createDeepTree('deep8_root')
      const child1 = DeepUtils.createNode('deep8_child1', this.deepTree)
      const child2 = DeepUtils.createNode('deep8_child2', this.deepTree)
      const grandchild = DeepUtils.createNode('deep8_grandchild', child1)
      DeepUtils.addChild(this.deepTree, child1)
      DeepUtils.addChild(this.deepTree, child2)
      DeepUtils.addChild(child1, grandchild)
      console.log('Deep8 tree created:', {
        depth: DeepUtils.getDepth(this.deepTree),
        nodeCount: DeepUtils.getNodeCount(this.deepTree)
      })
      for (const user of this.users) {
        const result = this.deepProcessor.process(user)
        console.log('Deep8 processing result:', {
          success: result.success,
          iterations: result.iterations,
          appliedRules: result.appliedRules
        })
      }
      const processedUser = this.deepService.process(this.users[0])
      console.log('Deep8 service processed user:', processedUser)
      const analyzedUser = this.deepService.analyze(this.users[1])
      console.log('Deep8 service analyzed user:', analyzedUser)
      console.log('Deep8 services initialized successfully')
    } catch (error) {
      console.error('Failed to initialize deep8 services:', error)
      throw error
    }
  }

  async processDeepOperations(): Promise<void> {
    console.log('Processing deep8 operations...')
    try {
      if (this.users.length > 0) {
        const updatedUser = updateUser(this.users[0], { username: 'updated_deep8_auth' })
        console.log('Deep8 user updated:', updatedUser.id)
      }
      deleteUser('deep8_test_user')
      console.log('Deep8 user deletion requested')
      const updatedData = this.users.map(user => ({ ...user, processed: true }))
      for (const data of updatedData) {
        const result = this.deepProcessor.process(data)
        console.log('Deep8 updated processing result:', {
          success: result.success,
          iterations: result.iterations
        })
      }
      const searchResults = DeepUtils.search(this.deepTree, {
        maxDepth: DEEP_CONSTANTS.MAX_DEPTH,
        filter: (node) => node.value.includes('deep8')
      })
      console.log('Deep8 tree search results:', searchResults.length)
      const transformedUsers = this.users.map(user => 
        this.deepService.transform(user, (input) => ({ ...input, transformed: true }))
      )
      console.log('Deep8 users transformed:', transformedUsers.length)
      const validationResults = this.users.map(user => 
        this.deepService.validate(user, (input) => typeof input === 'object')
      )
      console.log('Deep8 validation results:', validationResults.filter(Boolean).length)
      console.log('Deep8 operations completed')
    } catch (error) {
      console.error('Deep8 operations failed:', error)
    }
  }

  private setupDeepProcessing(): void {
    this.deepService.addOperation('process')
    this.deepService.addOperation('analyze')
    this.deepService.addOperation('transform')
    this.deepService.addOperation('validate')
  }

  getDeepStatus(): Record<string, unknown> {
    return {
      config: this.config,
      userCount: this.users.length,
      treeDepth: this.deepTree ? DeepUtils.getDepth(this.deepTree) : 0,
      treeNodeCount: this.deepTree ? DeepUtils.getNodeCount(this.deepTree) : 0,
      deepServiceConfig: this.deepService.getConfig(),
      processingRules: this.deepProcessor.getRules().length,
      deepConstants: DEEP_CONSTANTS,
      level: 'deep8',
      services: ['DeepService', 'DeepUtils', 'DeepProcessor', 'AuthService', 'CacheService', 'FileService', 'LogService', 'NotificationService'],
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  }

  shutdown(): void {
    console.log('Shutting down DeepConsumer8...')
    this.deepProcessor.clearRules()
    console.log('DeepConsumer8 shutdown complete')
  }
}

export function createDeepConsumer8(config: DeepConsumer8Config): DeepConsumer8 {
  return new DeepConsumer8(config)
}
