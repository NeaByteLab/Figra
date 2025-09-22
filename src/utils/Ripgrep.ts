import { fileURLToPath } from 'node:url'
import { join, dirname as pathDirname } from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

/**
 * The filename of the current module.
 * @description The filename of the current module is obtained using the fileURLToPath function.
 */
const filename: string = fileURLToPath(import.meta.url)

/**
 * The directory name of the current module.
 * @description The directory name of the current module is obtained using the pathDirname function.
 */
const dirname: string = pathDirname(filename)

/**
 * Gets the platform-specific ripgrep binary name.
 * @description Returns the appropriate binary name based on the current platform.
 * @returns The binary name (rg for Unix-like systems, rg.exe for Windows)
 */
function getBinaryName(): string {
  return os.platform() === 'win32' ? 'rg.exe' : 'rg'
}

/**
 * Resolves the path to the local ripgrep binary.
 * @description Resolves the path to the local ripgrep binary by joining the directory name of the current module with the platform-specific binary name.
 * @returns The path to the local ripgrep binary
 */
export function resolveRipgrepBin(): string {
  return join(dirname, '../../bin', getBinaryName())
}

/**
 * Searches for the ripgrep binary and returns its path if found.
 * @description Checks if the ripgrep binary exists in the local bin directory and returns its path.
 * @returns The path to the local ripgrep binary or null if not found
 */
export function resolveRipgrepPath(): string | null {
  const localRg: string = resolveRipgrepBin()
  if (isBinaryExists(localRg)) {
    return localRg
  }
  return null
}

/**
 * Checks if a binary file exists at the specified path.
 * @description Verifies the existence of a file at the given path using synchronous file system operations.
 * @param path - The file path to check for existence
 * @returns True if the file exists, false otherwise
 */
export function isBinaryExists(path: string): boolean {
  try {
    return fs.existsSync(path)
  } catch {
    return false
  }
}
