import type {
  AliasConfig,
  AnalyzeFileResult,
  DependencyTree,
  FinderResult,
  StructureInfo,
  ParsedArgs
} from '@interfaces/index'
import { findProjectRoot } from '@neabyte/project-root'
import { findAliasConfig } from '@core/alias'
import { findCorrelation } from '@core/Correlation'
import { findPatternReferences } from '@core/Finder'
import { findFileStructure } from '@core/Parser'
import { findPathResolver } from '@core/Resolver'
import { exportToSVG } from '@core/Exporter'

/**
 * Analyzes a file and logs the analysis results.
 * @description Analyzes the provided file path to find its exports, dependencies, and usage patterns.
 * @param filePath - The file path to analyze for dependency relationships and export usage
 * @param args - The parsed command line arguments
 * @returns Promise<void>
 * @throws {Error} When project root cannot be found
 * @throws {Error} When no exports are found in the file
 * @throws {Error} When no resolved paths are found
 * @throws {Error} When no correlation is found between files
 */
export async function analyzeFile(filePath: string, args: ParsedArgs): Promise<AnalyzeFileResult> {
  const analysisResult: AnalyzeFileResult = {
    relatedFiles: [],
    correlations: undefined,
    svgPath: undefined,
    svgBuffer: undefined
  }
  let correlationResult: DependencyTree | undefined
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
  analysisResult.relatedFiles = [
    ...new Set(
      pathResolver
        .map((v: FinderResult) => v.reference)
        .filter((v: string | undefined): v is string => v !== undefined)
    )
  ]
  if (args.values['only-files'] === false) {
    correlationResult = findCorrelation(filePath, fileStructure, pathResolver)
    if (correlationResult.connections.length === 0) {
      throw new Error('No correlation found, please open issue on GitHub')
    }
    analysisResult.correlations = correlationResult
  }
  if (args.values['no-export'] === false && args.values['only-files'] === false) {
    if (correlationResult === undefined) {
      throw new Error('No correlation found, maybe command args are incorrect')
    }
    const fileName: string =
      filePath
        .split('/')
        .pop()
        ?.replace(/\.(ts|js|tsx|jsx)$/, '') ?? 'dependency'
    const timestamp: string = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const exportPath: string = (args.values['export-path'] as string) || './output'
    const svgPath: string = `${exportPath}/${fileName}-dependencies-${timestamp}.svg`.toLowerCase()
    exportToSVG(correlationResult, projectRoot, svgPath)
    analysisResult.svgPath = svgPath
    analysisResult.svgBuffer = Buffer.from(svgPath)
  }
  return analysisResult
}
