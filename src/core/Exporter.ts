import type { DependencyTree, DependencyConnection, StructureInfo } from '@interfaces/index'
import { writeFileSync, mkdirSync } from 'node:fs'
import { basename, dirname } from 'node:path'

/**
 * Exports dependency tree to SVG format with arrows and styling.
 * @description Generates a visual SVG representation of file dependencies with directional arrows.
 * @param result - The dependency tree result to export
 * @param projectRoot - The project root directory path
 * @param outputPath - Optional output path for the SVG file
 * @returns The generated SVG content as string
 */
export function exportToSVG(
  result: DependencyTree,
  projectRoot: string,
  outputPath?: string
): string {
  const { filePath, connections, exports }: DependencyTree = result
  const fileName: string = basename(filePath)
  const svgContent: string = generateSVGContent(
    filePath,
    fileName,
    connections,
    exports,
    projectRoot
  )
  if (outputPath !== undefined) {
    const outputDir: string = dirname(outputPath)
    try {
      mkdirSync(outputDir, { recursive: true })
    } catch {
      // Skip error if directory already exists
    }
    writeFileSync(outputPath, svgContent, 'utf8')
    console.log(`[✓] SVG exported to: ${outputPath}`)
  }
  return svgContent
}

/**
 * Generates SVG content for the dependency visualization.
 * @description Creates SVG markup with nodes, arrows, and styling for dependency relationships.
 * @param filePath - The full path of the source file
 * @param fileName - The name of the source file
 * @param connections - Array of dependency connections
 * @param exports - Array of exports from the source file
 * @param projectRoot - The project root directory path
 * @returns Complete SVG markup as string
 */
