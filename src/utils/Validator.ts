import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { allowedExtensions } from '@constants/index'

/**
 * Validates a file path and checks if it exists and has a supported extension.
 * @description Resolves the file path, verifies file existence, and validates the file extension against allowed types.
 * @param filePath - The file path to validate
 * @returns The resolved and validated file path
 * @throws {Error} When the file does not exist or has an unsupported extension
 */
export function validateFilePath(filePath: string): string {
  const resolvedPath: string = resolve(filePath)
  if (!existsSync(resolvedPath)) {
    throw new Error(`File not found "${filePath}"`)
  }
  const extension: string = resolvedPath.substring(resolvedPath.lastIndexOf('.'))
  if (!allowedExtensions.includes(extension)) {
    throw new Error(
      `Unsupported file type "${extension}".\n\t- Supported extensions: ${allowedExtensions.join(', ')}`
    )
  }
  return resolvedPath
}
