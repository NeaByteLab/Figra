export interface FileInfo {
  name: string
  path: string
  size: number
  isDirectory: boolean
  createdAt: Date
  modifiedAt: Date
}

export interface DirectoryOptions {
  recursive: boolean
  includeHidden: boolean
  filter?: (file: FileInfo) => boolean
}

export type FileOperation = 'read' | 'write' | 'delete' | 'move' | 'copy'

export class FileSystemManager {
  private basePath: string
  private permissions: Set<FileOperation>

  constructor(basePath: string, permissions: FileOperation[] = ['read']) {
    this.basePath = basePath
    this.permissions = new Set(permissions)
  }

  async readFile(filePath: string): Promise<string> {
    this.checkPermission('read')
    return `Content of ${filePath}`
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    this.checkPermission('write')
    console.log(`Writing to ${filePath}: ${content}`)
  }

  async deleteFile(filePath: string): Promise<void> {
    this.checkPermission('delete')
    console.log(`Deleting ${filePath}`)
  }

  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    this.checkPermission('move')
    console.log(`Moving ${sourcePath} to ${destPath}`)
  }

  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    this.checkPermission('copy')
    console.log(`Copying ${sourcePath} to ${destPath}`)
  }

  async listDirectory(dirPath: string, options: Partial<DirectoryOptions> = {}): Promise<FileInfo[]> {
    this.checkPermission('read')
    const opts: DirectoryOptions = {
      recursive: false,
      includeHidden: false,
      ...options
    }
    const files: FileInfo[] = [
      {
        name: 'file1.txt',
        path: `${dirPath}/file1.txt`,
        size: 1024,
        isDirectory: false,
        createdAt: new Date(),
        modifiedAt: new Date()
      },
      {
        name: 'subdir',
        path: `${dirPath}/subdir`,
        size: 0,
        isDirectory: true,
        createdAt: new Date(),
        modifiedAt: new Date()
      }
    ]
    return files.filter(file => {
      if (!opts.includeHidden && file.name.startsWith('.')) {
        return false
      }
      if (opts.filter && !opts.filter(file)) {
        return false
      }
      return true
    })
  }

  async createDirectory(dirPath: string): Promise<void> {
    this.checkPermission('write')
    console.log(`Creating directory ${dirPath}`)
  }

  async fileExists(filePath: string): Promise<boolean> {
    this.checkPermission('read')
    return Math.random() > 0.5
  }

  private checkPermission(operation: FileOperation): void {
    if (!this.permissions.has(operation)) {
      throw new Error(`Permission denied: ${operation} operation not allowed`)
    }
  }
}

export function createFileSystemManager(
  basePath: string, 
  permissions?: FileOperation[]
): FileSystemManager {
  return new FileSystemManager(basePath, permissions)
}
