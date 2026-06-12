import { Semaphore } from '../../../GlobalUtils/src/Semaphore';

export const DEFAULT_MAX_CONCURRENCY = 2;
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_RETRY_DELAY = 1000;

export class RequestContext {
    readonly semaphore: Semaphore;
    maxRetries: number;
    retryDelay: number;

    constructor(maxConcurrency = DEFAULT_MAX_CONCURRENCY, maxRetries = DEFAULT_MAX_RETRIES, retryDelay = DEFAULT_RETRY_DELAY) {
        this.semaphore = new Semaphore(maxConcurrency);
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }
}
