declare global {
    interface Window {
        __FF_GLOBAL_LOG_LEVEL__: LogLevel;
    }
}

export enum LogLevel {
    Error = 1,
    Warning = 2,
    Info = 3,
}

export class Logger {
    private static get _logLevel(): LogLevel {
        window.__FF_GLOBAL_LOG_LEVEL__ ??= LogLevel.Error;
        return window.__FF_GLOBAL_LOG_LEVEL__;
    }

    static setLogLevel(logLevel: LogLevel | number): void {
        window.__FF_GLOBAL_LOG_LEVEL__ = logLevel;
    }

    static get logError(): (...args: any[]) => void {
        return LogLevel.Error <= Logger._logLevel ? console.error.bind(console) : (): void => { /* noop */ };
    }

    static get logWarning(): (...args: any[]) => void {
        return LogLevel.Warning <= Logger._logLevel ? console.warn.bind(console) : (): void => { /* noop */ };
    }

    static get logInfo(): (...args: any[]) => void {
        return LogLevel.Info <= Logger._logLevel ? console.log.bind(console) : (): void => { /* noop */ };
    }
}
