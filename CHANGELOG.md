# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2024-09-23

### Added
- Backend API documentation in README
- Backend API for programmatic usage
- Changelog documentation
- CLI entry point function for better code organization
- Development notice about regex parsing issues
- Improved error messages
- Known bugs section for transparency
- TypeScript type exports

### Changed
- CLI architecture for better maintainability
- Default export function now returns Promise<AnalyzeFileResult | undefined>
- Enhanced development notice with specific error details
- Import structure in CLI.ts to use centralized cli() function
- Simplified CLI.ts to import from index instead of duplicating logic
- Updated README with backend API usage examples

### Fixed
- ASCII art display consistency across all command variations
- Backend API returning undefined instead of analysis results
- CLI detection logic that was preventing global installation from working
- CLI execution issues when run globally
- Function signature to properly return Promise for async operations
- Import path resolution in CLI module

---

## [0.1.0] - 2024-09-23

### Added
- CLI interface with multiple options
- Comprehensive error handling
- Cross-platform ripgrep binary management
- Dependency tree generation
- File structure parsing with regex patterns
- Import/export statement analysis
- Initial release of Figra
- SVG export functionality
- TypeScript path alias resolution

### Features
- Automatic ripgrep download for macOS, Windows, and Linux
- Custom export directory support
- Duplicate result filtering
- JSON and SVG output formats
- Multiple export options (`--no-export`, `--only-files`)
- Project root detection
- Support for `.js`, `.mjs`, `.cjs`, `.jsx`, `.ts`, `.tsx` files

---

## Version History

- **0.1.0**: Initial release with core functionality (September 23, 2024)
- **0.2.0**: CLI execution fixes and architecture improvements (September 23, 2024)
- **Unreleased**: Development improvements and testing
