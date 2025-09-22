# Figra

![npm version](https://img.shields.io/npm/v/@neabyte/figra)
![node version](https://img.shields.io/node/v/@neabyte/figra)
![typescript version](https://img.shields.io/badge/typeScript-5.9.2-blue.svg)
![license](https://img.shields.io/npm/l/@neabyte/figra.svg)
![status](https://img.shields.io/badge/status-development-orange.svg)

Parses import/export statements, generates dependency trees, and tracks filename references with alias resolution to map file relationships.

> 🚧 **Note:** This tool is currently in development. Some features may not be fully implemented yet.

## ✨ Features

- **Import/Export Analysis** - Parses all import/export relationships
- **Dependency Trees** - Generates hierarchical file structures
- **Filename Tracking** - Finds filename mentions in code
- **Alias Resolution** - Handles path aliases like `@utils/*`
- **File Correlation** - Maps relationships between files

---

## 📦 Installation

```bash
npm install -g @neabytelab/figra
```

## 🚀 Usage

```bash
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