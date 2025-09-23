export interface ValidationRule {
  name: string
  validate: (value: unknown) => boolean
  message: string
  priority: number
}

export interface ValidationContext {
  field: string
  value: unknown
  rules: ValidationRule[]
  stopOnFirstError: boolean
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  metadata: Record<string, unknown>
}

export interface ValidationError {
  field: string
  rule: string
  message: string
  value: unknown
  priority: number
}

export interface ValidationWarning {
  field: string
  rule: string
  message: string
  value: unknown
  priority: number
}

export class ValidationEngine {
  private rules: Map<string, ValidationRule> = new Map()
  private globalRules: ValidationRule[] = []

  addRule(rule: ValidationRule): void {
    this.rules.set(rule.name, rule)
  }

  addGlobalRule(rule: ValidationRule): void {
    this.globalRules.push(rule)
    this.sortRulesByPriority()
  }

  removeRule(ruleName: string): boolean {
    return this.rules.delete(ruleName)
  }

  removeGlobalRule(ruleName: string): boolean {
    const index = this.globalRules.findIndex(rule => rule.name === ruleName)
    if (index !== -1) {
      this.globalRules.splice(index, 1)
      return true
    }
    return false
  }

  validate(context: ValidationContext): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const allRules = [...context.rules, ...this.globalRules]

    this.sortRulesByPriority(allRules)

    for (const rule of allRules) {
      try {
        const isValid = rule.validate(context.value)
        
        if (!isValid) {
          const error: ValidationError = {
            field: context.field,
            rule: rule.name,
            message: rule.message,
            value: context.value,
            priority: rule.priority
          }
          
          errors.push(error)
          
          if (context.stopOnFirstError) {
            break
          }
        }
      } catch (error) {
        const validationError: ValidationError = {
          field: context.field,
          rule: rule.name,
          message: `Rule execution failed: ${error}`,
          value: context.value,
          priority: rule.priority
        }
        errors.push(validationError)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        field: context.field,
        rulesApplied: allRules.length,
        timestamp: new Date().toISOString()
      }
    }
  }

  validateObject(obj: Record<string, unknown>, fieldRules: Record<string, ValidationRule[]>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}
    for (const [field, value] of Object.entries(obj)) {
      const rules = fieldRules[field] || []
      const context: ValidationContext = {
        field,
        value,
        rules,
        stopOnFirstError: false
      }
      results[field] = this.validate(context)
    }
    return results
  }

  validateArray(arr: unknown[], rule: ValidationRule): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    for (let i = 0; i < arr.length; i++) {
      const context: ValidationContext = {
        field: `[${i}]`,
        value: arr[i],
        rules: [rule],
        stopOnFirstError: false
      }
      const result = this.validate(context)
      errors.push(...result.errors)
      warnings.push(...result.warnings)
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        arrayLength: arr.length,
        rulesApplied: 1,
        timestamp: new Date().toISOString()
      }
    }
  }

  getRule(ruleName: string): ValidationRule | undefined {
    return this.rules.get(ruleName)
  }

  getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values())
  }

  getGlobalRules(): ValidationRule[] {
    return [...this.globalRules]
  }

  clearRules(): void {
    this.rules.clear()
  }

  clearGlobalRules(): void {
    this.globalRules = []
  }

  private sortRulesByPriority(rules: ValidationRule[] = this.globalRules): void {
    rules.sort((a, b) => b.priority - a.priority)
  }
}

export function createValidationEngine(): ValidationEngine {
  return new ValidationEngine()
}

export const COMMON_RULES: ValidationRule[] = [
  {
    name: 'required',
    validate: (value) => value !== null && value !== undefined && value !== '',
    message: 'Field is required',
    priority: 100
  },
  {
    name: 'string',
    validate: (value) => typeof value === 'string',
    message: 'Value must be a string',
    priority: 90
  },
  {
    name: 'number',
    validate: (value) => typeof value === 'number' && !isNaN(value),
    message: 'Value must be a valid number',
    priority: 90
  },
  {
    name: 'email',
    validate: (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Value must be a valid email address',
    priority: 80
  }
]
