# Furaffinity Message Box

Helper Library to show a MessageBox for your custom Furaffinitiy Script. Also see this Script on GreasyFork as [Furaffinity-Message-Box](https://greasyfork.org/scripts/528997-furaffinity-message-box)

## Features

- Display custom styled message boxes that appear in front of the current page
- Support for different message box icons (Error, Warning, Information, Question)
- Support for different button combinations (OK, OK/Cancel, Yes/No, etc.)
- Promise-based API for easy integration with async/await
- Use of Furaffinity Themes

## How to use

- `@require` this script from GreasyFork or (in case of browser extension) import it as a module
- Create a new MessageBox:
```javascript
  await FAMessageBox.show('Hello, world!');
  const result = await FAMessageBox.show('This is a confirmation.', 'Confirmation', FAMessageBoxButtons.YesNo, FAMessageBoxIcon.Question);
  if (result === FADialogResult.Yes) //...
  ```
  *See [MessageBox](#messagebox) for more info*

## Feature Roadmap

| Feature                          | Status      |
| -------------------------------- | ----------- |
| Have MassageBox                  | ✅ Completed |
| Support different Types          | ✅ Completed |
| ⠀⠀⠀⠀Information                  | ✅ Completed |
| ⠀⠀⠀⠀Question                     | ✅ Completed |
| ⠀⠀⠀⠀Warning                      | ✅ Completed |
| ⠀⠀⠀⠀Error                        | ✅ Completed |
| Support Furaffinity Color Themes | ✅ Completed |
| Support non async MessageBox     | ⬜ Planned   |

## Documentation

### MessageBox

The main class for displaying message boxes. It contains following static functions:

- `static async show(text, caption, buttons, icon)` - Shows a message box with the specified text, caption, buttons, and icon returning [DialogResult](#dialogresult).
  - `text`: The text to display in the message box.
  - `caption`: The text to display in the title bar of the message box.
  - `buttons`: One of the [MessageBoxButtons](#messageboxbuttons) values that specifies which buttons to display in the message box.
  - `icon`: One of the [MessageBoxIcon](#messageboxicon) values that specifies which icon to display in the message box.

---

### MessageBoxButtons

Enum that specifies the buttons that are displayed on a message box.

- `OK`: The message box contains an OK button.
- `OKCancel`: The message box contains OK and Cancel buttons.
- `AbortRetryIgnore`: The message box contains Abort, Retry, and Ignore buttons.
- `YesNoCancel`: The message box contains Yes, No, and Cancel buttons.
- `YesNo`: The message box contains Yes and No buttons.
- `RetryCancel`: The message box contains Retry and Cancel buttons.

---

### MessageBoxIcon

Enum that specifies the icon that is displayed on a message box.

- `None`: No icon is displayed.
- `Error`: An error icon is displayed on the message box.
- `Warning`: A warning icon is displayed on the message box.
- `Information`: An information icon is displayed on the message box.
- `Question`: A question mark icon is displayed on the message box.

---

### DialogResult

Enum that specifies identifiers to indicate the return value of a dialog box.

- `None`: Nothing is returned from the dialog box.
- `OK`: The dialog box return value is OK.
- `Cancel`: The dialog box return value is Cancel.
- `Abort`: The dialog box return value is Abort.
- `Retry`: The dialog box return value is Retry.
- `Ignore`: The dialog box return value is Ignore.
- `Yes`: The dialog box return value is Yes.
- `No`: The dialog box return value is No.
