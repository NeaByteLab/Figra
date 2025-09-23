import type { AnalyzeFileResult, ParsedArgs } from '@interfaces/index'
import { asciiArt } from '@constants/index'
import { analyzeFile } from '@core/index'
import { downloadRipgrep } from '@scripts/index'
import { resolveRipgrepPath, validateFilePath } from '@utils/index'
import { parseArguments, showHelp } from '@root/Args'

/**
 * Checks if the ripgrep binary is already downloaded.
 * @description Verifies the existence of the ripgrep binary file in the local bin directory.
 * @returns True if the binary is already downloaded, false otherwise
 */
function isRipgrepDownloaded(): boolean {
  return resolveRipgrepPath() !== null
}

/**
 * Main entry point for the application.
 * @description Processes command line arguments, validates the file path, and initiates file analysis or binary download.
 * @returns Promise<void>
 * @throws {Error} When file validation fails or required binary is not available
 */
function main(): void {
  const args: ParsedArgs = parseArguments()
  if (args.values['help'] === true) {
    showHelp()
    return
  }
  if (args.values['download'] === true) {
    if (!isRipgrepDownloaded()) {
      downloadRipgrep()
        .catch((error: Error) => {
          console.error(`[✗] Download failed: ${error.message}`)
        })
        .finally(() => {
          process.exit(0)
        })
    } else {
      console.warn('[✓] Ripgrep already downloaded, skipping download...')
    }
    return
  }
  const filesPath: string | boolean | (string | boolean)[] | undefined = args.values['files']
  if (typeof filesPath === 'string' && filesPath.length > 0) {
    if (!isRipgrepDownloaded()) {
      throw new Error('Ripgrep not downloaded, please run "figra --download" first!')
    }
    analyzeFile(filesPath, args)
      .then((result: AnalyzeFileResult) => {
        console.log(JSON.stringify(result, null, 2))
      })
      .catch((error: Error) => {
        console.error(`[✗] Error: ${error.message}`)
      })
  } else {
    console.error('[✗] Error: No file path provided. Use --files or -f to specify a file.')
    showHelp()
  }
}

/**
 * Main entry point for the application.
 * @description Processes command line arguments, validates the file path, and initiates file analysis.
 * @returns AnalyzeFileResult | undefined
 * @throws {Error} When required binary is not available
 */
export default async function (options: ParsedArgs): Promise<AnalyzeFileResult | undefined> {
  let analysisResult: AnalyzeFileResult | undefined
  if (options?.values == undefined || options?.values == null) {
    throw new Error('Invalid arguments: options.values is required')
  }
  if (typeof options.values !== 'object' || Array.isArray(options.values)) {
    throw new Error('Invalid arguments: options.values must be an object')
  }
  if (options.values['files'] === undefined) {
    throw new Error('Invalid arguments: parameter "files" is required')
  }
  const filesPath: string | boolean | (string | boolean)[] | undefined = options.values['files']
  if (typeof filesPath === 'string' && filesPath.length > 0) {
    if (!isRipgrepDownloaded()) {
      throw new Error('Ripgrep not downloaded, please run "figra --download" first!')
    }
    const validatedFilePath: string = validateFilePath(filesPath)
    try {
      analysisResult = await analyzeFile(validatedFilePath, options)
    } catch (error: unknown) {
      throw new Error(
        `Failed to analyze file, ${error instanceof Error ? error.message : String(error)}`
      )
    }
  } else {
    throw new Error('Invalid arguments: parameter "files" should be a string')
  }
  return analysisResult
}

/**
 * CLI entry point function.
 * @description Displays the ASCII art banner and executes the main function for CLI usage.
 * @returns void
 */
export function cli(): void {
  console.log(asciiArt)
  main()
}

/**
 * Application entry point when run directly.
 * @description Displays ASCII art banner and executes main function.
 * @returns void
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  cli()
}

/**
 * Re-export interfaces and types for user convenience
 * @description Re-export interfaces and types for user convenience
 */
export * from '@interfaces/index'
