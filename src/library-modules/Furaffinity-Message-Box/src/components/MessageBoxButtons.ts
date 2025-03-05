/**
 * Specifies the buttons that are displayed on a message box.
 * Similar to System.Windows.Forms.MessageBoxButtons in C#.
 */
export enum MessageBoxButtons {
    /**
     * The message box contains an OK button.
     */
    OK = 0,
    
    /**
     * The message box contains OK and Cancel buttons.
     */
    OKCancel = 1,
    
    /**
     * The message box contains Abort, Retry, and Ignore buttons.
     */
    AbortRetryIgnore = 2,
    
    /**
     * The message box contains Yes, No, and Cancel buttons.
     */
    YesNoCancel = 3,
    
    /**
     * The message box contains Yes and No buttons.
     */
    YesNo = 4,
    
    /**
     * The message box contains Retry and Cancel buttons.
     */
    RetryCancel = 5
}
