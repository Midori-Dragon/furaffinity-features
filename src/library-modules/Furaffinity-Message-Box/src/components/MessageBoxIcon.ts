/**
 * Specifies the icon that is displayed on a message box.
 * Similar to System.Windows.Forms.MessageBoxIcon in C#.
 */
export enum MessageBoxIcon {
    /**
     * No icon is displayed.
     */
    None = 0,
    
    /**
     * An error icon is displayed on the message box.
     */
    Error = 16,
    
    /**
     * A warning icon is displayed on the message box.
     */
    Warning = 48,
    
    /**
     * An information icon is displayed on the message box.
     */
    Information = 64,
    
    /**
     * A question mark icon is displayed on the message box.
     */
    Question = 32
}
