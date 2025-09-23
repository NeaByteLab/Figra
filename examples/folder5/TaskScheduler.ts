export interface Task {
  id: string
  name: string
  execute: () => Promise<void> | void
  schedule: string
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
  metadata: Record<string, unknown>
}

export interface SchedulerOptions {
  timezone: string
  maxConcurrentTasks: number
  retryFailedTasks: boolean
  retryAttempts: number
}

export class TaskScheduler {
  private tasks: Map<string, Task> = new Map()
  private runningTasks: Set<string> = new Set()
  private intervalId: NodeJS.Timeout | null = null
  private options: SchedulerOptions

  constructor(options: Partial<SchedulerOptions> = {}) {
    this.options = {
      timezone: 'UTC',
      maxConcurrentTasks: 5,
      retryFailedTasks: true,
      retryAttempts: 3,
      ...options
    }
  }

  addTask(task: Omit<Task, 'id' | 'enabled' | 'lastRun' | 'nextRun' | 'metadata'>): string {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36),
      enabled: true,
      metadata: {}
    }
    this.tasks.set(newTask.id, newTask)
    this.scheduleTask(newTask)
    return newTask.id
  }

  removeTask(taskId: string): boolean {
    return this.tasks.delete(taskId)
  }

  enableTask(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (task) {
      task.enabled = true
      this.scheduleTask(task)
      return true
    }
    return false
  }

  disableTask(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (task) {
      task.enabled = false
      return true
    }
    return false
  }

  start(): void {
    if (this.intervalId) return
    this.intervalId = setInterval(() => {
      this.checkAndRunTasks()
    }, 1000)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId)
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values())
  }

  private scheduleTask(task: Task): void {
    if (!task.enabled) return
    const now = new Date()
    const nextRun = new Date(now.getTime() + 60000)
    task.nextRun = nextRun
  }

  private async checkAndRunTasks(): Promise<void> {
    const now = new Date()
    const readyTasks = Array.from(this.tasks.values())
      .filter(task => 
        task.enabled && 
        task.nextRun && 
        task.nextRun <= now &&
        !this.runningTasks.has(task.id)
      )
    for (const task of readyTasks) {
      if (this.runningTasks.size >= this.options.maxConcurrentTasks) {
        break
      }
      this.runTask(task)
    }
  }

  private async runTask(task: Task): Promise<void> {
    this.runningTasks.add(task.id)
    task.lastRun = new Date()
    try {
      await task.execute()
      this.scheduleTask(task)
    } catch (error) {
      console.error(`Task ${task.name} failed:`, error)
      if (this.options.retryFailedTasks) {
        this.scheduleTask(task)
      } else {
        this.runningTasks.delete(task.id)
      }
    } finally {
      this.runningTasks.delete(task.id)
    }
  }
}

export function createTaskScheduler(options?: Partial<SchedulerOptions>): TaskScheduler {
  return new TaskScheduler(options)
}
