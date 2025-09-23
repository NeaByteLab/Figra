/**
 * Type definition for connection type.
 * @description Possible values for connection type.
 */
export type ConnectionType = 'direct' | 're-export'

/**
 * Type definition for HTTP location header values.
 * @description Possible values for HTTP Location header.
 */
export type LocationHeader = string | string[] | undefined

/**
 * Type definition for parsed command line arguments.
 * @description Parsed command line arguments.
 */
export type ParsedArgs = {
  /** The values of the parsed arguments */
  values: Record<string, string | boolean | (string | boolean)[] | undefined>
  /** The positionals of the parsed arguments */
  positionals: string[]
}

/**
 * Interface for alias configuration.
 * @description Configuration for alias mapping.
 */
export interface AliasConfig {
  /** The key of the alias */
  key: string
  /** The value of the alias */
  value: string
}

/**
 * Interface for analyze file result.
 * @description Result of the analyze file.
 */
export interface AnalyzeFileResult {
  /** The related files */
  relatedFiles: string[]
  /** The correlations */
  correlations?: DependencyTree | undefined
  /** The path of the SVG file */
  svgPath?: string | undefined
  /** The buffer of the SVG file */
  svgBuffer?: Buffer | undefined
}

/**
 * Interface for dependency tree connection.
 * @description Represents a connection between files in the dependency tree.
 */
export interface DependencyConnection {
  /** Unique identifier for the connection */
  id: number
  /** The file path that the consumer imports from */
  from: string
  /** The file path of the consumer */
  to: string
  /** The type of import relationship */
  type: ConnectionType
  /** The exports being used from the original file */
  exports: string[]
}

/**
 * Interface for dependency tree result.
 * @description Complete dependency tree structure for a file.
 */
export interface DependencyTree {
  /** The file path being analyzed */
  filePath: string
  /** Array of connections showing file relationships */
  connections: DependencyConnection[]
  /** Array of exports from the analyzed file */
  exports: StructureInfo[]
}

/**
 * Interface for finder result.
 * @description Result of the finder.
 */
export interface FinderResult {
  /** The type of the result */
  reference?: string
  /** The type of the result */
  imported?: string[]
  /** The filename of the result */
  filename: string
  /** The data of the result */
  data: string
}

/**
 * Interface for platform-specific response data.
 * @description Platform detection results with binary identifier and file extension.
 */
export interface PlatformResponse {
  /** Platform-specific binary identifier */
  id: string
  /** Binary archive file extension */
  extension: string
}

/**
 * Interface for structure information.
 * @description Information about the structure of a file.
 */
export interface StructureInfo {
  /** The name of the structure */
  name: string
  /** The type of the structure */
  type: string
}
