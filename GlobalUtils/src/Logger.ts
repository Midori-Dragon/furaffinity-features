export enum LogLevel {
    Error = 1,
    Warning = 2,
    Info = 3,
}

export class Logger {
    private static log(logLevel = LogLevel.Warning, ...args: any[]): void {
        if (logLevel > window.__FF_GLOBAL_LOG_LEVEL__) {
            return;
        }

        switch (logLevel) {
        case LogLevel.Error:
            console.error(...args);
            break;
        case LogLevel.Warning:
            console.warn(...args);
            break;
        case LogLevel.Info:
            console.log(...args);
            break;
        }
    }

    static setLogLevel(logLevel: LogLevel | number): void {
        window.__FF_GLOBAL_LOG_LEVEL__ = logLevel;
    }

    static logError(...args: any[]): void {
        Logger.log(LogLevel.Error, ...args);
    }

    static logWarning(...args: any[]): void {
        Logger.log(LogLevel.Warning, ...args);
    }

    static logInfo(...args: any[]): void {
        Logger.log(LogLevel.Info, ...args);
    }
}
