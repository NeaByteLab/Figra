import type { AliasConfig } from '@interfaces/index'
import { resolveAlias } from '@core/alias/resolution/tsconfig'

/**
 * Finds the alias configuration from the tsconfig.json file.
 * @description Finds the alias configuration from the tsconfig.json file.
 * @param projectRoot - The project root directory
 * @returns The alias configuration
 */
export function findAliasConfig(projectRoot: string): AliasConfig[] {
  return resolveAlias(projectRoot)
}
