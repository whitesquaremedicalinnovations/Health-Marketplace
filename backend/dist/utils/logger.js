export var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
class Logger {
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? JSON.stringify(context) : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message} ${contextStr}`;
    }
    error(message, error, context) {
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
    warn(message, context) {
        console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
    info(message, context) {
        console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
    debug(message, context) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
        }
    }
    request(method, url, statusCode, duration, context) {
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
        }
        else {
            console.info(this.formatMessage(level, message, logContext));
        }
    }
}
export const logger = new Logger();
