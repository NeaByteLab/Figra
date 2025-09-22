import type { StructureInfo } from '@interfaces/index'
import { readFileSync, existsSync } from 'node:fs'

/**
 * Global variables for the parser.
 * @description Global variables for the parser.
 */
const exports: StructureInfo[] = []
const seenNames: Set<string> = new Set()
let match: RegExpExecArray | null = null

/**
 * Analyzes a file and extracts its export structure information.
 * @description Parses a file to identify all exported declarations and returns their structure information.
 * @param filePath - The file path to analyze for export structure
 * @returns Array of structure information objects describing the file's exports
 */
export function findFileStructure(filePath: string): StructureInfo[] {
  if (!existsSync(filePath)) {
    return []
  }
  const content: string = readFileSync(filePath, 'utf8')
  const functionRegex: RegExp = /export\s+(?:async\s+)?function\s+(\w+)/g
  while ((match = functionRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'function')
  }
  const variableRegex: RegExp = /export\s+(const|let|var)\s+(\w+)/g
  while ((match = variableRegex.exec(content)) !== null) {
    addExport(match[2] ?? '', 'variable')
  }
  const classRegex: RegExp = /export\s+(?:default\s+)?class\s+(\w+)/g
  while ((match = classRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'class')
  }
  const interfaceRegex: RegExp = /export\s+(?:default\s+)?interface\s+(\w+)/g
  while ((match = interfaceRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'interface')
  }
  const typeRegex: RegExp = /export\s+(?:default\s+)?type\s+(\w+)/g
  while ((match = typeRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'type')
  }
  const enumRegex: RegExp = /export\s+(?:default\s+)?enum\s+(\w+)/g
  while ((match = enumRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'enum')
  }
  const defaultFunctionRegex: RegExp = /export\s+default\s+(?:async\s+)?function\s+(\w+)/g
  while ((match = defaultFunctionRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'default')
  }
  const defaultClassRegex: RegExp = /export\s+default\s+class\s+(\w+)/g
  while ((match = defaultClassRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'default')
  }
  const defaultConstRegex: RegExp = /export\s+default\s+(?:const|let|var)\s+(\w+)/g
  while ((match = defaultConstRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'default')
  }
  const defaultArrowRegex: RegExp = /export\s+default\s+(\w+)\s*=/g
  while ((match = defaultArrowRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'default')
  }
  const functionExpressionRegex: RegExp = /export\s+const\s+(\w+)\s*=\s*function/g
  while ((match = functionExpressionRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'function')
  }
  const templateExportRegex: RegExp = /export\s+const\s+(\w+)\s*=\s*`/g
  while ((match = templateExportRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'variable')
  }
  const exportsRegex: RegExp = /^exports\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm
  while ((match = exportsRegex.exec(content)) !== null) {
    addExport(match[1] ?? '', 'property')
  }
  filterReExports(content)
  filterNamedExports(content)
  filterCommonJSExports(content)
  return exports
}

/**
 * Adds an export to the collection if it hasn't been seen before.
 * @description Adds a unique export to the exports array and tracks it in the seen names set.
 * @param name - The name of the export
 * @param type - The type of the export
 */
function addExport(name: string, type: string): void {
  if (name && !seenNames.has(name)) {
    seenNames.add(name)
    exports.push({ name, type })
  }
}

/**
 * Filters and processes re-export statements from file content.
 * @description Extracts re-exported names from export statements that import from other modules.
 * @param content - The file content to analyze for re-exports
 */
function filterReExports(content: string): void {
  const reExportRegex: RegExp = /^export\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/gm
  while ((match = reExportRegex.exec(content)) !== null) {
    const names: string[] =
      match[1]?.split(',').map((n: string) => {
        const parts: string[] = n.trim().split(' as ')
        return parts.length > 1 ? (parts[1]?.trim() ?? '') : (parts[0]?.trim() ?? '')
      }) ?? []
    names.forEach((name: string) => {
      if (name) {
        addExport(name, 're-export')
      }
    })
  }
}

/**
 * Filters and processes named export statements from file content.
 * @description Extracts named exports from export statements that don't import from other modules.
 * @param content - The file content to analyze for named exports
 */
function filterNamedExports(content: string): void {
  const namedExportRegex: RegExp = /^export\s*\{([^}]+)\}(?!\s*from)/gm
  while ((match = namedExportRegex.exec(content)) !== null) {
    const names: string[] =
      match[1]?.split(',').map((n: string) => {
        const parts: string[] = n.trim().split(' as ')
        return parts.length > 1 ? (parts[1]?.trim() ?? '') : (parts[0]?.trim() ?? '')
      }) ?? []
    names.forEach((name: string) => {
      if (name) {
        addExport(name, 'named')
      }
    })
  }
}

/**
 * Filters and processes CommonJS export statements from file content.
 * @description Extracts CommonJS exports from export statements that don't import from other modules.
 * @param content - The file content to analyze for CommonJS exports
 */
function filterCommonJSExports(content: string): void {
  const commonJSRegex: RegExp = /^module\.exports\s*=\s*\{([^}]+)\}/gm
  while ((match = commonJSRegex.exec(content)) !== null) {
    const names: string[] =
      match[1]?.split(',').map((n: string) => {
        return n.trim().split(':')[0]?.trim() ?? ''
      }) ?? []
    names.forEach((name: string) => {
      if (name) {
        addExport(name, 'named')
      }
    })
  }
}
