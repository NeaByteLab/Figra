export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, unknown>
}

export class Logger {
  private logs: LogEntry[] = []
  private minLevel: LogLevel = LogLevel.INFO

  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(level)) {
      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date(),
        context
      }
      this.logs.push(entry)
      console.log(`[${level.toUpperCase()}] ${message}`, context || '')
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context)
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }
}

export const defaultLogger = new Logger()
