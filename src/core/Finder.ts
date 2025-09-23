import type { FinderResult, StructureInfo } from '@interfaces/index'
import { spawn, ChildProcess } from 'node:child_process'
import { ignorePatterns, allowedExtensions } from '@constants/index'
import { resolveRipgrepPath } from '@utils/index'

/**
 * Finds files that actually use the given file's exports.
 * @description Searches for files that import or reference the given file's exports and functions.
 * @param projectRoot - The project root directory
 * @param fileStructure - The structure of the file (exports)
 * @returns Array of objects containing filename and data content
 */
export async function findPatternReferences(projectRoot: string, fileStructure: StructureInfo[]): Promise<Array<FinderResult>> {
  const ripgrepPath: string | null = resolveRipgrepPath()
  if (ripgrepPath === null) {
    throw new Error('Ripgrep binary not found')
  }
  try {
    const ignoreArgs: string[] = ignorePatterns.flatMap((pattern: string) => [
      '--glob',
      `!${pattern}`
    ])
    const searchPatterns: string[] = []
    if (fileStructure.length > 0) {
      fileStructure.forEach((item: StructureInfo) => {
        if (['type', 'interface'].includes(item.type)) {
          searchPatterns.push(`import\\s+type\\s+\\{[^}]*${item.name}[^}]*\\}\\s+from`)
        } else if (['class', 'function', 'variable'].includes(item.type)) {
          searchPatterns.push(`import\\s+\\{[^}]*${item.name}\\s+as\\s+\\w+[^}]*\\}\\s+from`)
        } else if (item.type === 'default') {
          searchPatterns.push(`import\\s+${item.name}\\s+from`)
        } else if (item.type === 'property') {
          searchPatterns.push(`require\\(['"]\\.\\/[^'"]*${item.name}[^'"]*['"]\\)`)
        }
        searchPatterns.push(`const\\s+${item.name}\\s*=\\s*require\\(`)
        searchPatterns.push(`import\\s+\\{[^}]*${item.name}[^}]*\\}\\s+from`)
        searchPatterns.push(`import\\s+\\*\\s+as\\s+${item.name}\\s+from`)
        searchPatterns.push(`import\\s+${item.name}\\s+from`)
        searchPatterns.push(`import\\s+${item.name}\\s*,\\s*\\{`)
      })
    }
    const allResults: Array<FinderResult> = []
    for (const pattern of searchPatterns) {
      const fileExtensions: string = allowedExtensions
        .map((ext: string) => ext.substring(1))
        .join(',')
      const args: string[] = [
        '--glob',
        `*.{${fileExtensions}}`,
        '--ignore-case',
        '--no-heading',
        '--max-filesize', '10M',
        '--max-count', '200',
        ...ignoreArgs,
        pattern,
        projectRoot
      ]
      const result: string = await new Promise(
        (resolve: (value: string) => void, reject: (reason: unknown) => void) => {
          const child: ChildProcess = spawn(ripgrepPath, args, { cwd: projectRoot })
          let output: string = ''
          let error: string = ''
          if (child.stdout !== null) {
            child.stdout.on('data', (data: Buffer) => {
              output += data.toString()
            })
          }
          if (child.stderr !== null) {
            child.stderr.on('data', (data: Buffer) => {
              error += data.toString()
            })
          }
          child.on('close', (code: number | null) => {
            if (code === 0 || code === 1) {
              resolve(output)
            } else {
              reject(new Error(`Ripgrep exited with code ${code}: ${error}`))
            }
          })
          child.on('error', (err: Error) => {
            reject(err)
          })
        }
      )
      if (result.trim()) {
        const lines: string[] = result.trim().split('\n')
        lines.forEach((line: string) => {
          const parts: string[] = line.split(':')
          const file: string | undefined = parts[0]
          const content: string[] = parts.slice(1)
          if (file !== undefined) {
            const contentStr: string = content.join(':').trim()
            const existingResult: FinderResult | undefined = allResults.find((r: FinderResult) => r.filename === file)
            if (existingResult) {
              if (!existingResult.data.includes(contentStr)) {
                existingResult.data += `\n${contentStr}`
              }
            } else {
              allResults.push({ filename: file, data: contentStr })
            }
          }
        })
      }
    }
    return allResults
  } catch {
    return []
  }
}
