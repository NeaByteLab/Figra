import { spawn, ChildProcess } from 'node:child_process'
import { ignorePatterns, allowedExtensions } from '@constants/index'
import { resolveRipgrepPath } from '@utils/index'

/**
 * Finds files that import or use the given filename.
 * @description Searches for files that import or reference the given filename.
 * @param projectRoot - The project root directory
 * @param filename - The filename to search for (without extension)
 * @returns void
 */
export async function findPatternReferences(projectRoot: string, filename: string): Promise<void> {
  const ripgrepPath: string | null = resolveRipgrepPath()
  if (ripgrepPath === null) {
    console.error('[✗] Ripgrep binary not found')
    return
  }
  try {
    const ignoreArgs: string[] = ignorePatterns.flatMap((pattern: string) => [
      '--glob',
      `!${pattern}`
    ])
    const searchPatterns: string[] = [
      `from ['"]@[^/]*/${filename}['"]`,
      `from ['"]\\.?/?.*${filename}['"]`,
      `import.*from ['"]\\.?/?.*${filename}['"]`,
      `require\\(['"]\\.?/?.*${filename}['"]\\)`,
      `@.*/${filename}['"]`
    ]
    const allResults: Set<string> = new Set()
    for (const pattern of searchPatterns) {
      const fileExtensions: string = allowedExtensions
        .map((ext: string) => ext.substring(1))
        .join(',')
      const args: string[] = [
        '--glob',
        `*.{${fileExtensions}}`,
        '--ignore-case',
        '--line-number',
        '--column',
        '--no-heading',
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
          const lineNum: string | undefined = parts[1]
          const col: string | undefined = parts[2]
          const content: string[] = parts.slice(3)
          if (file !== undefined && lineNum !== undefined && col !== undefined) {
            const relativePath: string = file.replace(projectRoot, '.')
            const contentStr: string = content.join(':').trim()
            const uniqueKey: string = `${relativePath}:${lineNum}:${contentStr}`
            allResults.add(uniqueKey)
          }
        })
      }
    }
    if (allResults.size > 0) {
      Array.from(allResults)
        .sort((a: string, b: string) => a.localeCompare(b))
        .forEach((uniqueKey: string) => {
          const [relativePath, lineNum, ...contentParts]: string[] = uniqueKey.split(':')
          const contentStr: string = contentParts.join(':')
          console.log(`  [+] ${relativePath}:${lineNum}:1 ${contentStr}`)
        })
    } else {
      console.log(' [x] No references found.')
    }
  } catch (error) {
    console.error(`[✗] Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