function generateSVGContent(
  filePath: string,
  fileName: string,
  connections: DependencyConnection[],
  exports: StructureInfo[],
  projectRoot: string
): string {
  const nodeWidth: number = 220
  const nodeHeight: number = 80
  const padding: number = 50
  const headerHeight: number = 100
  const footerHeight: number = 120
  const minNodeSpacing: number = 250
  let colsPerRow: number
  let rows: number
  if (connections.length <= 2) {
    colsPerRow = connections.length
    rows = 1
  } else if (connections.length <= 4) {
    colsPerRow = 2
    rows = Math.ceil(connections.length / 2)
  } else if (connections.length <= 6) {
    colsPerRow = 3
    rows = Math.ceil(connections.length / 3)
  } else {
    colsPerRow = Math.ceil(Math.sqrt(connections.length))
    rows = Math.ceil(connections.length / colsPerRow)
  }
  const maxFileNameLength: number = Math.max(
    ...connections.map((c: DependencyConnection) => c.to.replace(`${projectRoot}/`, '').length)
  )
  const dynamicSpacing: number = Math.max(minNodeSpacing, 180 + maxFileNameLength * 4)
  const consumerAreaWidth: number = colsPerRow * dynamicSpacing
  const consumerAreaHeight: number = rows * 200
  const width: number = Math.max(1100, padding * 2 + 400 + consumerAreaWidth)
  const height: number = headerHeight + Math.max(400, consumerAreaHeight) + footerHeight
  const sourceX: number = padding + 120
  const sourceY: number = headerHeight + Math.max(200, consumerAreaHeight / 2)
  const consumerStartX: number = sourceX + 400
  const consumerStartY: number = headerHeight + 120
  let svg: string = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`
  svg += `
  <defs>
    <marker id="arrowhead-direct" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="strokeWidth">
      <polygon points="0 0, 10 4, 0 8" fill="#374151" stroke="#374151" stroke-width="0.5"/>
    </marker>
    <marker id="arrowhead-reexport" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="strokeWidth">
      <polygon points="0 0, 10 4, 0 8" fill="#374151" stroke="#374151" stroke-width="0.5"/>
    </marker>
    <linearGradient id="sourceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fef2f2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fecaca;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="directGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0fdf4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#bbf7d0;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="reexportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dbeafe;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#93c5fd;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
    <filter id="arrowGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>`
  svg += `<rect width="${width}" height="${height}" fill="#fafafa"/>
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>`
  svg += `
  <rect x="0" y="0" width="${width}" height="${headerHeight}" fill="#ffffff" stroke="#e5e7eb" stroke-width="1"/>
  <text x="${width / 2}" y="35" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#1f2937">
    ${fileName} Dependencies
  </text>
  <text x="${width / 2}" y="60" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#6b7280">
    📁 Root: ${projectRoot}
  </text>
  <text x="${width / 2}" y="80" text-anchor="middle" font-family="monospace" font-size="11" fill="#9ca3af">
    ${filePath}
  </text>`
  connections.forEach((connection: DependencyConnection, index: number) => {
    const row: number = Math.floor(index / colsPerRow)
    const col: number = index % colsPerRow
    const consumerXPos: number = consumerStartX + col * dynamicSpacing
    const consumerY: number = consumerStartY + row * 200
    const isDirect: boolean = connection.type === 'direct'
    const arrowColor: string = '#374151'
    const arrowMarker: string = isDirect ? 'arrowhead-direct' : 'arrowhead-reexport'
    const arrowStartX: number = sourceX + nodeWidth
    const arrowStartY: number = sourceY
    const arrowEndX: number = consumerXPos - nodeWidth / 2
    const arrowEndY: number = consumerY
    const midX: number = (arrowStartX + arrowEndX) / 2
    const controlOffset: number = Math.abs(arrowEndY - arrowStartY) * 0.3
    const controlX: number = midX
    const controlY: number =
      arrowStartY < arrowEndY ? arrowStartY + controlOffset : arrowStartY - controlOffset
    const arrowPath: string = `M ${arrowStartX} ${arrowStartY} Q ${controlX} ${controlY} ${arrowEndX} ${arrowEndY}`
    svg += `<path d="${arrowPath}" stroke="${arrowColor}" stroke-width="1" fill="none" marker-end="url(#${arrowMarker})" filter="url(#arrowGlow)"/>`
  })
  svg += `
  <rect x="${sourceX}" y="${sourceY - nodeHeight / 2}" width="${nodeWidth}" height="${nodeHeight}" fill="url(#sourceGradient)" stroke="#dc2626" stroke-width="3" rx="12" filter="url(#shadow)"/>
  <text x="${sourceX + nodeWidth / 2}" y="${sourceY - 5}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#991b1b">
    ${fileName}
  </text>
  <text x="${sourceX + nodeWidth / 2}" y="${sourceY + 15}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#6b7280">
    Source File
  </text>`
  connections.forEach((connection: DependencyConnection, index: number) => {
    const consumerPath: string = connection.to.replace(`${projectRoot}/`, '')
    const row: number = Math.floor(index / colsPerRow)
    const col: number = index % colsPerRow
    const consumerXPos: number = consumerStartX + col * dynamicSpacing
    const consumerY: number = consumerStartY + row * 200
    const consumerRectX: number = consumerXPos - nodeWidth / 2
    const isDirect: boolean = connection.type === 'direct'
    const gradientId: string = isDirect ? 'directGradient' : 'reexportGradient'
    const nodeStroke: string = isDirect ? '#16a34a' : '#2563eb'
    const exportNumbers: string = connection.exports
      .map((exp: string) => {
        const exportIndex: number = exports.findIndex((e: StructureInfo) => e.name === exp)
        return exportIndex !== -1 ? (exportIndex + 1).toString() : '1'
      })
      .sort((a: string, b: string) => parseInt(a) - parseInt(b))
      .join(',')
    const nodeType: string = `[${exportNumbers}]`
    const displayPath: string = consumerPath
    const nodeHeightDynamic: number = consumerPath.length > 30 ? 100 : nodeHeight
    svg += `
    <rect x="${consumerRectX}" y="${consumerY - nodeHeightDynamic / 2}" width="${nodeWidth}" height="${nodeHeightDynamic}" fill="url(#${gradientId})" stroke="${nodeStroke}" stroke-width="2" rx="10" filter="url(#shadow)"/>
    <text x="${consumerXPos}" y="${consumerY - 5}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="#374151">
      ${displayPath}
    </text>
    <text x="${consumerXPos}" y="${consumerY + 12}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="bold" fill="#374151">
      ${nodeType}
    </text>`
  })
  const footerY: number = height - footerHeight
  svg += `
  <rect x="0" y="${footerY}" width="${width}" height="${footerHeight}" fill="#ffffff" stroke="#e5e7eb" stroke-width="1"/>
  <text x="${width / 2}" y="${footerY + 30}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#1f2937">
    Exports Summary
  </text>
  <text x="${width / 2}" y="${footerY + 50}" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#374151">
    ${exports.map((exp: StructureInfo, idx: number) => `[${idx + 1}]${exp.name}`).join(', ')}
  </text>
  <text x="${width / 2}" y="${footerY + 70}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#6b7280">
    ${exports.length} exports • ${connections.length} consumers • ${connections.filter((c: DependencyConnection) => c.type === 'direct').length} direct connections
  </text>`
  const legendY: number = footerY + 85
  const legendWidth: number = 240
  const legendStartX: number = width - legendWidth - 20
  svg += `
  <rect x="${legendStartX}" y="${legendY}" width="12" height="12" fill="#fef2f2" stroke="#dc2626" rx="2"/>
  <text x="${legendStartX + 18}" y="${legendY + 10}" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#374151">Source</text>
  <rect x="${legendStartX + 80}" y="${legendY}" width="12" height="12" fill="#f0fdf4" stroke="#16a34a" rx="2"/>
  <text x="${legendStartX + 98}" y="${legendY + 10}" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#374151">Direct</text>
  <rect x="${legendStartX + 160}" y="${legendY}" width="12" height="12" fill="#dbeafe" stroke="#2563eb" rx="2"/>
  <text x="${legendStartX + 178}" y="${legendY + 10}" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#374151">Re-export</text>`
  svg += '</svg>'
  return svg
}
