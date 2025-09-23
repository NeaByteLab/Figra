import { analyzeFile } from '../dist/core/index'
import { performance } from 'node:perf_hooks'
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Interface for benchmark result data.
 * @description Contains the results of analyzing a single file for performance metrics.
 */
interface BenchmarkResult {
  /** The file path that was analyzed */
  file: string
  /** The duration of the analysis in milliseconds */
  duration: number
  /** The number of exports found in the file */
  exports: number
  /** The number of unique consumers found */
  consumers: number
  /** The number of connections found */
  connections: number
  /** Whether the analysis was successful */
  success: boolean
  /** Error message if the analysis failed */
  error?: string
}

/**
 * Interface for benchmark statistics summary.
 * @description Aggregated statistics from multiple benchmark runs.
 */
interface BenchmarkStats {
  /** Total number of files processed */
  totalFiles: number
  /** Number of successful benchmark runs */
  successfulRuns: number
  /** Number of failed benchmark runs */
  failedRuns: number
  /** Total duration of all successful runs in milliseconds */
  totalDuration: number
  /** Average duration per successful run in milliseconds */
  averageDuration: number
  /** Path of the fastest analyzed file */
  fastestFile: string
  /** Path of the slowest analyzed file */
  slowestFile: string
  /** Duration of the fastest analysis in milliseconds */
  fastestDuration: number
  /** Duration of the slowest analysis in milliseconds */
  slowestDuration: number
  /** Total number of exports found across all files */
  totalExports: number
  /** Total number of consumers found across all files */
  totalConsumers: number
  /** Total number of connections found across all files */
  totalConnections: number
}

/**
 * Recursively finds all TypeScript files in a directory.
 * @description Searches through a directory and its subdirectories to find all TypeScript files.
 * @param dir - The directory path to search for TypeScript files
 * @returns Array of file paths for all found TypeScript files
 */
function findTsFiles(dir: string): string[] {
  const files: string[] = []
  const items = readdirSync(dir)
  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      files.push(...findTsFiles(fullPath))
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath)
    }
  }
  return files
}

/**
 * Runs benchmark analysis on a single file.
 * @description Analyzes a file for performance metrics including duration, exports, consumers, and connections.
 * @param filePath - The file path to analyze for benchmark metrics
 * @returns Promise<BenchmarkResult> containing the analysis results and performance data
 * @throws {Error} When file analysis fails due to missing exports, import resolution issues, or other errors
 */
async function benchmarkFile(filePath: string): Promise<BenchmarkResult> {
  const start = performance.now()
  const originalLog = console.log
  const originalError = console.error
  let output = ''
  try {
    console.log = (...args: any[]) => {
      output += args.join(' ') + '\n'
    }
    console.error = (...args: any[]) => {
      output += 'ERROR: ' + args.join(' ') + '\n'
    }
    await analyzeFile(filePath)
    console.log = originalLog
    console.error = originalError
    const end = performance.now()
    const duration = end - start
    const jsonMatch = output.match(/\{[\s\S]*\}/)
    let exports = 0, consumers = 0, connections = 0
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0])
        exports = data.exports?.length || 0
        connections = data.connections?.length || 0
        const uniqueConsumers = new Set(data.connections?.map((c: any) => c.to) || [])
        consumers = uniqueConsumers.size
      } catch (e) {
        const exportsMatch = output.match(/(\d+) exports/)
        const consumersMatch = output.match(/(\d+) consumers/)
        const connectionsMatch = output.match(/(\d+) direct connections/)
        exports = exportsMatch ? parseInt(exportsMatch[1]) : 0
        consumers = consumersMatch ? parseInt(consumersMatch[1]) : 0
        connections = connectionsMatch ? parseInt(connectionsMatch[1]) : 0
      }
    }
    return {
      file: filePath,
      duration,
      exports,
      consumers,
      connections,
      success: true
    }
  } catch (error) {
    const end = performance.now()
    const duration = end - start
    console.log = originalLog
    console.error = originalError
    let errorType = 'Unknown error'
    if (error instanceof Error) {
      if (error.message.includes('No exports found')) {
        errorType = 'No exports'
      } else if (error.message.includes('No resolved paths')) {
        errorType = 'Import resolution failed'
      } else if (error.message.includes('No correlation')) {
        errorType = 'No dependencies'
      } else if (error.message.includes('Project root not found')) {
        errorType = 'No project root'
      } else if (error.message.includes('Ripgrep not downloaded')) {
        errorType = 'Missing ripgrep'
      } else if (error.message.includes('Ripgrep binary not found')) {
        errorType = 'Missing ripgrep binary'
      } else if (error.message.includes('File not found')) {
        errorType = 'File not found'
      } else if (error.message.includes('Unsupported file type')) {
        errorType = 'Unsupported file type'
      } else if (error.message.includes('Unsupported platform')) {
        errorType = 'Unsupported platform'
      } else if (error.message.includes('Extraction failed')) {
        errorType = 'Extraction failed'
      } else {
        errorType = error.message
      }
    }
    return {
      file: filePath,
      duration,
      exports: 0,
      consumers: 0,
      connections: 0,
      success: false,
      error: errorType
    }
  }
}

