export interface Metric {
  name: string
  value: number
  timestamp: Date
  tags: Record<string, string>
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
}

export interface MetricConfig {
  name: string
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
  description?: string
  labels?: string[]
}

export type MetricValue = number | { value: number; labels?: Record<string, string> }

export class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map()
  private configs: Map<string, MetricConfig> = new Map()
  private enabled: boolean = true

  register(config: MetricConfig): void {
    this.configs.set(config.name, config)
  }

  record(name: string, value: MetricValue, tags: Record<string, string> = {}): void {
    if (!this.enabled) return
    const config = this.configs.get(name)
    if (!config) {
      console.warn(`Metric ${name} not registered`)
      return
    }
    const metricValue = typeof value === 'number' ? value : value.value
    const metricTags = { ...tags, ...(typeof value === 'object' ? value.labels : {}) }
    const metric: Metric = {
      name,
      value: metricValue,
      timestamp: new Date(),
      tags: metricTags,
      type: config.type
    }
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(metric)
  }

  increment(name: string, value = 1, tags: Record<string, string> = {}): void {
    this.record(name, value, tags)
  }

  decrement(name: string, value = 1, tags: Record<string, string> = {}): void {
    this.record(name, -value, tags)
  }

  set(name: string, value: number, tags: Record<string, string> = {}): void {
    this.record(name, value, tags)
  }

  getMetric(name: string): Metric[] {
    return this.metrics.get(name) || []
  }

  getMetricSummary(name: string): {
    count: number
    sum: number
    average: number
    min: number
    max: number
    latest: Metric | null
  } {
    const metrics = this.getMetric(name)
    if (metrics.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        latest: null
      }
    }
    const values = metrics.map(m => m.value)
    const sum = values.reduce((a, b) => a + b, 0)
    return {
      count: metrics.length,
      sum,
      average: sum / metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: metrics[metrics.length - 1]
    }
  }

  getAllMetrics(): Map<string, Metric[]> {
    return new Map(this.metrics)
  }

  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }

  enable(): void {
    this.enabled = true
  }

  disable(): void {
    this.enabled = false
  }

  export(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [name, metrics] of this.metrics) {
      result[name] = {
        config: this.configs.get(name),
        summary: this.getMetricSummary(name),
        metrics: metrics.slice(-100)
      }
    }
    return result
  }
}

export function createMetricsCollector(): MetricsCollector {
  return new MetricsCollector()
}
