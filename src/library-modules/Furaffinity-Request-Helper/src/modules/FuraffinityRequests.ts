import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../utils/WaitAndCallAction';
import { RequestContext, DEFAULT_MAX_CONCURRENCY, DEFAULT_MAX_RETRIES, DEFAULT_RETRY_DELAY } from '../utils/RequestContext';
import { globalRateLimiter } from '../utils/GlobalRateLimiter';
import { UserRequests } from './UserRequests';
import { PersonalUserRequests } from './PersonalUserRequests';
import { SubmissionRequests } from './SubmissionRequests';
import { BrowseOptions } from '../components/SearchRequests/Browse';
import { SearchOptions } from '../components/SearchRequests/Search';
import { Logger } from '../../../GlobalUtils/src/Logger';

export class FuraffinityRequests {
    UserRequests: UserRequests;
    PersonalUserRequests: PersonalUserRequests;
    SubmissionRequests: SubmissionRequests;
    static logLevel = 1;
    static Types = {
        BrowseOptions: BrowseOptions,
        SearchOptions: SearchOptions
    };

    private _context: RequestContext;
    private static _useHttps = window.location.protocol.includes('https');
    private static _httpsString = window.location.protocol.trimEnd(':') + '://';
    private static _domain = window.location.hostname;

    constructor(maxAmountRequests = DEFAULT_MAX_CONCURRENCY, maxRetries = DEFAULT_MAX_RETRIES, retryDelay = DEFAULT_RETRY_DELAY) {
        this._context = new RequestContext(maxAmountRequests, maxRetries, retryDelay);
        this.UserRequests = new UserRequests(this._context);
        this.PersonalUserRequests = new PersonalUserRequests(this._context);
        this.SubmissionRequests = new SubmissionRequests(this._context);
    }

    set maxAmountRequests(value: number) {
        if (this._context.semaphore.maxConcurrency === value) {
            return;
        }
        this._context.semaphore.maxConcurrency = value;
    }
    get maxAmountRequests(): number {
        return this._context.semaphore.maxConcurrency;
    }

    set maxRetries(value: number) {
        this._context.maxRetries = value;
    }
    get maxRetries(): number {
        return this._context.maxRetries;
    }

    set retryDelay(value: number) {
        this._context.retryDelay = value;
    }
    get retryDelay(): number {
        return this._context.retryDelay;
    }

    static set requestInterval(value: number) {
        globalRateLimiter.intervalMs = value;
    }
    static get requestInterval(): number {
        return globalRateLimiter.intervalMs;
    }

    static set useHttps(value: boolean) {
        if (FuraffinityRequests._useHttps === value) {
            return;
        }
        FuraffinityRequests._useHttps = value;
        if (value) {
            FuraffinityRequests._httpsString = 'https://';
        } else {
            FuraffinityRequests._httpsString = 'http://';
        }
    }
    static get useHttps(): boolean {
        return FuraffinityRequests._useHttps;
    }

    static get fullUrl(): string {
        return FuraffinityRequests._httpsString + FuraffinityRequests._domain;
    }

    static async getHTML(url: string, context: RequestContext, signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        if (url == null || url === '') {
            Logger.logError('No url given for GET request');
            throw new Error('No url given for GET request');
        }
        return await WaitAndCallAction.callFunctionAsync(() => getHTMLLocal(url, context, signal), action, delay);
    }

    static async postHTML(url: string, payload: string[][] | Record<string, string> | string | URLSearchParams, context: RequestContext, signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        if (url == null || url === '') {
            Logger.logError('No url given for POST request');
            throw new Error('No url given for POST request');
        }
        return await WaitAndCallAction.callFunctionAsync(() => postHTMLLocal(url, payload, context, signal), action, delay);
    }
}

async function getHTMLLocal(url: string, context: RequestContext, signal?: AbortSignal): Promise<Document | undefined> {
    Logger.logInfo(`Requesting '${url}'`);
    const { semaphore } = context;
    const semaphoreActive = semaphore != null && semaphore.maxConcurrency > 0;
    let attempt = 0;
    let holdSlot = false;

    while (true) {
        if (semaphoreActive && !holdSlot) {
            await semaphore.acquire();
        }
        holdSlot = false;
        let sleepMs: number | null = null;
        let httpStatus = 0;
        let shouldHold = false;
        try {
            await globalRateLimiter.acquire();
            const response = await fetch(url, { signal });
            httpStatus = response.status;
            if (!response.ok) {
                throw new Error(`HTTP error ${httpStatus} for: ${url}`);
            }
            const html = await response.text();
            const parser = new DOMParser();
            return parser.parseFromString(html, 'text/html');
        } catch (error: any) {
            const message = error instanceof Error ? error.message : String(error);
            const enriched = new Error(`${message} (URL: ${url})`);
            if (signal?.aborted) {
                throw enriched;
            }
            const is429 = httpStatus === 429;
            const effectiveMax = is429 ? context.maxRetries * 2 : context.maxRetries;
            if (attempt >= effectiveMax) {
                Logger.logError(enriched);
                throw enriched;
            }
            sleepMs = is429 ? context.retryDelay * (attempt + 1) : context.retryDelay;
            Logger.logWarning(`Retrying GET '${url}' (attempt ${attempt + 1}/${effectiveMax}) in ${sleepMs}ms`);
            attempt++;
            shouldHold = is429;
        } finally {
            if (semaphoreActive && !shouldHold) {
                semaphore.release();
            }
        }
        holdSlot = shouldHold;
        await new Promise<void>(resolve => setTimeout(resolve, sleepMs!));
    }
}

async function postHTMLLocal(url: string, payload: string[][] | Record<string, string> | string | URLSearchParams, context: RequestContext, signal?: AbortSignal): Promise<Document | undefined> {
    const { semaphore } = context;
    const semaphoreActive = semaphore != null && semaphore.maxConcurrency > 0;
    let attempt = 0;
    let holdSlot = false;

    while (true) {
        if (semaphoreActive && !holdSlot) {
            await semaphore.acquire();
        }
        holdSlot = false;
        let sleepMs: number | null = null;
        let httpStatus = 0;
        let shouldHold = false;
        try {
            await globalRateLimiter.acquire();
            const response = await fetch(url, {
                method: 'POST',
                body: new URLSearchParams(payload).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                signal,
            });
            httpStatus = response.status;
            if (!response.ok) {
                throw new Error(`HTTP error ${httpStatus} for: ${url}`);
            }
            const responseData = await response.text();
            const parser = new DOMParser();
            return parser.parseFromString(responseData, 'text/html');
        } catch (error: any) {
            const message = error instanceof Error ? error.message : String(error);
            const enriched = new Error(`${message} (URL: ${url})`);
            if (signal?.aborted) {
                throw enriched;
            }
            const is429 = httpStatus === 429;
            const effectiveMax = is429 ? context.maxRetries * 2 : context.maxRetries;
            if (attempt >= effectiveMax) {
                Logger.logError(enriched);
                throw enriched;
            }
            sleepMs = is429 ? context.retryDelay * (attempt + 1) : context.retryDelay;
            Logger.logWarning(`Retrying POST '${url}' (attempt ${attempt + 1}/${effectiveMax}) in ${sleepMs}ms`);
            attempt++;
            shouldHold = is429;
        } finally {
            if (semaphoreActive && !shouldHold) {
                semaphore.release();
            }
        }
        holdSlot = shouldHold;
        await new Promise<void>(resolve => setTimeout(resolve, sleepMs!));
    }
}
