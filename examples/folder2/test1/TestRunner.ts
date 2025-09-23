export interface TestCase {
  name: string
  description: string
  test: () => Promise<boolean> | boolean
  timeout?: number
  retries?: number
}

export interface TestSuite {
  name: string
  tests: TestCase[]
  beforeAll?: () => Promise<void> | void
  afterAll?: () => Promise<void> | void
  beforeEach?: () => Promise<void> | void
  afterEach?: () => Promise<void> | void
}

export interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
  retries: number
}

export interface TestReport {
  suite: string
  total: number
  passed: number
  failed: number
  duration: number
  results: TestResult[]
}

export class TestRunner {
  private suites: Map<string, TestSuite> = new Map()
  private reports: TestReport[] = []

  addSuite(suite: TestSuite): void {
    this.suites.set(suite.name, suite)
  }

  removeSuite(suiteName: string): boolean {
    return this.suites.delete(suiteName)
  }

  async runSuite(suiteName: string): Promise<TestReport> {
    const suite = this.suites.get(suiteName)
    if (!suite) {
      throw new Error(`Test suite '${suiteName}' not found`)
    }

    const startTime = Date.now()
    const results: TestResult[] = []

    try {
      if (suite.beforeAll) {
        await suite.beforeAll()
      }

      for (const testCase of suite.tests) {
        const result = await this.runTest(testCase, suite)
        results.push(result)
      }

      if (suite.afterAll) {
        await suite.afterAll()
      }
    } catch (error) {
      console.error(`Suite '${suiteName}' setup/teardown failed:`, error)
    }

    const duration = Date.now() - startTime
    const passed = results.filter(r => r.passed).length
    const failed = results.length - passed

    const report: TestReport = {
      suite: suiteName,
      total: results.length,
      passed,
      failed,
      duration,
      results
    }

    this.reports.push(report)
    return report
  }

  async runAllSuites(): Promise<TestReport[]> {
    const reports: TestReport[] = []
    
    for (const suiteName of this.suites.keys()) {
      const report = await this.runSuite(suiteName)
      reports.push(report)
    }

    return reports
  }

  private async runTest(testCase: TestCase, suite: TestSuite): Promise<TestResult> {
    const startTime = Date.now()
    let lastError: string | undefined
    const maxRetries = testCase.retries || 0

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (suite.beforeEach) {
          await suite.beforeEach()
        }

        const timeout = testCase.timeout || 5000
        const testPromise = Promise.resolve(testCase.test())
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Test timeout')), timeout)
        })

        const result = await Promise.race([testPromise, timeoutPromise])
        
        if (suite.afterEach) {
          await suite.afterEach()
        }

        return {
          name: testCase.name,
          passed: Boolean(result),
          duration: Date.now() - startTime,
          retries: attempt
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
        
        if (suite.afterEach) {
          try {
            await suite.afterEach()
          } catch (afterError) {
            console.error('AfterEach hook failed:', afterError)
          }
        }

        if (attempt === maxRetries) {
          break
        }
      }
    }

    return {
      name: testCase.name,
      passed: false,
      duration: Date.now() - startTime,
      error: lastError,
      retries: maxRetries
    }
  }

  getReports(): TestReport[] {
    return [...this.reports]
  }

  getLastReport(): TestReport | undefined {
    return this.reports[this.reports.length - 1]
  }

  clearReports(): void {
    this.reports = []
  }

  getSuiteNames(): string[] {
    return Array.from(this.suites.keys())
  }
}

export function createTestRunner(): TestRunner {
  return new TestRunner()
}
