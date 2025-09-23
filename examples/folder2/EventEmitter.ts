export type EventCallback<T = unknown> = (data: T) => void

export interface EventMap {
  [key: string]: unknown
}

export class EventEmitter<T extends EventMap = EventMap> {
  private listeners = new Map<keyof T, Set<EventCallback>>()

  on<K extends keyof T>(event: K, callback: EventCallback<T[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback as EventCallback)
  }

  off<K extends keyof T>(event: K, callback: EventCallback<T[K]>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback as EventCallback)
    }
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error)
        }
      })
    }
  }

  once<K extends keyof T>(event: K, callback: EventCallback<T[K]>): void {
    const onceCallback = (data: T[K]) => {
      callback(data)
      this.off(event, onceCallback as EventCallback<T[K]>)
    }
    this.on(event, onceCallback as EventCallback<T[K]>)
  }

  removeAllListeners<K extends keyof T>(event?: K): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  listenerCount<K extends keyof T>(event: K): number {
    return this.listeners.get(event)?.size || 0
  }
}

export function createEventEmitter<T extends EventMap = EventMap>(): EventEmitter<T> {
  return new EventEmitter<T>()
}
