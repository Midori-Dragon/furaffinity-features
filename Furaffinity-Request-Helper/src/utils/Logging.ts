import { FuraffinityRequests } from '../modules/FuraffinityRequests';

export class Logger {
    constructor() {
        throw new Error('The Logger class is static and cannot be instantiated.');
    }

    public static logMessage(message: string): void {
        if (FuraffinityRequests.logLevel >= 3) {
            console.log(message);
        }
    }

    public static logWarning(message: string): void {
        if (FuraffinityRequests.logLevel >= 2) {
            console.warn(message);
        }
    }

    public static logError(message: string): void {
        if (FuraffinityRequests.logLevel >= 1) {
            console.error(message);
        }
    }

    public static setLogLevel(level: number): void {
        FuraffinityRequests.logLevel = level;
    }
}
