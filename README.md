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

## 📄 License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.