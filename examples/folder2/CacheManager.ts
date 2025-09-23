export interface CacheEntry<T = unknown> {
  key: string
  value: T
  expiresAt: Date
  createdAt: Date
}

export type CacheOptions = {
  ttl: number
  maxSize: number
}

export class CacheManager<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>()
  private options: CacheOptions

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      ttl: 300000,
      maxSize: 1000,
      ...options
    }
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.options.maxSize) {
      this.evictOldest()
    }
    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.options.ttl)
    }
    this.cache.set(key, entry)
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key)
      return null
    }
    return entry.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private evictOldest(): void {
    const oldestKey = this.cache.keys().next().value
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  size(): number {
    return this.cache.size
  }
}

export function createCacheManager<T>(options?: Partial<CacheOptions>): CacheManager<T> {
  return new CacheManager<T>(options)
}
