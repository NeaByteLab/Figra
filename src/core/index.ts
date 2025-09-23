import type { AliasConfig, FinderResult, StructureInfo } from '@interfaces/index'
import { findProjectRoot } from '@neabyte/project-root'
import { findAliasConfig } from '@core/alias'
import { findPatternReferences } from '@core/Finder'
import { findFileStructure } from '@core/Parser'

/**
 * Analyzes a file and logs the analysis results.
 * @description Analyzes the provided file path and logs the analysis results to the console.
 * @param filePath - The file path to analyze
 * @returns Promise<void>
 */
export async function analyzeFile(filePath: string): Promise<void> {
  console.log(`[✓] Analyzing: ${filePath}`)
  const projectRoot: string | null = findProjectRoot(filePath)
  if (projectRoot === null) {
    console.error('[✗] Project root not found')
    return
  }
  console.log(`[✓] Project root: ${projectRoot}`)
  const aliasConfig: AliasConfig[] = findAliasConfig(projectRoot)
  console.log(`[✓] Alias configuration:\n${JSON.stringify(aliasConfig, null, 2)}`)
  const fileStructure: StructureInfo[] = findFileStructure(filePath)
  console.log(`[✓] File structure:\n${JSON.stringify(fileStructure, null, 2)}`)
  const filePattern: Array<FinderResult> = await findPatternReferences(projectRoot, fileStructure)
  console.log(`[✓] File pattern references:\n${JSON.stringify(filePattern, null, 2)}`)
}
