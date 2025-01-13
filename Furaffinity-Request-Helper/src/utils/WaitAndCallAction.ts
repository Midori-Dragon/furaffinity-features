import { PercentHelper } from '../utils/PercentHelper';

export class WaitAndCallAction {
    public delay = 10;

    private readonly _action: (percentId?: number) => void;
    private _intervalId: number | undefined;
    private _running = false;

    constructor(action: (percentId?: string | number) => void, delay?: number) {
        this._action = action;
        if (delay != null) {
            this.delay = delay;
        }
    }

    public start(): number | undefined {
        if (this._action != null && this._running === false) {
            this._running = true;
            // Start the interval
            this._intervalId = setInterval(() => {
                // Call the action with the percent value
                this._action(PercentHelper.getPercentValue(this._intervalId?.toString()));
            }, this.delay);
            // If usePercent is true, create a new percent value
            PercentHelper.createPercentValue(this._intervalId.toString());
            // Return the interval ID
            return this._intervalId;
        }
    }

    public stop(): void {
        if (this._running) {
            this._running = false;
            // Stop the interval
            clearInterval(this._intervalId);

            // If usePercent is true, delete the percent value
            if (this._intervalId != null) {
                PercentHelper.deletePercentValue(this._intervalId.toString());
            }
        }
    }

    public static async callFunctionAsync<T extends (...args: any[]) => any>(functionToCall: T, params: Parameters<T>, action?: (percentId?: string | number) => void, delay?: number, usePercent = false): Promise<ReturnType<T>> {
        if (action == null) {
            return await functionToCall(...params);
        }
        
        const waitAndCallAction = new WaitAndCallAction(action, delay);
        // Start the interval and save the percentId if usePercent is true
        const percentId = waitAndCallAction.start();
        // If usePercent is true, add the percentId to the parameters
        if (usePercent) {
            params.push(percentId);
        }
        // Call the function with the parameters
        const result = await functionToCall(...params);
        // Stop the interval and clean up
        waitAndCallAction.stop();
        return result;
    }

    public static callFunction<T extends (...args: any[]) => any>(functionToCall: T, params: Parameters<T>, action?: (percentId?: string | number) => void, delay?: number, usePercent = false): ReturnType<T> {
        if (action == null) {
            return functionToCall(...params);
        }
        
        const waitAndCallAction = new WaitAndCallAction(action, delay);
        const percentId = waitAndCallAction.start();
        // If usePercent is true, add the percentId to the parameters
        if (usePercent) {
            params.push(percentId);
        }
        // Call the function with the parameters
        const result = functionToCall(...params);
        // Stop the interval and clean up
        waitAndCallAction.stop();
        return result;
    }
}
