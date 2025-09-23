export type ValidationResult = {
  isValid: boolean
  errors: string[]
}

export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)
  return {
    isValid,
    errors: isValid ? [] : ['Invalid email format']
  }
}

export function validateName(name: string): ValidationResult {
  const errors: string[] = []
  if (!name || name.trim().length === 0) {
    errors.push('Name is required')
  }
  if (name.length < 2) {
    errors.push('Name must be at least 2 characters')
  }
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const

export default function validateUser(user: { name: string; email: string }): ValidationResult {
  const nameResult = validateName(user.name)
  const emailResult = validateEmail(user.email)
  return {
    isValid: nameResult.isValid && emailResult.isValid,
    errors: [...nameResult.errors, ...emailResult.errors]
  }
}