/**
 * Calculates benchmark statistics from multiple results.
 * @description Aggregates individual benchmark results into comprehensive statistics including averages, totals, and extremes.
 * @param results - Array of benchmark results to analyze
 * @returns BenchmarkStats object containing aggregated statistics
 */
function calculateStats(results: BenchmarkResult[]): BenchmarkStats {
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const durations = successful.map(r => r.duration)
  const totalDuration = durations.reduce((sum, d) => sum + d, 0)
  const fastest = successful.reduce((min, r) => r.duration < min.duration ? r : min, successful[0])
  const slowest = successful.reduce((max, r) => r.duration > max.duration ? r : max, successful[0])
  const totalExports = successful.reduce((sum, r) => sum + r.exports, 0)
  const totalConsumers = successful.reduce((sum, r) => sum + r.consumers, 0)
  const totalConnections = successful.reduce((sum, r) => sum + r.connections, 0)
  return {
    totalFiles: results.length,
    successfulRuns: successful.length,
    failedRuns: failed.length,
    totalDuration,
    averageDuration: totalDuration / successful.length || 0,
    fastestFile: fastest?.file || '',
    slowestFile: slowest?.file || '',
    fastestDuration: fastest?.duration || 0,
    slowestDuration: slowest?.duration || 0,
    totalExports,
    totalConsumers,
    totalConnections
  }
}

/**
 * Main benchmark function that runs comprehensive analysis.
 * @description Executes benchmark analysis on all TypeScript files in the project and displays detailed results including performance metrics, error analysis, and connection statistics.
 * @returns Promise<void>
 */
