import { parseArgs, type ParseArgsOptionsConfig } from 'node:util'
import { type ParsedArgs } from '@interfaces/index'

/**
 * Options for parsing command line arguments.
 * @description Defines the available options and their types.
 */
const argsOptions: ParseArgsOptionsConfig = {
  help: {
    type: 'boolean',
    short: 'h',
    default: false
  },
  download: {
    type: 'boolean',
    short: 'd',
    default: false
  },
  'export-path': {
    type: 'string',
    short: 'e',
    default: './output'
  },
  files: {
    type: 'string',
    short: 'f'
  },
  'no-export': {
    type: 'boolean',
    default: false
  },
  'only-files': {
    type: 'boolean',
    default: false
  }
}

/**
 * Parses command line arguments and returns a parsed object.
 * @description Parses the command line arguments using the parseArgs function and returns a parsed object.
 * @param customArgs - Optional custom arguments array. If not provided, uses process.argv.
 * @param strict - Whether to throw errors on unknown arguments. Default: true.
 * @param allowPositionals - Whether to allow positional arguments. Default: true.
 * @returns A parsed object containing the command line arguments.
 */
export function parseArguments(
  customArgs?: string[],
  strict: boolean = true,
  allowPositionals: boolean = true
): ParsedArgs {
  try {
    return parseArgs({
      args: customArgs,
      options: argsOptions,
      strict,
      allowPositionals
    })
  } catch {
    throw new Error('Invalid arguments, use --help to see available options')
  }
}

/**
 * Displays help information for the CLI.
 * @description Shows usage examples and available options.
 */
export function showHelp(): void {
  const helpText: string = `[ USAGE ]
  figra [options]

[ OPTIONS ]
  -h, --help                     # Show this help message
  -d, --download                 # Download and setup ripgrep binary
  -e, --export-path=<dir>        # Custom export directory for SVG output (default: ./output)
  -f, --files=<path>             # File path to analyze (required for analysis)
  --no-export                    # Skip SVG generation, return JSON only
  --only-files                   # Return only related files list (skip correlation analysis)

[ EXAMPLES ]
  figra -d
  figra -f "/path/to/file.ext"
  figra -f "/path/to/file.ext" -e "./output"
  figra --files="/path/to/file.ext" --no-export
  figra --files="/path/to/file.ext" --only-files
`
  console.log(helpText)
}
