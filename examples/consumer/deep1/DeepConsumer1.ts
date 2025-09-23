import { UserManager, createUserManager } from '../../folder1/UserManager'
import { Logger, LogLevel, defaultLogger } from '../../folder1/Logger'
import { validateEmail, validateName, VALIDATION_RULES } from '../../folder1/ValidationUtils'
import { createUser, updateUser, deleteUser } from '../../AuthService'
import { createUser as createCacheUser } from '../../CacheService'
import { createUser as createFileUser } from '../../FileService'
import { createUser as createLogUser } from '../../LogService'

export interface DeepConsumer1Config {
  name: string
  level: number
  enabled: boolean
  maxUsers: number
  logLevel: LogLevel
}

export class DeepConsumer1 {
  private userManager: UserManager
  private logger: Logger
  private config: DeepConsumer1Config
  private users: any[] = []

  constructor(config: DeepConsumer1Config) {
    this.config = config
    this.userManager = createUserManager()
    this.logger = defaultLogger
    this.logger.setMinLevel(config.logLevel)
    this.logger.info('DeepConsumer1 initialized', { 
      config: this.config,
      level: 'deep1'
    })
  }

  async initializeDeepServices(): Promise<void> {
    this.logger.info('Initializing deep services...')
    try {
      const authUser = createUser({ username: 'deep_admin', password: 'deep_secret' })
      const cacheUser = createCacheUser({ name: 'Deep Cache User', cacheKey: 'deep_001' })
      const fileUser = createFileUser({ name: 'Deep File User', storage: 2048 })
      const logUser = createLogUser({ name: 'Deep Log User', logLevel: 'debug' })
      this.users = [authUser, cacheUser, fileUser, logUser]
      this.logger.debug('Deep users created', { 
        count: this.users.length,
        services: ['auth', 'cache', 'file', 'log']
      })
      this.userManager.addUser({
        name: authUser.username,
        email: 'deep_admin@example.com',
        createdAt: new Date()
      })
      this.userManager.addUser({
        name: cacheUser.name,
        email: 'deep_cache@example.com',
        createdAt: new Date()
      })
      const allUsers = this.userManager.getAllUsers()
      for (const user of allUsers) {
        const emailValidation = validateEmail(user.email)
        const nameValidation = validateName(user.name)
        if (!emailValidation.isValid || !nameValidation.isValid) {
          this.logger.warn('Deep user validation failed', {
            user: user.name,
            emailErrors: emailValidation.errors,
            nameErrors: nameValidation.errors
          })
        }
      }
      this.logger.info('Deep services initialized successfully', {
        userCount: allUsers.length,
        validationRules: VALIDATION_RULES,
        level: this.config.level
      })
    } catch (error) {
      this.logger.error('Failed to initialize deep services', { error })
      throw error
    }
  }

  async processDeepOperations(): Promise<void> {
    this.logger.info('Processing deep operations...')
    try {
      const users = this.userManager.getAllUsers()
      if (users.length > 0) {
        const updatedUser = updateUser(users[0], { username: 'updated_deep_admin' })
        this.logger.debug('Deep user updated', { userId: updatedUser.id })
      }
      deleteUser('deep_user_123')
      this.logger.info('Deep user deletion requested')
      const validationResults = VALIDATION_RULES.map(rule => ({
        name: rule.name,
        priority: rule.priority,
        active: true
      }))
      this.logger.info('Deep operations completed', {
        totalUsers: this.userManager.getAllUsers().length,
        validationRules: validationResults.length,
        level: this.config.level
      })
    } catch (error) {
      this.logger.error('Deep operations failed', { error })
    }
  }

  getDeepStatus(): Record<string, unknown> {
    const users = this.userManager.getAllUsers()
    const logs = this.logger.getLogs()
    return {
      config: this.config,
      userCount: users.length,
      logCount: logs.length,
      level: 'deep1',
      services: ['UserManager', 'Logger', 'ValidationUtils', 'AuthService', 'CacheService', 'FileService', 'LogService'],
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  }

  shutdown(): void {
    this.logger.info('Shutting down DeepConsumer1...')
    this.logger.info('DeepConsumer1 shutdown complete')
  }
}

export function createDeepConsumer1(config: DeepConsumer1Config): DeepConsumer1 {
  return new DeepConsumer1(config)
}
