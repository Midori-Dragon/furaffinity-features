# FA Instant Nuker

A userscript/browser extension that enhances FurAffinity gallery browsing by providing a nuke button, that when pressed instantly nukes the current page without asking for confirmation. Also available on GreasyFork as [FA-Instant-Nuker](https://greasyfork.org/scripts/527752-fa-instant-nuker).

## How to use

- Load this script from GreasyFork or use it inside the browser extensions
- Messages will automatically:
  - Show a new Nuke button without any Text
  - Nuke the corresponding messages when the button is pressed

## Feature Roadmap

| Feature              | Status      |
| -------------------- | ----------- |
| Instant Nuke Buttons | ✅ Completed |
| ⠀⠀⠀⠀Watches          | ✅ Completed |
| ⠀⠀⠀⠀Journal Comments | ✅ Completed |
| ⠀⠀⠀⠀Shouts           | ✅ Completed |
| ⠀⠀⠀⠀Favorites        | ✅ Completed |
| ⠀⠀⠀⠀Journals         | ✅ Completed |
| ⠀⠀⠀⠀Submissions      | ✅ Completed |

## Settings
- `selectNukeIcon` - Select the Nuke Icon to use *(default is `red`)*

## Documentation

### SubmissionNuker

The SubmissionNuker class creates the Submissions Nuke button upon calling the constructor. *(see [NukeButton](#nukebutton))*

---

### MessageNuker

The MessageNuker class creates the all message types Nuke buttons upon calling the constructor. *(see [NukeButton](#nukebutton))*

---

### NukeButton

The NukeButton class creates a Nuke button of a specific message type upon calling the constructor. *(see [MessageType](#messagetype))*

---

### MessageType

MessageType enum that represents the type of a message:

- `None` = No message type
- `Watches` = Watches message type
- `JournalComments` = Journal Comments message type
- `Shouts` = Shouts message type
- `Favorites` = Favorites message type
- `Journals` = Journals message type
- `Submission` = Submissions message type
- `All` = All message types
