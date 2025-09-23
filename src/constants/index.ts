/**
 * ASCII art banner for the Figra application.
 * @description Displays the application name and repository information in ASCII art format.
 */
export const asciiArt: string = `
 ███████████  ███
░░███░░░░░░█ ░░░
 ░███   █ ░  ████   ███████ ████████   ██████
 ░███████   ░░███  ███░░███░░███░░███ ░░░░░███ 
 ░███░░░█    ░███ ░███ ░███ ░███ ░░░   ███████ 
 ░███  ░     ░███ ░███ ░███ ░███      ███░░███ 
 █████       █████░░███████ █████    ░░████████
░░░░░       ░░░░░  ░░░░░███░░░░░      ░░░░░░░░ 
                   ███ ░███
                  ░░██████
                   ░░░░░░   

> Repository: https://github.com/NeaByteLab/Figra
`

/**
 * List of supported file extensions for analysis.
 * @description Contains all file extensions that the application can process and analyze.
 */
export const allowedExtensions: string[] = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx']

/**
 * Ignore patterns for ripgrep search.
 * @description Patterns to exclude from file analysis to improve performance and avoid noise.
 */
export const ignorePatterns: string[] = [
  '.docusaurus/**',
  '.git/**',
  '.idea/**',
  '.next/**',
  '.nuxt/**',
  '.vscode/**',
  '.vuepress/**',
  'build/**',
  'coverage/**',
  'dist/**',
  'public/**',
  'node_modules/**',
  'out/**'
]
