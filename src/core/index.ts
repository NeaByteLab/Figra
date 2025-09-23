import type { AliasConfig, DependencyTree, FinderResult, StructureInfo } from '@interfaces/index'
import { findProjectRoot } from '@neabyte/project-root'
import { findAliasConfig } from '@core/alias'
import { findCorrelation } from '@core/Correlation'
import { findPatternReferences } from '@core/Finder'
import { findFileStructure } from '@core/Parser'
import { findPathResolver } from '@core/Resolver'

/**
 * Analyzes a file and logs the analysis results.
 * @description Analyzes the provided file path to find its exports, dependencies, and usage patterns.
 * @param filePath - The file path to analyze for dependency relationships and export usage
 * @returns Promise<void>
 * @throws {Error} When project root cannot be found
 * @throws {Error} When no exports are found in the file
 * @throws {Error} When no resolved paths are found
 * @throws {Error} When no correlation is found between files
 */
export async function analyzeFile(filePath: string): Promise<void> {
  console.log(`[✓] Analyzing: ${filePath}`)
  const projectRoot: string | null = findProjectRoot(filePath)
  if (projectRoot === null) {
    throw new Error('Project root not found')
  }
  const fileStructure: StructureInfo[] = findFileStructure(filePath)
  if (fileStructure.length === 0) {
    throw new Error('No exports found in file, ensure file contains export statements')
  }
  const projectConfig: AliasConfig[] = findAliasConfig(projectRoot)
  const filePattern: Array<FinderResult> = await findPatternReferences(projectRoot, fileStructure)
  const pathResolver: Array<FinderResult> = findPathResolver(
    projectRoot,
    projectConfig,
    filePattern
  )
  if (pathResolver.length === 0) {
    throw new Error('No resolved paths found, expected no imports in file')
  }
  console.log(`[✓] Path resolver:\n${JSON.stringify(pathResolver, null, 2)}`)
  const correlationResult: DependencyTree = findCorrelation(filePath, fileStructure, pathResolver)
  if (correlationResult.connections.length === 0) {
    throw new Error('No correlation found, please open issue on GitHub')
  }
  console.log(`[✓] Correlation result:\n${JSON.stringify(correlationResult, null, 2)}`)
  process.exit(0)
}
