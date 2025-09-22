import os from 'node:os'
import type { PlatformResponse } from '@interfaces/index'

/**
 * Gets the Darwin platform identifier based on architecture.
 * @description Maps the system architecture to the appropriate Darwin platform identifier for binary downloads.
 * @param arch - The system architecture (e.g., 'arm64', 'x64')
 * @returns The platform identifier for Darwin systems
 */
function getDarwinId(arch: string): string {
  return arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin'
}

/**
 * Gets the Windows platform identifier based on architecture.
 * @description Maps the system architecture to the appropriate Windows platform identifier for binary downloads.
 * @param arch - The system architecture (e.g., 'x64', 'arm64', 'ia32')
 * @returns The platform identifier for Windows systems
 */
function getWindowsId(arch: string): string {
  if (arch === 'x64') {
    return 'x86_64-pc-windows-msvc'
  }
  if (arch === 'arm64') {
    return 'aarch64-pc-windows-msvc'
  }
  return 'i686-pc-windows-msvc'
}

/**
 * Gets the Linux platform identifier based on architecture.
 * @description Maps the system architecture to the appropriate Linux platform identifier for binary downloads.
 * @param arch - The system architecture (e.g., 'x64', 'arm', 'arm64', 'ppc64', 'riscv64', 's390x')
 * @returns The platform identifier for Linux systems
 */
function getLinuxId(arch: string): string {
  const linuxMap: Record<string, string> = {
    x64: 'x86_64-unknown-linux-musl',
    arm: 'armv7-unknown-linux-gnueabihf',
    arm64: 'aarch64-unknown-linux-gnu',
    ppc64: 'powerpc64-unknown-linux-gnu',
    riscv64: 'riscv64gc-unknown-linux-gnu',
    s390x: 's390x-unknown-linux-gnu'
  }
  return linuxMap[arch] ?? 'i686-unknown-linux-gnu'
}

/**
 * Detects the current platform and returns the appropriate binary identifier and file extension.
 * @description Analyzes the operating system and architecture to determine the correct binary for the current platform.
 * @returns Object containing the platform identifier and file extension for the binary
 * @throws {Error} When the platform is not supported
 */
export default function (): PlatformResponse {
  const arch: string = os.arch()
  const platform: string = os.platform()
  if (platform === 'darwin') {
    return { id: getDarwinId(arch), extension: 'tar.gz' }
  }
  if (platform === 'win32') {
    return { id: getWindowsId(arch), extension: 'zip' }
  }
  if (platform === 'linux') {
    return { id: getLinuxId(arch), extension: 'tar.gz' }
  }
  throw new Error(`Unsupported platform: ${platform}`)
}
