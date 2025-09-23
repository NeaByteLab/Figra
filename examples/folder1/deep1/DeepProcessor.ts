export interface ProcessingRule {
  name: string
  condition: (data: unknown) => boolean
  action: (data: unknown) => unknown
  priority: number
}

export interface ProcessingContext {
  rules: ProcessingRule[]
  maxIterations: number
  stopOnError: boolean
  metadata: Record<string, unknown>
}

export type ProcessingResult = {
  success: boolean
  data: unknown
  iterations: number
  errors: string[]
  appliedRules: string[]
}

export class DeepProcessor {
  private context: ProcessingContext
  private isProcessing: boolean = false

  constructor(context: Partial<ProcessingContext> = {}) {
    this.context = {
      rules: [],
      maxIterations: 10,
      stopOnError: true,
      metadata: {},
      ...context
    }
  }

  addRule(rule: ProcessingRule): void {
    this.context.rules.push(rule)
    this.sortRulesByPriority()
  }

  removeRule(ruleName: string): boolean {
    const index = this.context.rules.findIndex(rule => rule.name === ruleName)
    if (index !== -1) {
      this.context.rules.splice(index, 1)
      return true
    }
    return false
  }

  process(data: unknown): ProcessingResult {
    if (this.isProcessing) {
      throw new Error('Processor is already running')
    }

    this.isProcessing = true
    const result: ProcessingResult = {
      success: true,
      data,
      iterations: 0,
      errors: [],
      appliedRules: []
    }

    try {
      let currentData = data
      let hasChanges = true

      while (hasChanges && result.iterations < this.context.maxIterations) {
        hasChanges = false
        result.iterations++

        for (const rule of this.context.rules) {
          try {
            if (rule.condition(currentData)) {
              const newData = rule.action(currentData)
              if (newData !== currentData) {
                currentData = newData
                hasChanges = true
                result.appliedRules.push(rule.name)
              }
            }
          } catch (error) {
            const errorMessage = `Rule ${rule.name} failed: ${error}`
            result.errors.push(errorMessage)
            
            if (this.context.stopOnError) {
              result.success = false
              break
            }
          }
        }
      }

      result.data = currentData
    } catch (error) {
      result.success = false
      result.errors.push(`Processing failed: ${error}`)
    } finally {
      this.isProcessing = false
    }

    return result
  }

  processAsync(data: unknown): Promise<ProcessingResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.process(data))
      }, 0)
    })
  }

  getRules(): ProcessingRule[] {
    return [...this.context.rules]
  }

  getContext(): ProcessingContext {
    return { ...this.context }
  }

  updateContext(updates: Partial<ProcessingContext>): void {
    this.context = { ...this.context, ...updates }
    if (updates.rules) {
      this.sortRulesByPriority()
    }
  }

  clearRules(): void {
    this.context.rules = []
  }

  private sortRulesByPriority(): void {
    this.context.rules.sort((a, b) => b.priority - a.priority)
  }
}

export function createDeepProcessor(context?: Partial<ProcessingContext>): DeepProcessor {
  return new DeepProcessor(context)
}

export const DEFAULT_RULES: ProcessingRule[] = [
  {
    name: 'null-check',
    condition: (data) => data === null,
    action: (data) => data,
    priority: 100
  },
  {
    name: 'string-trim',
    condition: (data) => typeof data === 'string',
    action: (data) => (data as string).trim(),
    priority: 50
  },
  {
    name: 'number-round',
    condition: (data) => typeof data === 'number',
    action: (data) => Math.round(data as number),
    priority: 25
  }
]
