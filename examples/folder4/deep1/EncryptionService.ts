export interface EncryptionConfig {
  algorithm: string
  keyLength: number
  ivLength: number
  iterations: number
  saltLength: number
}

export interface EncryptionResult {
  encrypted: string
  iv: string
  salt: string
  algorithm: string
}

export interface DecryptionResult {
  decrypted: string
  success: boolean
  error?: string
}

export type EncryptionMode = 'encrypt' | 'decrypt' | 'hash' | 'verify'

export class EncryptionService {
  private config: EncryptionConfig
  private keys: Map<string, string> = new Map()

  constructor(config: Partial<EncryptionConfig> = {}) {
    this.config = {
      algorithm: 'AES-256-GCM',
      keyLength: 32,
      ivLength: 16,
      iterations: 100000,
      saltLength: 16,
      ...config
    }
  }

  generateKey(name?: string): string {
    const key = this.generateRandomBytes(this.config.keyLength)
    const keyString = Buffer.from(key).toString('base64')
    if (name) {
      this.keys.set(name, keyString)
    }
    return keyString
  }

  setKey(name: string, key: string): void {
    this.keys.set(name, key)
  }

  getKey(name: string): string | undefined {
    return this.keys.get(name)
  }

  removeKey(name: string): boolean {
    return this.keys.delete(name)
  }

  encrypt(data: string, keyName?: string): EncryptionResult {
    const key = keyName ? this.getKey(keyName) : this.generateKey()
    if (!key) {
      throw new Error('Encryption key not found')
    }
    const iv = this.generateRandomBytes(this.config.ivLength)
    const salt = this.generateRandomBytes(this.config.saltLength)
    const encrypted = this.simulateEncryption(data, key, iv, salt)
    return {
      encrypted: Buffer.from(encrypted).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      salt: Buffer.from(salt).toString('base64'),
      algorithm: this.config.algorithm
    }
  }

  decrypt(encryptionResult: EncryptionResult, keyName?: string): DecryptionResult {
    try {
      const key = keyName ? this.getKey(keyName) : this.generateKey()
      if (!key) {
        return {
          decrypted: '',
          success: false,
          error: 'Decryption key not found'
        }
      }
      const encrypted = Buffer.from(encryptionResult.encrypted, 'base64')
      const iv = Buffer.from(encryptionResult.iv, 'base64')
      const salt = Buffer.from(encryptionResult.salt, 'base64')
      const decrypted = this.simulateDecryption(encrypted, key, iv, salt)
      return {
        decrypted,
        success: true
      }
    } catch (error) {
      return {
        decrypted: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  hash(data: string, salt?: string): string {
    const actualSalt = salt || Buffer.from(this.generateRandomBytes(this.config.saltLength)).toString('base64')
    const combined = data + actualSalt
    const hash = this.simulateHash(combined)
    return `${hash}:${actualSalt}`
  }

  verify(data: string, hash: string): boolean {
    try {
      const [hashPart, salt] = hash.split(':')
      if (!hashPart || !salt) {
        return false
      }
      const computedHash = this.simulateHash(data + salt)
      return computedHash === hashPart
    } catch {
      return false
    }
  }

  generatePassword(length = 16, includeSymbols = true): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const symbols = includeSymbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : ''
    const allChars = chars + symbols
    let password = ''
    for (let i = 0; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    return password
  }

  updateConfig(updates: Partial<EncryptionConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  getConfig(): EncryptionConfig {
    return { ...this.config }
  }

  private generateRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
    return bytes
  }

  private simulateEncryption(data: string, key: string, iv: Uint8Array, salt: Uint8Array): Uint8Array {
    const dataBytes = new TextEncoder().encode(data)
    const keyBytes = new TextEncoder().encode(key)
    const encrypted = new Uint8Array(dataBytes.length)
    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length] ^ iv[i % iv.length]
    }
    return encrypted
  }

  private simulateDecryption(encrypted: Uint8Array, key: string, iv: Uint8Array, salt: Uint8Array): string {
    const keyBytes = new TextEncoder().encode(key)
    const decrypted = new Uint8Array(encrypted.length)
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length] ^ iv[i % iv.length]
    }
    return new TextDecoder().decode(decrypted)
  }

  private simulateHash(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }
}

export function createEncryptionService(config?: Partial<EncryptionConfig>): EncryptionService {
  return new EncryptionService(config)
}
