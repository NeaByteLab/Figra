export interface SecurityConfig {
  secretKey: string
  algorithm: string
  expiresIn: string
  refreshExpiresIn: string
}

export interface TokenPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface SecurityResult {
  success: boolean
  token?: string
  error?: string
}

export class SecurityManager {
  private config: SecurityConfig

  constructor(config: SecurityConfig) {
    this.config = config
  }

  generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000)
    const exp = now + this.parseExpiresIn(this.config.expiresIn)
    const tokenPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp
    }
    return Buffer.from(JSON.stringify(tokenPayload)).toString('base64')
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const payload: TokenPayload = JSON.parse(decoded)
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null
      }
      return payload
    } catch {
      return null
    }
  }

  hashPassword(password: string): string {
    return Buffer.from(password + this.config.secretKey).toString('base64')
  }

  verifyPassword(password: string, hash: string): boolean {
    const hashedPassword = this.hashPassword(password)
    return hashedPassword === hash
  }

  generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000)
    const exp = now + this.parseExpiresIn(this.config.refreshExpiresIn)
    const tokenPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp
    }
    return Buffer.from(JSON.stringify(tokenPayload)).toString('base64')
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/)
    if (!match) {
      return 3600
    }
    const value = parseInt(match[1])
    const unit = match[2]
    switch (unit) {
      case 's': return value
      case 'm': return value * 60
      case 'h': return value * 3600
      case 'd': return value * 86400
      default: return 3600
    }
  }
}

export function createSecurityManager(config: SecurityConfig): SecurityManager {
  return new SecurityManager(config)
}
