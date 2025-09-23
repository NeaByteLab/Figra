import { UserManager, createUserManager } from '../folder1/UserManager'
import { Logger, LogLevel, defaultLogger } from '../folder1/Logger'
import { validateEmail, validateName, VALIDATION_RULES } from '../folder1/ValidationUtils'
import { createUser, updateUser, deleteUser } from '../AuthService'
import { createUser as createCacheUser } from '../CacheService'
import { createUser as createFileUser } from '../FileService'

export interface AppConfig {
  name: string
  version: string
  debug: boolean
  maxUsers: number
}

export class AppConsumer {
  private userManager: UserManager
  private logger: Logger
  private config: AppConfig

  constructor(config: AppConfig) {
    this.config = config
    this.userManager = createUserManager()
    this.logger = defaultLogger
    this.logger.setMinLevel(config.debug ? LogLevel.DEBUG : LogLevel.INFO)
    this.logger.info('AppConsumer initialized', { config: this.config })
  }

  async initializeApp(): Promise<void> {
    this.logger.info('Initializing application...')
    try {
      const authUser = createUser({ username: 'admin', password: 'secret123' })
      const cacheUser = createCacheUser({ name: 'Cache User', cacheKey: 'user_001' })
      const fileUser = createFileUser({ name: 'File User', storage: 1024 })
      this.logger.debug('Users created', { 
        authUser: authUser.username, 
        cacheUser: cacheUser.name,
        fileUser: fileUser.name 
      })
      this.userManager.addUser({
        name: authUser.username,
        email: 'admin@example.com',
        createdAt: new Date()
      })
      this.userManager.addUser({
        name: cacheUser.name,
        email: 'cache@example.com',
        createdAt: new Date()
      })
      this.userManager.addUser({
        name: fileUser.name,
        email: 'file@example.com',
        createdAt: new Date()
      })
      const allUsers = this.userManager.getAllUsers()
      for (const user of allUsers) {
        const emailValidation = validateEmail(user.email)
        const nameValidation = validateName(user.name)
        if (!emailValidation.isValid || !nameValidation.isValid) {
          this.logger.warn('User validation failed', {
            user: user.name,
            emailErrors: emailValidation.errors,
            nameErrors: nameValidation.errors
          })
        }
      }
      this.logger.info('Application initialized successfully', {
        userCount: allUsers.length,
        validationRules: VALIDATION_RULES
      })
    } catch (error) {
      this.logger.error('Failed to initialize application', { error })
      throw error
    }
  }

  async processUserOperations(): Promise<void> {
    this.logger.info('Processing user operations...')
    try {
      const users = this.userManager.getAllUsers()
      if (users.length > 0) {
        const updatedUser = updateUser(users[0], { username: 'updated_admin' })
        this.logger.debug('User updated', { userId: updatedUser.id })
      }
      deleteUser('admin123')
      this.logger.info('User deletion requested')
      this.logger.info('User operations completed', {
        totalUsers: this.userManager.getAllUsers().length
      })
    } catch (error) {
      this.logger.error('User operations failed', { error })
    }
  }

  getAppStats(): Record<string, unknown> {
    const users = this.userManager.getAllUsers()
    const logs = this.logger.getLogs()
    return {
      config: this.config,
      userCount: users.length,
      logCount: logs.length,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  }

  shutdown(): void {
    this.logger.info('Shutting down application...')
    this.logger.info('Application shutdown complete')
  }
}

export function createAppConsumer(config: AppConfig): AppConsumer {
  return new AppConsumer(config)
}
