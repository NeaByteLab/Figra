/**
 * Type definition for HTTP location header values.
 * @description Possible values for HTTP Location header.
 */
export type LocationHeader = string | string[] | undefined

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
