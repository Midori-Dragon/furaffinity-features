export class Semaphore {
    public maxConcurrency: number;
    public currentConcurrency: number;
    public waitingQueue: (() => void)[];
    
    constructor(maxConcurrency: number) {
        this.maxConcurrency = maxConcurrency;
        this.currentConcurrency = 0;
        this.waitingQueue = [];
    }

    public acquire(): Promise<void> {
        return new Promise((resolve) => {
            if (this.currentConcurrency < this.maxConcurrency) {
                // There is room, increment the current concurrency and resolve the promise
                this.currentConcurrency++;
                resolve();
            } else {
                // The semaphore is full, add the resolve function to the waiting queue
                this.waitingQueue.push(resolve);
            }
        });
    }

    public release(): void {
        if (this.waitingQueue.length > 0) {
            // There are waiting tasks, let the next one run
            const nextResolve = this.waitingQueue.shift();
            if (nextResolve != null) {
                nextResolve();
            }
        } else {
            // No waiting tasks, decrement the current concurrency level
            this.currentConcurrency--;
        }
    }
}
