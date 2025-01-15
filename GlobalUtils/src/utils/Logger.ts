export enum LogLevel {
    Error = 1,
    Warning = 2,
    Info = 3,
}

export class Logger {
    private static logLevel = LogLevel.Error;

    private static log(logLevel = 3, ...args: any[]): void {
        if (logLevel > Logger.logLevel) {
            return;
        }

        switch (logLevel) {
        case 1:
            console.error(...args);
            break;
        case 2:
            console.warn(...args);
            break;
        case 3:
            console.log(...args);
            break;
        }
    }

    static setLogLevel(logLevel: LogLevel | number): void {
        Logger.logLevel = logLevel;
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
