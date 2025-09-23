import type { AliasConfig } from '@interfaces/index'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

/**
 * Interface for compiler data.
 * @description Data from the compiler options in the tsconfig.json file.
 */
interface CompilerData {
  /** The base URL for the compiler */
  baseUrl: string
  /** The paths for the compiler */
  paths: Record<string, string[]>
}

/**
 * Interface for compiler configuration.
 * @description Configuration from the compiler options in the tsconfig.json file.
 */
interface CompilerConfig {
  /** The compiler options */
  compilerOptions: CompilerData
}

/**
 * Resolves the alias configuration from the tsconfig.json file.
 * @description Resolves the alias configuration from the tsconfig.json file.
 * @param projectRoot - The project root directory
 * @returns The alias configuration
 */
export function resolveAlias(projectRoot: string): AliasConfig[] {
  try {
    const tsconfig: CompilerConfig = JSON.parse(
      readFileSync(resolve(projectRoot, 'tsconfig.json'), 'utf8')
    ) as CompilerConfig
    const { baseUrl, paths }: CompilerData = tsconfig.compilerOptions
    const result: Array<AliasConfig> = []
    for (const [alias, pathPatterns] of Object.entries(paths)) {
      const pathPattern: string = pathPatterns[0] ?? ''
      const fullPath: string = resolve(projectRoot, baseUrl, pathPattern.replace('*', ''))
      result.push({
        key: alias,
        value: fullPath
      })
    }
    return result
  } catch {
    return []
  }
}
