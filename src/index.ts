import { asciiArt } from '@constants/index'
import { analyzeFile } from '@core/index'
import { downloadRipgrep } from '@scripts/index'
import { resolveRipgrepPath, validateFilePath } from '@utils/index'

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
 * @returns void
 * @throws {Error} When file validation fails or required binary is not available
 */
function main(): void {
  const args: string[] = process.argv.slice(2)
  if (args.length === 0) {
    console.error('[?] Usage: figra <file-path> | figra download')
    console.error('[?] Example: figra /path/to/your/file.ts')
    console.error('[?] Download: figra download')
    process.exit(1)
  }
  if (args[0] === 'download') {
    if (isRipgrepDownloaded()) {
      console.warn('[✓] Ripgrep already downloaded, skipping download...')
      return
    }
    downloadRipgrep().then(() => {
      process.exit(0)
    }).catch((error: Error) => {
      console.error(`[✗] Download failed: ${error.message}`)
      process.exit(1)
    })
    return
  }
  const filePath: string = args[0] ?? ''
  try {
    const validatedPath: string = validateFilePath(filePath)
    if (!isRipgrepDownloaded()) {
      throw new Error('Ripgrep not downloaded, please run "figra download" first!')
    }
    analyzeFile(validatedPath)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`[✗] Error: ${error.message}`)
    } else {
      console.error('[✗] Error: An unknown error occurred')
    }
    process.exit(1)
  }
}

/**
 * Application entry point when run directly.
 * @description Checks if the script is being run directly and displays the ASCII art banner before executing the main function.
 * @returns void
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(asciiArt)
  main()
}