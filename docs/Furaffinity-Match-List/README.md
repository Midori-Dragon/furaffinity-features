# Furaffinity Match List

Helper Library to create a Matchlist for your custom Furaffinitiy Script. Also see this Script on GreasyFork as [Furaffinity-Match-List](https://greasyfork.org/scripts/485827-furaffinity-match-list)

## How to use

- `@require` this script from GreasyFork or (in case of browser extension) import it as a module
- Create a new MatchList:
  ```javascript
  const matchlist = new FAMatchList(customSettings); //customSettings is optional
  ```
  See [CustomSettings](https://github.com/Midori-Dragon/Furaffinity-Custom-Settings) for more info
- Add Matches to the list with either `addMatch`, `matches.push` or set `matches` directly:
  ```javascript
  matchlist.addMatch("part/of-url");
  matchlist.matches.push("part/of-url");
  matchlist.matches = ["part/of-url"];
  ```
  See [MatchList](#matchlist) for more info
- Check for matches:
  ```javascript
  if (matchlist.hasMatch) {
    doSomething();
  }
  ```

## Feature Roadmap

| Feature                                                                             | Status      |
| ----------------------------------------------------------------------------------- | ----------- |
| Have basic Matchlist                                                                | ✅ Completed |
| Have some Options                                                                   | ✅ Completed |
| ⠀⠀⠀⠀Whether to run in an IFrame                                                     | ✅ Completed |
| ⠀⠀⠀⠀Whether to log the running status                                               | ✅ Completed |
| Integration with [Furaffinity-Custom-Settings](/Furaffinity-Custom-Settings/README) | ✅ Completed |

## Documentation

### MatchList

The MatchList class contains following Properties:

- `matches` - The array of matches for which to check
- `hasMatch` - Wether there is a match
- `match` - The current found match (if there is one)
- `runInIFrame` - Wether your Script is allowed to run in an IFrame
- `isWindowIFrame` - Wether the current Window is running in an IFrame
- `customSettings` - The CustomSettings which to display if your Script is allowed to run *(See [CustomSettings](../Furaffinity-Custom-Settings/README))*

It has following functions:

- `addMatch(match)` - Adds a new match to the list
- `removeMatch()` - Removes the last match from the list