async function runBenchmark(): Promise<void> {
  console.log('📊 Figra Benchmark Results')
  console.log('==========================\n')
  const srcDir = '/Volumes/MasterData/Project-Sandbox/Figra/src'
  const examplesDir = '/Volumes/MasterData/Project-Sandbox/Figra/examples'
  const exampleFiles = findTsFiles(examplesDir)
  const srcFiles = findTsFiles(srcDir)
  const allFiles = [...exampleFiles, ...srcFiles]
  console.log(`📁 Found ${allFiles.length} TypeScript files total`)
  console.log(`   - Examples: ${exampleFiles.length} files`)
  console.log(`   - Source: ${srcFiles.length} files`)
  console.log(`   - Testing: All ${allFiles.length} files for connection depth analysis`)
  console.log('')
  const results: BenchmarkResult[] = []
  let processed = 0
  for (const file of allFiles) {
    const relativePath = file.replace('/Volumes/MasterData/Project-Sandbox/Figra/', '')
    process.stdout.write(`⏳ Processing ${++processed}/${allFiles.length}: ${relativePath}... `)
    const result = await benchmarkFile(file)
    results.push(result)
    if (result.success) {
      console.log(`✅ ${result.duration.toFixed(2)}ms`)
    } else {
      console.log(`❌ FAILED: ${result.error}`)
    }
  }
  console.log('\n📊 Benchmark Results')
  console.log('===================\n')
  const stats = calculateStats(results)
  console.log(`📈 Results:`)
  console.log(`   Total Files: ${stats.totalFiles}`)
  console.log(`   Successful: ${stats.successfulRuns}`)
  console.log(`   Failed: ${stats.failedRuns}`)
  console.log(`   Total Duration: ${stats.totalDuration.toFixed(2)}ms`)
  console.log(`   Average Duration: ${stats.averageDuration.toFixed(2)}ms`)
  const fastestRelative = stats.fastestFile.replace('/Volumes/MasterData/Project-Sandbox/Figra/', '')
  const slowestRelative = stats.slowestFile.replace('/Volumes/MasterData/Project-Sandbox/Figra/', '')
  console.log(`   Fastest: ${stats.fastestDuration.toFixed(2)}ms (${fastestRelative})`)
  console.log(`   Slowest: ${stats.slowestDuration.toFixed(2)}ms (${slowestRelative})`)
  console.log('')
  const errorCounts = results
    .filter(r => !r.success)
    .reduce((acc, r) => {
      acc[r.error || 'Unknown'] = (acc[r.error || 'Unknown'] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  if (Object.keys(errorCounts).length > 0) {
    console.log(`❌ Error Breakdown:`)
    Object.entries(errorCounts).forEach(([error, count]) => {
      console.log(`   ${error}: ${count} files`)
    })
    console.log('')
  }
  console.log(`🔍 Data Found:`)
  console.log(`   Total Exports Found: ${stats.totalExports}`)
  console.log(`   Total Consumers Found: ${stats.totalConsumers}`)
  console.log(`   Total Connections: ${stats.totalConnections}`)
  console.log('')
  const fast = results.filter(r => r.success && r.duration < 100)
  const medium = results.filter(r => r.success && r.duration >= 100 && r.duration < 500)
  const slow = results.filter(r => r.success && r.duration >= 500)
  console.log(`⚡ Speed Groups:`)
  console.log(`   Under 100ms: ${fast.length} files`)
  console.log(`   100-500ms: ${medium.length} files`)
  console.log(`   Over 500ms: ${slow.length} files`)
  console.log('')
  const top5 = results
    .filter(r => r.success)
    .sort((a, b) => a.duration - b.duration)
    .slice(0, 5)
  console.log(`🏆 Fastest Files:`)
  top5.forEach((result, index) => {
    const relativePath = result.file.replace('/Volumes/MasterData/Project-Sandbox/Figra/', '')
    console.log(`   ${index + 1}. ${relativePath} - ${result.duration.toFixed(2)}ms`)
  })
  console.log('')
  const mostComplex = results
    .filter(r => r.success)
    .sort((a, b) => (b.exports + b.consumers + b.connections) - (a.exports + a.consumers + a.connections))
    .slice(0, 5)
  console.log(`🧩 Files with Most Relationships:`)
  mostComplex.forEach((result, index) => {
    const relativePath = result.file.replace('/Volumes/MasterData/Project-Sandbox/Figra/', '')
    const complexity = result.exports + result.consumers + result.connections
    console.log(`   ${index + 1}. ${relativePath} - ${complexity} total relationships`)
  })
  console.log('')
  console.log(`🔗 Connection Analysis:`)
  const successfulWithConnections = results.filter(r => r.success && r.connections > 0)
  const noConnections = results.filter(r => r.success && r.connections === 0)
  console.log(`   Files with connections: ${successfulWithConnections.length}`)
  console.log(`   Files without connections: ${noConnections.length}`)
  if (successfulWithConnections.length > 0) {
    const sortedByConnections = successfulWithConnections.sort((a, b) => b.connections - a.connections)
    console.log('')
    console.log(`📊 Top 10 Files by Connection Count:`)
    sortedByConnections.slice(0, 10).forEach((result, index) => {
      const relativePath = result.file.replace('/Volumes/MasterData/Project-Sandbox/Figra/', '')
      console.log(`   ${index + 1}. ${relativePath} - ${result.connections} connections`)
    })
    const shallow = successfulWithConnections.filter(r => r.connections <= 3)
    const medium = successfulWithConnections.filter(r => r.connections > 3 && r.connections <= 10)
    const deep = successfulWithConnections.filter(r => r.connections > 10)
    console.log('')
    console.log(`🌊 Connection Depth Categories:`)
    console.log(`   Shallow (1-3 connections): ${shallow.length} files`)
    console.log(`   Medium (4-10 connections): ${medium.length} files`)
    console.log(`   Deep (>10 connections): ${deep.length} files`)
  }
  console.log('\n🎯 Benchmark Complete!')
  const jsonOutput = {
    timestamp: new Date().toISOString(),
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      architecture: process.arch
    },
    summary: {
      totalFiles: stats.totalFiles,
      successful: stats.successfulRuns,
      failed: stats.failedRuns,
      averageDuration: stats.averageDuration,
      totalDuration: stats.totalDuration
    },
    results: results.map(result => ({
      file: result.file,
      relativePath: result.file.replace('/Volumes/MasterData/Project-Sandbox/Figra/', ''),
      duration: result.duration,
      exports: result.exports,
      consumers: result.consumers,
      connections: result.connections,
      success: result.success,
      error: result.error || null
    }))
  }
  writeFileSync('./benchmark_results.json', JSON.stringify(jsonOutput, null, 2))
  console.log('\n📄 Results saved to benchmark_results.json')
  createResultMarkdown(results, stats)
}

/**
 * Creates a detailed RESULT.md file for manual validation.
 * @description Generates a comprehensive markdown report with full file paths, success/failure status, and detailed error reasons for manual review.
 * @param results - Array of benchmark results
 * @param stats - Calculated benchmark statistics
 */
function createResultMarkdown(results: BenchmarkResult[], stats: BenchmarkStats): void {
  const timestamp = new Date().toISOString()
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const errorGroups = failed.reduce((acc, result) => {
    const errorType = result.error || 'Unknown'
    if (!acc[errorType]) acc[errorType] = []
    acc[errorType].push(result)
    return acc
  }, {} as Record<string, BenchmarkResult[]>)
  let markdown = `# Figra Benchmark Results - Manual Validation

**Generated**: ${timestamp}  
**System**: ${process.platform} ${process.arch} (Node.js ${process.version})  
**Total Files**: ${stats.totalFiles} (${stats.successfulRuns} successful, ${stats.failedRuns} failed)

---

## 📊 Summary Statistics

- **Total Files**: ${stats.totalFiles}
- **Successful**: ${stats.successfulRuns} (${((stats.successfulRuns / stats.totalFiles) * 100).toFixed(1)}%)
- **Failed**: ${stats.failedRuns} (${((stats.failedRuns / stats.totalFiles) * 100).toFixed(1)}%)
- **Average Duration**: ${stats.averageDuration.toFixed(2)}ms
- **Total Duration**: ${stats.totalDuration.toFixed(2)}ms
- **Fastest**: ${stats.fastestDuration.toFixed(2)}ms
- **Slowest**: ${stats.slowestDuration.toFixed(2)}ms

---

## ✅ Successful Files (${successful.length})

| # | File Path | Duration | Exports | Consumers | Connections |
|---|-----------|----------|---------|-----------|------------|
`
  successful.forEach((result, index) => {
    const relativePath = result.file.replace('/Volumes/MasterData/Project-Sandbox/Figra/', '')
    markdown += `| ${index + 1} | \`${relativePath}\` | ${result.duration.toFixed(2)}ms | ${result.exports} | ${result.consumers} | ${result.connections} |\n`
  })
  markdown += `\n---\n\n## ❌ Failed Files (${failed.length})\n\n`
  Object.entries(errorGroups).forEach(([errorType, errorResults]) => {
    markdown += `### ${errorType} (${errorResults.length} files)\n\n`
    markdown += `| # | File Path | Duration | Reason |\n`
    markdown += `|---|-----------|----------|--------|\n`
    errorResults.forEach((result, index) => {
      const relativePath = result.file.replace('/Volumes/MasterData/Project-Sandbox/Figra/', '')
      markdown += `| ${index + 1} | \`${relativePath}\` | ${result.duration.toFixed(2)}ms | ${result.error} |\n`
    })
    markdown += '\n'
  })
  markdown += `---\n\n## 🔍 Manual Validation Checklist\n\n`
  markdown += `### Successful Files\n`
  markdown += `- [ ] Verify all successful files actually have exports/imports\n`
  markdown += `- [ ] Check that duration times are reasonable\n`
  markdown += `- [ ] Confirm export/consumer/connection counts are accurate\n\n`
  markdown += `### Failed Files\n`
  markdown += `- [ ] Verify "No exports" files actually have no export statements\n`
  markdown += `- [ ] Check "No imports" files actually have no import statements\n`
  markdown += `- [ ] Confirm "No dependencies" files have no correlation\n`
  markdown += `- [ ] Validate error messages are accurate\n\n`
  markdown += `### Performance Analysis\n`
  markdown += `- [ ] Check if slowest files have legitimate reasons for being slow\n`
  markdown += `- [ ] Verify fastest files are actually simple files\n`
  markdown += `- [ ] Confirm average duration is representative\n\n`
  markdown += `---\n\n## 📁 File Categories\n\n`
  const srcFiles = results.filter(r => r.file.includes('/src/'))
  const exampleFiles = results.filter(r => r.file.includes('/examples/'))
  markdown += `### Source Files (${srcFiles.length})\n`
  markdown += `- Successful: ${srcFiles.filter(r => r.success).length}\n`
  markdown += `- Failed: ${srcFiles.filter(r => !r.success).length}\n\n`
  markdown += `### Example Files (${exampleFiles.length})\n`
  markdown += `- Successful: ${exampleFiles.filter(r => r.success).length}\n`
  markdown += `- Failed: ${exampleFiles.filter(r => !r.success).length}\n\n`
  markdown += `---\n\n*This file was generated automatically for manual validation of benchmark results.*\n`
  markdown += `*Review each section carefully and check off items as you validate them.*\n`
  writeFileSync('./RESULT.md', markdown)
  console.log('📄 Manual validation file saved to RESULT.md')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmark().catch(console.error)
}

export { runBenchmark, benchmarkFile, BenchmarkResult, BenchmarkStats }
