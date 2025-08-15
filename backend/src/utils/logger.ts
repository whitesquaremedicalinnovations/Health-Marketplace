interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${contextStr}`;
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const logContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
    console.error(this.formatMessage(LogLevel.ERROR, message, logContext));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage(LogLevel.INFO, message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  request(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    const logContext = {
      ...context,
      method,
      url,
      statusCode,
      duration
    };
    
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method} ${url} - ${statusCode} (${duration}ms)`;
    
    if (level === LogLevel.ERROR) {
      console.error(this.formatMessage(level, message, logContext));
    } else {
      console.info(this.formatMessage(level, message, logContext));
    }
  }
}

export const logger = new Logger(); 