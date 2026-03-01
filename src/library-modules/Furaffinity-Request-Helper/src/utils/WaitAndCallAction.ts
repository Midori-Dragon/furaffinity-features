import { PercentHelper } from './PercentHelper';

export const DEFAULT_ACTION_DELAY = 100;

export class WaitAndCallAction {
    delay = 10;

    private readonly _action: (percentId?: string | number) => void;
    private _intervalId: number | undefined;
    private _running = false;

    constructor(action: (percentId?: string | number) => void, delay?: number) {
        this._action = action;
        if (delay != null) {
            this.delay = delay;
        }
    }

    start(): number | undefined {
        if (this._action != null && this._running === false) {
            this._running = true;
            this._intervalId = setInterval(() => {
                this._action(PercentHelper.getPercentValue(this._intervalId?.toString()));
            }, this.delay);
            PercentHelper.createPercentValue(this._intervalId.toString());
            return this._intervalId;
        }
    }

    stop(): void {
        if (this._running) {
            this._running = false;
            clearInterval(this._intervalId);
            if (this._intervalId != null) {
                PercentHelper.deletePercentValue(this._intervalId.toString());
            }
        }
    }

    static async callFunctionAsync<T>(fn: (percentId?: string | number) => Promise<T>, action?: (percentId?: string | number) => void, delay?: number): Promise<T> {
        if (action == null) {
            return await fn();
        }
        const waitAndCallAction = new WaitAndCallAction(action, delay);
        const percentId = waitAndCallAction.start();
        const result = await fn(percentId);
        waitAndCallAction.stop();
        return result;
    }

    static callFunction<T>(fn: (percentId?: string | number) => T, action?: (percentId?: string | number) => void, delay?: number): T {
        if (action == null) {
            return fn();
        }
        const waitAndCallAction = new WaitAndCallAction(action, delay);
        const percentId = waitAndCallAction.start();
        const result = fn(percentId);
        waitAndCallAction.stop();
        return result;
    }
}
