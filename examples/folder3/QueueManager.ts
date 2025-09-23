export interface QueueItem<T = unknown> {
  id: string
  data: T
  priority: number
  createdAt: Date
  attempts: number
}

export type QueueOptions = {
  maxRetries: number
  retryDelay: number
  concurrency: number
}

export class QueueManager<T = unknown> {
  private queue: QueueItem<T>[] = []
  private processing = false
  private options: QueueOptions

  constructor(options: Partial<QueueOptions> = {}) {
    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      concurrency: 1,
      ...options
    }
  }

  enqueue(data: T, priority = 0): string {
    const item: QueueItem<T> = {
      id: Math.random().toString(36),
      data,
      priority,
      createdAt: new Date(),
      attempts: 0
    }
    this.queue.push(item)
    this.queue.sort((a, b) => b.priority - a.priority)
    if (!this.processing) {
      this.process()
    }
    return item.id
  }

  dequeue(): QueueItem<T> | null {
    return this.queue.shift() || null
  }

  peek(): QueueItem<T> | null {
    return this.queue[0] || null
  }

  size(): number {
    return this.queue.length
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }

  clear(): void {
    this.queue = []
  }

  private async process(): Promise<void> {
    this.processing = true
    while (!this.isEmpty()) {
      const item = this.dequeue()
      if (!item) break

      try {
        await this.processItem(item)
      } catch (error) {
        await this.handleError(item, error)
      }
    }

    this.processing = false
  }

  private async processItem(item: QueueItem<T>): Promise<void> {
    console.log(`Processing item ${item.id}:`, item.data)
  }

  private async handleError(item: QueueItem<T>, error: unknown): Promise<void> {
    item.attempts++
    if (item.attempts < this.options.maxRetries) {
      console.log(`Retrying item ${item.id} (attempt ${item.attempts})`)
      setTimeout(() => {
        this.queue.unshift(item)
        if (!this.processing) {
          this.process()
        }
      }, this.options.retryDelay)
    } else {
      console.error(`Failed to process item ${item.id} after ${item.attempts} attempts:`, error)
    }
  }
}

export function createQueueManager<T>(options?: Partial<QueueOptions>): QueueManager<T> {
  return new QueueManager<T>(options)
}
