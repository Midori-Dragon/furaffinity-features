import { MessageBoxButtons } from '../components/MessageBoxButtons';
import { MessageBoxIcon } from '../components/MessageBoxIcon';
import { DialogResult } from '../components/DialogResult';
import { MessageBoxIcons } from '../components/MessageBoxIcons';
import { MessageBoxThemes } from '../components/MessageBoxThemes';
import '../styles/Style.css';
import string from '../../../GlobalUtils/src/string';

export class MessageBox {
    private static overlay: HTMLDivElement | null = null;
    private static container: HTMLDivElement | null = null;
    private static result: DialogResult = DialogResult.None;
    private static resolvePromise: ((value: DialogResult) => void) | null = null;
    private static currentTheme: MessageBoxThemes = MessageBoxThemes.Light;
    
    /**
     * Gets the current theme.
     * @returns The current theme.
     */
    public static getTheme(): MessageBoxThemes {
        return this.currentTheme;
    }

    /**
     * Shows a message box with the specified text, caption, buttons, and icon.
     * @param text The text to display in the message box.
     * @param caption The text to display in the title bar of the message box.
     * @param buttons One of the MessageBoxButtons values that specifies which buttons to display in the message box.
     * @param icon One of the MessageBoxIcon values that specifies which icon to display in the message box.
     * @returns A DialogResult value that indicates which button was clicked.
     */
    public static async show(text: string, caption = '', buttons: MessageBoxButtons = MessageBoxButtons.OK, icon: MessageBoxIcon = MessageBoxIcon.None): Promise<DialogResult> {       
        // Create a promise that will be resolved when a button is clicked
        return new Promise<DialogResult>((resolve) => {
            this.resolvePromise = resolve;
            this.createMessageBox(text, caption, buttons, icon);
        });
    }

    /**
     * Creates the message box elements and adds them to the DOM.
     */
    private static createMessageBox(text: string, caption: string, buttons: MessageBoxButtons, icon: MessageBoxIcon): void {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'message-box-overlay';
        
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'message-box-container';
        
        // Create header (icon + title)
        const header = document.createElement('div');
        header.className = 'message-box-header';
        
        // Add icon if specified
        if (icon !== MessageBoxIcon.None) {
            const iconContainer = document.createElement('div');
            iconContainer.className = 'message-box-icon-container';
            iconContainer.innerHTML = MessageBoxIcons.getIconSvg(icon);
            header.appendChild(iconContainer);
        }
        
        // Add title if specified
        if (!string.isNullOrWhitespace(caption)) {
            const title = document.createElement('h3');
            title.className = 'message-box-title';
            title.textContent = caption;
            header.appendChild(title);
        }
        
        // Add header to container if it has children
        if (header.children.length !== 0) {
            this.container.appendChild(header);
        }
        
        // Add content
        const content = document.createElement('div');
        content.className = 'message-box-content';
        content.textContent = text;
        this.container.appendChild(content);
        
        // Add buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'message-box-button-container';
        
        // Add appropriate buttons based on the MessageBoxButtons enum
        this.addButtons(buttonContainer, buttons);
        
        this.container.appendChild(buttonContainer);
        this.overlay.appendChild(this.container);
        
        // Add to DOM
        document.body.appendChild(this.overlay);
    }

    /**
     * Adds the appropriate buttons to the message box based on the MessageBoxButtons enum.
     */
    private static addButtons(buttonContainer: HTMLDivElement, buttons: MessageBoxButtons): void {
        switch (buttons) {
        case MessageBoxButtons.OK:
            this.createButton(buttonContainer, 'OK', DialogResult.OK);
            break;
                
        case MessageBoxButtons.OKCancel:
            this.createButton(buttonContainer, 'OK', DialogResult.OK);
            this.createButton(buttonContainer, 'Cancel', DialogResult.Cancel);
            break;
                
        case MessageBoxButtons.AbortRetryIgnore:
            this.createButton(buttonContainer, 'Abort', DialogResult.Abort);
            this.createButton(buttonContainer, 'Retry', DialogResult.Retry);
            this.createButton(buttonContainer, 'Ignore', DialogResult.Ignore);
            break;
                
        case MessageBoxButtons.YesNoCancel:
            this.createButton(buttonContainer, 'Yes', DialogResult.Yes);
            this.createButton(buttonContainer, 'No', DialogResult.No);
            this.createButton(buttonContainer, 'Cancel', DialogResult.Cancel);
            break;
                
        case MessageBoxButtons.YesNo:
            this.createButton(buttonContainer, 'Yes', DialogResult.Yes);
            this.createButton(buttonContainer, 'No', DialogResult.No);
            break;
                
        case MessageBoxButtons.RetryCancel:
            this.createButton(buttonContainer, 'Retry', DialogResult.Retry);
            this.createButton(buttonContainer, 'Cancel', DialogResult.Cancel);
            break;
        }
    }

    /**
     * Creates a button element with the specified text and result.
     */
    private static createButton(container: HTMLDivElement, text: string, result: DialogResult): void {
        const button = document.createElement('button');
        button.className = 'message-box-button';
        button.textContent = text;
        
        // Add click handler
        button.addEventListener('click', () => {
            this.close(result);
        });
        
        container.appendChild(button);
    }

    /**
     * Closes the message box and resolves the promise with the specified result.
     */
    private static close(result: DialogResult): void {
        this.result = result;
        
        // Remove from DOM
        if (this.overlay != null) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
            this.container = null;
        }
        
        // Resolve the promise
        if (this.resolvePromise != null) {
            this.resolvePromise(result);
            this.resolvePromise = null;
        }
    }
}
