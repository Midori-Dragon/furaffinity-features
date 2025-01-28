import { Semaphore } from '../utils/Semaphore';
import { WaitAndCallAction } from '../utils/WaitAndCallAction';
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
    private static _useHttps = true;
    private static _httpsString = 'https://';
    private static _domain = 'www.furaffinity.net';

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

    static async getHTML(url: string, semaphore: Semaphore, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        if (url == null || url === '') {
            Logger.logError('No url given');
            return;
        }
        return await WaitAndCallAction.callFunctionAsync(getHTMLLocal, [url, semaphore], action, delay);
    }

    static async postHTML(url: string, payload: string[][] | Record<string, string> | string | URLSearchParams, semaphore: Semaphore, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        if (url == null || url === '') {
            Logger.logError('No url given');
            return;
        }
        return await WaitAndCallAction.callFunctionAsync(postHTMLLocal, [url, payload, semaphore], action, delay);
    }
}

async function getHTMLLocal(url: string, semaphore: Semaphore): Promise<Document | undefined> {
    Logger.logInfo(`Requesting '${url}'`);
    const semaphoreActive = semaphore != null && semaphore.maxConcurrency > 0;
    if (semaphoreActive) {
        // Acquire a slot in the semaphore to ensure that the maximum concurrency is not exceeded.
        await semaphore.acquire();
    }
    try {
        // Send the GET request and retrieve the HTML document.
        const response = await fetch(url);
        const html = await response.text();
        // Parse the HTML document using a DOMParser.
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc;
    } catch (error: any) {
        // Log any errors that occurred during the request.
        Logger.logError(error);
    } finally {
        // Release the slot in the semaphore.
        if (semaphoreActive) {
            semaphore.release();
        }
    }
}

async function postHTMLLocal(url: string, payload: string[][] | Record<string, string> | string | URLSearchParams, semaphore: Semaphore): Promise<Document | undefined> {
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
        });

        // Check if the response is not ok and log an error if so
        if (!response.ok) {
            Logger.logError(`HTTP error! Status: ${response.status}`);
            return;
        }

        const responseData = await response.text();
        try {
            // Parse the response data as an HTML document
            const parser = new DOMParser();
            const doc = parser.parseFromString(responseData, 'text/html');
            return doc;
        } catch {
            // Log the response data as if parsing fails
            Logger.logError(`Failed to parse response data as HTML: ${responseData}`);
        }
    } catch (error: any) {
        // Log any errors that occurred during the request
        Logger.logError(error);
    } finally {
        // Release the semaphore if it was acquired
        if (semaphoreActive) {
            semaphore.release();
        }
    }
}
