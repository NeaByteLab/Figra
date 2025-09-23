import type { AliasConfig, FinderResult } from '@interfaces/index'
import { existsSync } from 'node:fs'
import { resolve, dirname, extname, normalize, sep } from 'node:path'
import { allowedExtensions } from '@constants/index'

/**
 * Global regex match variable for pattern matching.
 * @description Stores the current regex match result during pattern execution across resolver functions.
 */
let match: RegExpExecArray | null = null

/**
 * Global array to store resolved file references.
 * @description Accumulates resolved file references from all import pattern matching functions for batch processing.
 */
const resolvedResults: Array<FinderResult> = []

/**
 * Resolves import paths from file patterns and returns resolved file references.
 * @description Processes files with import statements and resolves their paths.
 * @param projectRoot - The root directory of the project
 * @param projectConfig - The alias configuration for path mapping
 * @param filePattern - Array of files containing import statements to process
 * @returns Array of resolved file references with import information
 */
export function findPathResolver(
  projectRoot: string,
  projectConfig: AliasConfig[],
  filePattern: Array<FinderResult>
): Array<FinderResult> {
  resolvedResults.length = 0
  for (const result of filePattern) {
    const { filename, data }: { filename: string; data: string } = result
    regexES6Import(data, filename, projectRoot, projectConfig)
    regexES6DefaultImport(data, filename, projectRoot, projectConfig)
    regexCommonJsDestructuring(data, filename, projectRoot, projectConfig)
    regexCommonJSDefault(data, filename, projectRoot, projectConfig)
  }
  return resolvedResults
}

/**
 * Processes ES6 import statements and resolves their paths.
 * @description Extracts named imports from ES6 import statements.
 * @param data - The file content to analyze
 * @param filename - The name of the file being processed
 * @param projectRoot - The root directory of the project
 * @param projectConfig - The alias configuration for path mapping
 */
function regexES6Import(
  data: string,
  filename: string,
  projectRoot: string,
  projectConfig: AliasConfig[]
): void {
  const regexPattern: RegExp = /import\s*(?:type\s+)?\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g
  while ((match = regexPattern.exec(data)) !== null) {
    const imports: string[] =
      match[1]
        ?.split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0) ?? []
    const path: string = match[2] ?? ''
    if (imports.length > 0 && path) {
      const resolvedPath: string | null = resolveImportPath(
        path,
        filename,
        projectRoot,
        projectConfig
      )
      if (resolvedPath !== null) {
        resolvedResults.push({
          reference: resolvedPath,
          imported: imports,
          filename,
          data
        })
      }
    }
  }
}

/**
 * Processes ES6 default import statements and resolves their paths.
 * @description Extracts default imports from ES6 import statements.
 * @param data - The file content to analyze
 * @param filename - The name of the file being processed
 * @param projectRoot - The root directory of the project
 * @param projectConfig - The alias configuration for path mapping
 */
function regexES6DefaultImport(
  data: string,
  filename: string,
  projectRoot: string,
  projectConfig: AliasConfig[]
): void {
  const regexPattern: RegExp = /import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g
  while ((match = regexPattern.exec(data)) !== null) {
    const importName: string = match[1] ?? ''
    const path: string = match[2] ?? ''
    if (importName && path) {
      const resolvedPath: string | null = resolveImportPath(
        path,
        filename,
        projectRoot,
        projectConfig
      )
      if (resolvedPath !== null) {
        resolvedResults.push({
          reference: resolvedPath,
          imported: [importName],
          filename,
          data
        })
      }
    }
  }
}

/**
 * Processes CommonJS destructuring require statements and resolves their paths.
 * @description Extracts destructured imports from CommonJS require statements.
 * @param data - The file content to analyze
 * @param filename - The name of the file being processed
 * @param projectRoot - The root directory of the project
 * @param projectConfig - The alias configuration for path mapping
 */
function regexCommonJsDestructuring(
  data: string,
  filename: string,
  projectRoot: string,
  projectConfig: AliasConfig[]
): void {
  const regexPattern: RegExp = /const\s*\{([^}]+)\}\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  match = null
  while ((match = regexPattern.exec(data)) !== null) {
    const imports: string[] =
      match[1]
        ?.split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0) ?? []
    const path: string = match[2] ?? ''
    if (imports.length > 0 && path) {
      const resolvedPath: string | null = resolveImportPath(
        path,
        filename,
        projectRoot,
        projectConfig
      )
      if (resolvedPath !== null) {
        resolvedResults.push({
          reference: resolvedPath,
          imported: imports,
          filename,
          data
        })
      }
    }
  }
}

/**
 * Processes CommonJS default require statements and resolves their paths.
 * @description Extracts default imports from CommonJS require statements.
 * @param data - The file content to analyze
 * @param filename - The name of the file being processed
 * @param projectRoot - The root directory of the project
 * @param projectConfig - The alias configuration for path mapping
 */
