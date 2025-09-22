import type { StructureInfo } from '@interfaces/index'
import { findProjectRoot } from '@neabyte/project-root'
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
  const filename: string = filePath.split('/').pop()?.split('.')[0] ?? ''
  if (filename) {
    console.log(`[✓] Searching for files using "${filename}":`)
    const resFileStructure: StructureInfo[] = findFileStructure(filePath)
    console.log(`[✓] File structure:\n${JSON.stringify(resFileStructure, null, 2)}`)
    await findPatternReferences(projectRoot, filename)
  }
}
