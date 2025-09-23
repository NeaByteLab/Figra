import type { AliasConfig, FinderResult, StructureInfo } from '@interfaces/index'
import { findProjectRoot } from '@neabyte/project-root'
import { findAliasConfig } from '@core/alias'
import { findPatternReferences } from '@core/Finder'
import { findFileStructure } from '@core/Parser'
import { findPathResolver } from '@core/Resolver'
import { readFileSync } from 'fs'

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
  const fileStructure: StructureInfo[] = findFileStructure(filePath)
  if (fileStructure.length === 0) {
    console.error('[✗] No exports found in file, ensure file contains export statements')
    return
  }
  const projectConfig: AliasConfig[] = findAliasConfig(projectRoot)
  const filePattern: Array<FinderResult> = await findPatternReferences(projectRoot, fileStructure)
  const pathResolver: Array<FinderResult> = findPathResolver(projectRoot, projectConfig, [
    ...filePattern,
    ...[
      {
        filename: filePath,
        data: readFileSync(filePath, 'utf8')
      }
    ]
  ])
  console.log(`[✓] Resolved paths:\n${JSON.stringify(pathResolver, null, 2)}`)
  process.exit(0)
}