function regexCommonJSDefault(
  data: string,
  filename: string,
  projectRoot: string,
  projectConfig: AliasConfig[]
): void {
  const regexPattern: RegExp = /const\s*(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  match = null
  while ((match = regexPattern.exec(data)) !== null) {
    const imports: string[] = match[1] !== undefined ? [match[1]] : []
    const path: string = match[2] ?? ''
    if (imports.length > 0 && path) {
      const resolvedPath: string | null = resolveImportPath(
        path,
        filename,
        projectRoot,
        projectConfig
      )
      if (resolvedPath !== null) {
        resolvedResults.push({
          reference: resolvedPath,
          imported: imports,
          filename,
          data
        })
      }
    }
  }
}

/**
 * Resolves an import path to its actual file location.
 * @description Resolves import paths using alias configurations and relative paths.
 * @param importPath - The import path to resolve
 * @param fromFile - The file containing the import statement
 * @param projectRoot - The root directory of the project
 * @param aliasConfig - The alias configuration for path mapping
 * @returns The resolved file path or null if not found
 */
function resolveImportPath(
  importPath: string,
  fromFile: string,
  projectRoot: string,
  aliasConfig: AliasConfig[]
): string | null {
  const normImportPath: string = normalizePath(importPath)
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const fromDir: string = dirname(fromFile)
    const fullPath: string = resolve(fromDir, importPath)
    const normFullPath: string = normalize(fullPath)
    const normProjectRoot: string = normalize(projectRoot)
    if (normFullPath.startsWith(normProjectRoot)) {
      const result: string | null = findFileWithExtension(normFullPath)
      return result
    }
  }
  const resAliasNonRelativePath: string | null = aliasNonRelativePath(
    normImportPath,
    projectRoot,
    aliasConfig
  )
  if (resAliasNonRelativePath !== null) {
    return resAliasNonRelativePath
  }
  const resAliasRelativePath: string | null = aliasRelativePath(normImportPath, aliasConfig)
  if (resAliasRelativePath !== null) {
    return resAliasRelativePath
  }
  return null
}

/**
 * Resolves non-relative import paths using alias configuration.
 * @description Handles import paths that don't start with '.' by checking alias mappings.
 * @param normImportPath - The normalized import path to resolve
 * @param projectRoot - The root directory of the project
 * @param aliasConfig - The alias configuration for path mapping
 * @returns The resolved file path or null if not found
 */
function aliasNonRelativePath(
  normImportPath: string,
  projectRoot: string,
  aliasConfig: AliasConfig[]
): string | null {
  if (!normImportPath.startsWith('.')) {
    for (const alias of aliasConfig) {
      const aliasKey: string = normalizePath(alias.key)
      if (aliasKey.includes('*')) {
        const aliasPrefix: string = aliasKey.replace('*', '')
        if (normImportPath.startsWith(aliasPrefix)) {
          const relativePath: string = normImportPath.replace(aliasPrefix, '')
          const aliasValue: string = normalizePath(alias.value)
          const fullPath: string = resolve(aliasValue, relativePath)
          const result: string | null = findFileWithExtension(fullPath)
          return result
        }
      } else if (normImportPath === aliasKey) {
        const aliasValue: string = normalizePath(alias.value)
        const result: string | null = findFileWithExtension(aliasValue)
        return result
      }
    }
    const fullPath: string = resolve(projectRoot, normImportPath)
    const result: string | null = findFileWithExtension(fullPath)
    return result
  }
  return null
}

/**
 * Resolves relative import paths using alias configuration.
 * @description Handles import paths that start with '.' by checking alias mappings.
 * @param normImportPath - The normalized import path to resolve
 * @param aliasConfig - The alias configuration for path mapping
 * @returns The resolved file path or null if not found
 */
function aliasRelativePath(normImportPath: string, aliasConfig: AliasConfig[]): string | null {
  for (const alias of aliasConfig) {
    const aliasKey: string = normalizePath(alias.key)
    if (aliasKey.includes('*')) {
      const aliasPrefix: string = aliasKey.replace('*', '')
      if (normImportPath.startsWith(aliasPrefix)) {
        const relativePath: string = normImportPath.replace(aliasPrefix, '')
        const aliasValue: string = normalizePath(alias.value)
        const fullPath: string = resolve(aliasValue, relativePath)
        return findFileWithExtension(fullPath)
      }
    } else if (normImportPath === aliasKey) {
      const aliasValue: string = normalizePath(alias.value)
      return findFileWithExtension(aliasValue)
    }
  }
  return null
}

/**
 * Normalizes a path for cross-platform compatibility.
 * @description Converts path separators to the current platform's separator.
 * @param path - The path to normalize
 * @returns The normalized path with platform-specific separators
 */
function normalizePath(path: string): string {
  return normalize(path.replace(/[/\\]/g, sep))
}

/**
 * Finds a file with the appropriate extension at the given base path.
 * @description Searches for a file at the base path with allowed extensions.
 * @param basePath - The base path to search for the file
 * @returns The full file path if found, null if no file exists
 */
function findFileWithExtension(basePath: string): string | null {
  if (extname(basePath)) {
    const exists: boolean = existsSync(basePath)
    return exists ? basePath : null
  }
  for (const ext of allowedExtensions) {
    const pathWithExt: string = `${basePath}${ext}`
    const exists: boolean = existsSync(pathWithExt)
    if (exists) {
      return pathWithExt
    }
  }
  for (const ext of allowedExtensions) {
    const indexPath: string = `${basePath}/index${ext}`
    const exists: boolean = existsSync(indexPath)
    if (exists) {
      return indexPath
    }
  }
  return null
}
