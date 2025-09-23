import { UserManager, createUserManager } from '../../folder1/UserManager'
import { Logger, LogLevel, defaultLogger } from '../../folder1/Logger'
import { validateEmail, validateName, VALIDATION_RULES } from '../../folder1/ValidationUtils'
import { createUser, updateUser, deleteUser } from '../../AuthService'
import { createUser as createOrderUser } from '../../OrderService'
import { createUser as createPaymentUser } from '../../PaymentService'
import { createUser as createProductUser } from '../../ProductService'
import { createUser as createReportUser } from '../../ReportService'

export interface DeepConsumer9Config {
  name: string
  level: number
  userManagement: {
    maxUsers: number
    validation: boolean
  }
  logging: {
    level: LogLevel
    enabled: boolean
  }
}

export class DeepConsumer9 {
  private userManager: UserManager
  private logger: Logger
  private config: DeepConsumer9Config
  private users: any[] = []

  constructor(config: DeepConsumer9Config) {
    this.config = config
    this.userManager = createUserManager()
    this.logger = defaultLogger
    this.logger.setMinLevel(config.logging.level)
    this.logger.info('DeepConsumer9 initialized', { 
      config: this.config,
      level: 'deep5'
    })
  }

  async initializeDeepServices(): Promise<void> {
    this.logger.info('Initializing deep9 services...')
    try {
      const authUser = createUser({ username: 'deep9_auth', password: 'deep9_secret' })
      const orderUser = createOrderUser({ name: 'Deep9 Order User', address: '789 Deep9 St' })
      const paymentUser = createPaymentUser({ name: 'Deep9 Payment User', paymentMethod: 'google_pay' })
      const productUser = createProductUser({ name: 'Deep9 Product User', role: 'ceo' })
      const reportUser = createReportUser({ name: 'Deep9 Report User', department: 'Deep9 Analytics' })
      this.users = [authUser, orderUser, paymentUser, productUser, reportUser]
      this.logger.debug('Deep9 users created', { 
        count: this.users.length,
        services: ['auth', 'order', 'payment', 'product', 'report']
      })
      this.users.forEach((user, index) => {
        this.userManager.addUser({
          name: user.name || user.username,
          email: `deep9_user${index}@example.com`,
          createdAt: new Date()
        })
      })
      if (this.config.userManagement.validation) {
        const allUsers = this.userManager.getAllUsers()
        for (const user of allUsers) {
          const emailValidation = validateEmail(user.email)
          const nameValidation = validateName(user.name)
          if (!emailValidation.isValid || !nameValidation.isValid) {
            this.logger.warn('Deep9 user validation failed', {
              user: user.name,
              emailErrors: emailValidation.errors,
              nameErrors: nameValidation.errors
            })
          }
        }
      }
      this.logger.info('Deep9 services initialized successfully', {
        userCount: this.userManager.getAllUsers().length,
        validationRules: VALIDATION_RULES.length,
        level: this.config.level
      })
    } catch (error) {
      this.logger.error('Failed to initialize deep9 services', { error })
      throw error
    }
  }

  async processDeepOperations(): Promise<void> {
    this.logger.info('Processing deep9 operations...')
    try {
      const users = this.userManager.getAllUsers()
      if (users.length > 0) {
        const updatedUser = updateUser(users[0], { username: 'updated_deep9_auth' })
        this.logger.debug('Deep9 user updated', { userId: updatedUser.id })
      }
      deleteUser('deep9_test_user')
      this.logger.info('Deep9 user deletion requested')
      const validationResults = VALIDATION_RULES.map(rule => ({
        name: rule.name,
        priority: rule.priority,
        active: true,
        level: 'deep9'
      }))
      this.logger.info('Deep9 operations completed', {
        totalUsers: this.userManager.getAllUsers().length,
        validationRules: validationResults.length,
        level: this.config.level
      })
    } catch (error) {
      this.logger.error('Deep9 operations failed', { error })
    }
  }

  getDeepStatus(): Record<string, unknown> {
    const users = this.userManager.getAllUsers()
    const logs = this.logger.getLogs()
    return {
      config: this.config,
      userCount: users.length,
      logCount: logs.length,
      level: 'deep5',
      services: ['UserManager', 'Logger', 'ValidationUtils', 'AuthService', 'OrderService', 'PaymentService', 'ProductService', 'ReportService'],
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  }

  shutdown(): void {
    this.logger.info('Shutting down DeepConsumer9...')
    this.logger.info('DeepConsumer9 shutdown complete')
  }
}

export function createDeepConsumer9(config: DeepConsumer9Config): DeepConsumer9 {
  return new DeepConsumer9(config)
}
