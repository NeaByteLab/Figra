# Figra

![npm version](https://img.shields.io/npm/v/@neabyte/figra)
![node version](https://img.shields.io/node/v/@neabyte/figra)
![typescript version](https://img.shields.io/badge/typeScript-5.9.2-blue.svg)
![license](https://img.shields.io/npm/l/@neabyte/figra.svg)
![status](https://img.shields.io/badge/status-development-orange.svg)

A powerful file analysis tool that parses import/export statements, generates dependency trees, and tracks filename references with alias resolution. Features automatic ripgrep binary download and multi-platform support.

> 🚧 **Note:** This tool is currently in development. Some features may not be fully implemented yet.

## ✨ Features

- **Auto Download** - Automatically downloads ripgrep binary for your platform
- **Dependency Trees** - Generates hierarchical file structures
- **File Correlation** - Maps relationships between files
- **Filename Tracking** - Finds filename mentions in code
- **Import/Export Analysis** - Parses all import/export relationships
- **Multi-Platform** - Supports Windows, macOS, and Linux
- **Smart Extraction** - Automatically extracts and sets up ripgrep

---

## 📦 Installation

```bash
npm install -g @neabytelab/figra
```

## 🚀 Usage

```bash
# Download and setup ripgrep binary (required first time)
figra download

# Analyze a file
figra /path/to/your/file.ts
```

## 📁 Supported Files

- `.js`, `.mjs`, `.cjs` - JavaScript files
- `.jsx` - React JavaScript
- `.ts` - TypeScript
- `.tsx` - React TypeScript

---

## 🚧 TODO Checklist

#### Core Analysis Engine
- [x] **File Structure Parsing** - Extracts all export declarations (functions, variables, classes, interfaces, types, enums)
- [x] **Export Type Detection** - Supports ES6, CommonJS, default, named, and re-exports
- [x] **File Reference Tracking** - Uses ripgrep to find cross-file references
- [x] **Pattern-based Search** - Multiple search patterns for different import styles
- [x] **Project Root Detection** - Automatically finds project root directory

#### Cross-Platform Support
- [x] **Platform Detection** - macOS (x64/ARM64), Windows (x64/ARM64/i686), Linux (multiple architectures)
- [x] **Binary Management** - Downloads and manages ripgrep v14.1.1 automatically
- [x] **Archive Extraction** - Handles tar.gz (Unix) and zip (Windows) formats
- [x] **Progress Tracking** - Visual download progress with user feedback

#### File Support & Validation
- [x] **Multi-format Support** - `.js`, `.mjs`, `.cjs`, `.jsx`, `.ts`, `.tsx`
- [x] **File Validation** - Checks existence and extension validity
- [x] **Error Handling** - Comprehensive error messages and validation

#### CLI Interface
- [x] **Command Line Interface** - `figra <file-path>` and `figra download` commands
- [x] **Search Filtering** - Ignores common directories (node_modules, dist, .git, etc.)
- [x] **JSON Output** - Structured file analysis results
- [x] **Duplicate Filtering** - Removes duplicate search results

### Enhance Core Features
- [ ] Add configurable search patterns for better filtering
- [ ] Add real-time file watching with live updates
- [ ] Create API exports for programmatic usage
- [ ] Generate visual dependency tree diagrams
- [ ] Improve CLI progress indicators and user feedback

### Support Alias Resolution from Config Files
- [ ] Parse `astro.config.js/ts` for Astro aliases
- [ ] Parse `bun.config.js` for Bun aliases
- [ ] Parse `esbuild.config.js` for esbuild aliases
- [ ] Parse `jest.config.js` for Jest testing aliases
- [ ] Parse `jsconfig.json` for JavaScript path aliases
- [ ] Parse `metro.config.js` for React Native aliases
- [ ] Parse `next.config.js` for Next.js aliases
- [ ] Parse `nuxt.config.js/ts` for Nuxt.js aliases
- [ ] Parse `package.json` for npm/yarn/pnpm aliases
- [ ] Parse `parcel.config.js` for Parcel aliases
- [ ] Parse `rollup.config.js` for Rollup aliases
- [ ] Parse `svelte.config.js` for SvelteKit aliases
- [x] Parse `tsconfig.json` for TypeScript path aliases
- [ ] Parse `vite.config.js/ts` for Vite bundler aliases
- [ ] Parse `vitest.config.js/ts` for Vitest testing aliases
- [ ] Parse `webpack.config.js` for Webpack aliases

---

## 📄 License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.