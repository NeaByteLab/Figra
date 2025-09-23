export interface ConfigSchema {
  [key: string]: unknown
}

export type ConfigValue = string | number | boolean | object | null

export interface ConfigOptions {
  strict: boolean
  validate: boolean
  defaults: Record<string, ConfigValue>
}

export class ConfigManager<T extends ConfigSchema = ConfigSchema> {
  private config: Partial<T> = {}
  private options: ConfigOptions

  constructor(options: Partial<ConfigOptions> = {}) {
    this.options = {
      strict: false,
      validate: true,
      defaults: {},
      ...options
    }
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    if (this.options.validate && !this.validateValue(value)) {
      throw new Error(`Invalid value for key ${String(key)}`)
    }
    this.config[key] = value
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.config[key] ?? (this.options.defaults[String(key)] as T[K])
  }

  has<K extends keyof T>(key: K): boolean {
    return key in this.config || key in this.options.defaults
  }

  delete<K extends keyof T>(key: K): boolean {
    return delete this.config[key]
  }

  merge(newConfig: Partial<T>): void {
    this.config = { ...this.config, ...newConfig }
  }

  reset(): void {
    this.config = {}
  }

  getAll(): Partial<T> {
    return { ...this.config }
  }

  private validateValue(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true
    }
    const type = typeof value
    return ['string', 'number', 'boolean', 'object'].includes(type)
  }
}

export function createConfigManager<T extends ConfigSchema>(
  options?: Partial<ConfigOptions>
): ConfigManager<T> {
  return new ConfigManager<T>(options)
}

export const CONFIG_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  OBJECT: 'object'
} as const
