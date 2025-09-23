export interface DataItem {
  id: string
  value: number
  metadata: Record<string, unknown>
}

export type ProcessingOptions = {
  batchSize: number
  timeout: number
  retries: number
}

export class DataProcessor {
  private data: DataItem[] = []
  private options: ProcessingOptions

  constructor(options: Partial<ProcessingOptions> = {}) {
    this.options = {
      batchSize: 100,
      timeout: 5000,
      retries: 3,
      ...options
    }
  }

  addData(item: Omit<DataItem, 'id'>): DataItem {
    const newItem: DataItem = {
      id: Math.random().toString(36),
      value: item.value,
      metadata: item.metadata
    }
    this.data.push(newItem)
    return newItem
  }

  processData(): Promise<DataItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const processed = this.data.map(item => ({
          ...item,
          value: item.value * 2
        }))
        resolve(processed)
      }, this.options.timeout)
    })
  }

  getDataCount(): number {
    return this.data.length
  }
}

export function createDataProcessor(options?: Partial<ProcessingOptions>): DataProcessor {
  return new DataProcessor(options)
}

export const PROCESSING_CONSTANTS = {
  DEFAULT_BATCH_SIZE: 100,
  DEFAULT_TIMEOUT: 5000,
  MAX_RETRIES: 5
} as const
