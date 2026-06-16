export class RateLimiter {
    intervalMs: number;
    private nextAvailableTime: number;

    constructor(intervalMs: number) {
        this.intervalMs = intervalMs;
        this.nextAvailableTime = 0;
    }

    acquire(): Promise<void> {
        const now = Date.now();
        const scheduledTime = Math.max(now, this.nextAvailableTime);
        this.nextAvailableTime = scheduledTime + this.intervalMs;

        const delay = scheduledTime - now;
        if (delay <= 0) {
            return Promise.resolve();
        }
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
}
