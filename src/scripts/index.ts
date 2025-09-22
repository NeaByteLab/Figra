import type { IncomingMessage, ClientRequest } from 'node:http'
import type { LocationHeader, PlatformResponse } from '@interfaces/index'
import { createWriteStream, mkdirSync, unlinkSync, chmodSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { Progress } from '@neabyte/console-kit'
import https from 'node:https'
import Platform from '@scripts/Platform'

/**
 * Executes a command asynchronously.
 * @description Executes a command asynchronously using the exec function from the child_process module.
 * @param command - The command to execute
 * @returns The stdout and stderr of the command
 */
const execAsync: (command: string) => Promise<{ stdout: string; stderr: string }> = promisify(exec)

/**
 * Platform information for the binary.
 * @description The platform information for the binary file.
 */
const { id, extension }: PlatformResponse = Platform()

/**
 * Repository name for the tool.
 * @description The name of the tool repository.
 */
const repoName: string = 'ripgrep'

/**
 * Version number for the tool.
 * @description The specific version of the tool to download.
 */
const repoVer: string = '14.1.1'

/**
 * Complete download URL for the binary.
 * @description Constructs the full release URL for downloading the appropriate binary for the current platform.
 */
const repoUrl: string = `https://github.com/BurntSushi/${repoName}/releases/download/${repoVer}/${repoName}-${repoVer}-${id}.${extension}`

/**
 * Downloads the ripgrep binary for the current platform.
 * @description Downloads the appropriate binary file for the current operating system and architecture with progress tracking.
 * @returns Promise that resolves when download and extraction are complete
 * @throws {Error} When download or extraction fails
 */
export async function downloadRipgrep(): Promise<void> {
  console.log(`? URL: ${repoUrl}\n`)
  const progress: Progress = new Progress({ total: 100 })
  await progress.start('Getting file info...')
  try {
    const fileSize: number = await getFileSize(repoUrl)
    progress.update(10)
    const binDir: string = join(dirname(fileURLToPath(import.meta.url)), '../../bin')
    mkdirSync(binDir, { recursive: true })
    progress.update(15)
    await downloadFile(repoUrl, binDir, progress, fileSize)
    progress.update(85)
    await extractRipgrep(binDir)
    await progress.succeed('Binary downloaded and extracted successfully!')
  } catch (error: unknown) {
    await progress.fail(
      `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    throw error
  }
}

/**
 * Retrieves the file size from a remote URL.
 * @description Makes a HEAD request to determine the content length of the file at the given URL, handling redirects.
 * @param url - The URL to get the file size from
 * @returns Promise that resolves to the file size in bytes
 * @throws {Error} When the request fails or file size cannot be determined
 */
async function getFileSize(url: string): Promise<number> {
  return new Promise((resolve: (value: number) => void, reject: (reason: unknown) => void) => {
    const request: ClientRequest = https.request(
      url,
      { method: 'HEAD' },
      (response: IncomingMessage) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          const { location }: { location?: LocationHeader } = response.headers
          if (location !== undefined && typeof location === 'string' && location.length > 0) {
            getFileSize(location).then(resolve).catch(reject)
            return
          }
        }
        if (
          response.statusCode !== undefined &&
          response.statusCode >= 200 &&
          response.statusCode < 300
        ) {
          const contentLength: string | string[] | undefined = response.headers['content-length']
          if (
            contentLength !== undefined &&
            typeof contentLength === 'string' &&
            contentLength.length > 0
          ) {
            resolve(parseInt(contentLength, 10))
          } else {
            reject(new Error('Could not determine file size'))
          }
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
        }
      }
    )
    request.on('error', reject)
    request.end()
  })
}

/**
 * Downloads a file with progress tracking.
 * @description Downloads a file from the specified URL to the output directory while updating a progress bar.
 * @param url - The URL to download from
 * @param outputDir - The directory to save the file
 * @param progress - The progress bar instance for tracking download progress
 * @param fileSize - The total file size in bytes for progress calculation
 * @returns Promise that resolves when download is complete
 * @throws {Error} When download fails or HTTP request returns an error status
 */
async function downloadFile(
  url: string,
  outputDir: string,
  progress: Progress,
  fileSize: number
): Promise<void> {
  return new Promise((resolve: () => void, reject: (reason: unknown) => void) => {
    const fileName: string = `${repoName}-${repoVer}-${id}.${extension}`
    const filePath: string = join(outputDir, fileName)
    const file: ReturnType<typeof createWriteStream> = createWriteStream(filePath)
    let downloadedBytes: number = 0
    const request: ClientRequest = https.get(url, (response: IncomingMessage) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const { location }: { location?: LocationHeader } = response.headers
        if (location !== undefined && typeof location === 'string' && location.length > 0) {
          file.close()
          downloadFile(location, outputDir, progress, fileSize).then(resolve).catch(reject)
          return
        }
      }
      if (
        response.statusCode !== undefined &&
        response.statusCode >= 200 &&
        response.statusCode < 300
      ) {
        response.pipe(file)
        response.on('data', (chunk: Buffer) => {
          downloadedBytes += chunk.length
          const percentage: number = Math.min(Math.round((downloadedBytes / fileSize) * 100), 100)
          progress.update(percentage)
        })
        response.on('error', (error: Error) => {
          file.close()
          reject(error)
        })
        file.on('finish', () => {
          file.close()
          progress.update(100)
          resolve()
        })

        file.on('error', (error: Error) => {
          file.close()
          reject(error)
        })
      } else {
        file.close()
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
      }
    })
    request.on('error', (error: Error) => {
      file.close()
      reject(error)
    })
  })
}

/**
 * Extracts the downloaded archive and sets up the binary.
 * @description Extracts the downloaded archive file and moves the ripgrep binary to the appropriate location with correct permissions.
 * @param binDir - The directory containing the downloaded archive file
 * @returns Promise that resolves when extraction and setup are complete
 * @throws {Error} When extraction fails or required commands cannot be executed
 */
async function extractRipgrep(binDir: string): Promise<void> {
  const fileName: string = `${repoName}-${repoVer}-${id}.${extension}`
  const filePath: string = join(binDir, fileName)
  try {
    if (extension === 'tar.gz') {
      await execAsync(`tar -xzf "${filePath}" -C "${binDir}"`)
      const { stdout }: { stdout: string } = await execAsync(`find "${binDir}" -name "rg" -type f`)
      const rgPath: string = stdout.trim()
      if (rgPath) {
        const finalRgPath: string = join(binDir, 'rg')
        await execAsync(`mv "${rgPath}" "${finalRgPath}"`)
        chmodSync(finalRgPath, 0o755)
        const rgDir: string = dirname(rgPath)
        if (rgDir !== binDir) {
          await execAsync(`rm -rf "${rgDir}"`)
        }
      }
    } else if (extension === 'zip') {
      await execAsync(`unzip -o "${filePath}" -d "${binDir}"`)
      const { stdout }: { stdout: string } = await execAsync(
        `find "${binDir}" -name "rg.exe" -type f`
      )
      const rgPath: string = stdout.trim()
      if (rgPath) {
        const finalRgPath: string = join(binDir, 'rg.exe')
        await execAsync(`move "${rgPath}" "${finalRgPath}"`)
        const rgDir: string = dirname(rgPath)
        if (rgDir !== binDir) {
          await execAsync(`rmdir /s /q "${rgDir}"`)
        }
      }
    }
    unlinkSync(filePath)
  } catch (error: unknown) {
    throw new Error(
      `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
