/**
 * Type definition for HTTP location header values.
 * @description Possible values for HTTP Location header.
 */
export type LocationHeader = string | string[] | undefined

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
