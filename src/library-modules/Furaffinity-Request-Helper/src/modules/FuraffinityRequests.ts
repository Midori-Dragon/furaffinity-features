import { Semaphore } from '../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../utils/WaitAndCallAction';
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

    private _semaphore: Semaphore;
    private static _useHttps = window.location.protocol.includes('https');
    private static _httpsString = window.location.protocol.trimEnd(':') + '://';
    private static _domain = window.location.hostname;

    constructor(maxAmountRequests = 2) {
        this._semaphore = new Semaphore(maxAmountRequests);
        this.UserRequests = new UserRequests(this._semaphore);
        this.PersonalUserRequests = new PersonalUserRequests(this._semaphore);
        this.SubmissionRequests = new SubmissionRequests(this._semaphore);
    }

    set maxAmountRequests(value: number) {
        if (this._semaphore.maxConcurrency === value) {
            return;
        }
        this._semaphore.maxConcurrency = value;
    }
    get maxAmountRequests(): number {
        return this._semaphore.maxConcurrency;
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

    static async getHTML(url: string, semaphore: Semaphore, signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        if (url == null || url === '') {
            Logger.logError('No url given for GET request');
            throw new Error('No url given for GET request');
        }
        return await WaitAndCallAction.callFunctionAsync(() => getHTMLLocal(url, semaphore, signal), action, delay);
    }

    static async postHTML(url: string, payload: string[][] | Record<string, string> | string | URLSearchParams, semaphore: Semaphore, signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        if (url == null || url === '') {
            Logger.logError('No url given for POST request');
            throw new Error('No url given for POST request');
        }
        return await WaitAndCallAction.callFunctionAsync(() => postHTMLLocal(url, payload, semaphore, signal), action, delay);
    }
}

async function getHTMLLocal(url: string, semaphore: Semaphore, signal?: AbortSignal): Promise<Document | undefined> {
    Logger.logInfo(`Requesting '${url}'`);
    const semaphoreActive = semaphore != null && semaphore.maxConcurrency > 0;
    if (semaphoreActive) {
        // Acquire a slot in the semaphore to ensure that the maximum concurrency is not exceeded.
        await semaphore.acquire();
    }
    try {
        // Send the GET request and retrieve the HTML document.
        const response = await fetch(url, { signal });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status} for: ${url}`);
        }
        const html = await response.text();
        // Parse the HTML document using a DOMParser.
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc;
    } catch (error: any) {
        // Enrich network-level errors (e.g. "Failed to fetch") with the URL for better diagnostics.
        const message = error instanceof Error ? error.message : String(error);
        const enriched = new Error(`${message} (URL: ${url})`);
        if (!(signal?.aborted ?? false)) {
            Logger.logError(enriched);
        }
        throw enriched;
    } finally {
        // Release the slot in the semaphore.
        if (semaphoreActive) {
            semaphore.release();
        }
    }
}

async function postHTMLLocal(url: string, payload: string[][] | Record<string, string> | string | URLSearchParams, semaphore: Semaphore, signal?: AbortSignal): Promise<Document | undefined> {
    // Check if the semaphore is active and acquire it if necessary
    const semaphoreActive = semaphore != null && semaphore.maxConcurrency > 0;
    if (semaphoreActive) {
        await semaphore.acquire();
    }
    try {
        // Send a POST request with the given payload
        const response = await fetch(url, {
            method: 'POST',
            body: new URLSearchParams(payload).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            signal,
        });

        // Check if the response is not ok and throw an error
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status} for: ${url}`);
        }

        const responseData = await response.text();
        // Parse the response data as an HTML document
        const parser = new DOMParser();
        const doc = parser.parseFromString(responseData, 'text/html');
        return doc;
    } catch (error: any) {
        // Enrich network-level errors (e.g. "Failed to fetch") with the URL for better diagnostics.
        const message = error instanceof Error ? error.message : String(error);
        const enriched = new Error(`${message} (URL: ${url})`);
        if (!(signal?.aborted ?? false)) {
            Logger.logError(enriched);
        }
        throw enriched;
    } finally {
        // Release the semaphore if it was acquired
        if (semaphoreActive) {
            semaphore.release();
        }
    }
}
