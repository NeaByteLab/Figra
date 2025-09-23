import type {
  ConnectionType,
  DependencyConnection,
  DependencyTree,
  FinderResult,
  StructureInfo
} from '@interfaces/index'
import { readFileSync, existsSync } from 'node:fs'

/**
 * Finds correlation between file exports and their usage in other files.
 * @description Analyzes file structure and path resolver results to find files that use the given file's exports.
 * @param filePath - The file path to find correlations for
 * @param fileStructure - The structure information of the file (exports)
 * @param pathResolver - Array of resolved file references with import information
 * @returns DependencyTree structure containing connections and exports
 */
export function findCorrelation(
  filePath: string,
  fileStructure: StructureInfo[],
  pathResolver: FinderResult[]
): DependencyTree {
  let connectionId: number = 1
  const connections: DependencyConnection[] = []
  for (const result of pathResolver) {
    const hasMatchingImports: boolean =
      result.imported?.some((importedName: string) =>
        fileStructure.some(
          (structure: StructureInfo) =>
            structure.name === importedName ||
            (structure.type === 'default' && result.reference === filePath)
        )
      ) ?? false
    if (!hasMatchingImports) {
      continue
    }
    let connectionType: ConnectionType
    let fromPath: string
    if (result.reference === filePath && result.filename !== filePath) {
      connectionType = 'direct'
      fromPath = filePath
    } else if (isReExportChain(filePath, result.reference ?? '', pathResolver)) {
      connectionType = 're-export'
      fromPath = result.reference ?? ''
    } else {
      continue
    }
    const connection: DependencyConnection = {
      id: connectionId++,
      from: fromPath,
      to: result.filename,
      type: connectionType,
      exports: result.imported ?? []
    }
    connections.push(connection)
  }
  return {
    filePath,
    connections,
    exports: fileStructure
  }
}

/**
 * Checks if there's a re-export chain from sourceFile to targetFile.
 * @description Analyzes if targetFile re-exports exports from sourceFile.
 * @param sourceFile - The original source file being analyzed
 * @param targetFile - The file that might be re-exporting from sourceFile
 * @param pathResolver - Array of resolved file references for context
 * @returns True if targetFile re-exports from sourceFile
 */
function isReExportChain(
  sourceFile: string,
  targetFile: string,
  pathResolver: FinderResult[]
): boolean {
  if (!existsSync(targetFile)) {
    return false
  }
  try {
    const content: string = readFileSync(targetFile, 'utf8')
    const reExportPatterns: RegExp[] = [
      new RegExp(`export\\s*\\{[^}]+\\}\\s*from\\s*['"]${escapeRegExp(sourceFile)}['"]`, 'g'),
      new RegExp(`export\\s*\\*\\s*from\\s*['"]${escapeRegExp(sourceFile)}['"]`, 'g'),
      new RegExp(
        `export\\s*\\{[^}]+\\}\\s*from\\s*['"]\\./[^'"]*${escapeRegExp(getFileName(sourceFile))}['"]`,
        'g'
      ),
      new RegExp(
        `export\\s*\\*\\s*from\\s*['"]\\./[^'"]*${escapeRegExp(getFileName(sourceFile))}['"]`,
        'g'
      )
    ]
    for (const pattern of reExportPatterns) {
      if (pattern.test(content)) {
        return true
      }
    }
    const aliasReExportPatterns: RegExp[] = [
      /export\s*\{[^}]+\}\s*from\s*['"]@[^'"]+['"]/g,
      /export\s*\*\s*from\s*['"]@[^'"]+['"]/g
    ]
    for (const pattern of aliasReExportPatterns) {
      const matches: RegExpExecArray[] = []
      let match: RegExpExecArray | null = null
      while ((match = pattern.exec(content)) !== null) {
        matches.push(match)
      }
      for (const aliasMatch of matches) {
        const aliasPathMatch: RegExpExecArray | null = /['"]([^'"]+)['"]/.exec(aliasMatch[0] ?? '')
        const aliasPath: string = aliasPathMatch?.[1] ?? ''
        if (aliasPath && isAliasResolvedToSource(aliasPath, sourceFile, pathResolver)) {
          return true
        }
      }
    }
    return false
  } catch {
    return false
  }
}

/**
 * Checks if an alias path resolves to the source file.
 * @description Determines if a path alias resolves to the source file.
 * @param aliasPath - The alias path to check
 * @param sourceFile - The source file to match against
 * @param pathResolver - Array of resolved file references for context
 * @returns True if the alias resolves to the source file
 */
function isAliasResolvedToSource(
  aliasPath: string,
  sourceFile: string,
  pathResolver: FinderResult[]
): boolean {
  const sourceFileName: string = getFileName(sourceFile)
  const aliasFileName: string = aliasPath.split('/').pop() ?? ''
  if (aliasFileName === sourceFileName.replace('.ts', '').replace('.js', '')) {
    return true
  }
  return pathResolver.some((result: FinderResult) => {
    if (result.reference === sourceFile) {
      return result.data.includes(aliasPath)
    }
    return false
  })
}

/**
 * Escapes special regex characters in a string.
 * @description Escapes characters that have special meaning in regex.
 * @param string - The string to escape
 * @returns The escaped string safe for use in regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Extracts the filename from a full file path.
 * @description Gets the filename part from a full file path.
 * @param filePath - The full file path
 * @returns The filename without directory path
 */
function getFileName(filePath: string): string {
  return filePath.split('/').pop()?.split('\\').pop() ?? ''
}
