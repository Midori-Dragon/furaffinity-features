# Furaffinity Match List

Helper Library to create a Matchlist for your custom Furaffinitiy Script. Also see this Script on Greasy Fork as [Furaffinity-Match-List](https://greasyfork.org/de/scripts/485827-furaffinity-match-list)

#### Table of Contents

- [Furaffinity Match List](#furaffinity-match-list)
      - [Table of Contents](#table-of-contents)
  - [How to use](#how-to-use)
  - [Feature Roadmap](#feature-roadmap)
  - [Documentation](#documentation)
    - [MatchList](#matchlist)

## How to use

- `@require` this script with the following url "https://raw.githubusercontent.com/Midori-Dragon/Furaffinity-Match-List/main/Furaffinity-Match-List.js"
  <br>
- Create a new MatchList:
  ```javascript
  const matchlist = new FAMatchList(customSettings); //customSettings is optional
  ```
  See [CustomSettings](https://github.com/Midori-Dragon/Furaffinity-Custom-Settings) for more info
  <br>
- Add Matches to the list with either `addMatch`, `matches.push` or set `matches` directly:
  ```javascript
  matchlist.addMatch("part/of-url");
  matchlist.matches.push("part/of-url");
  matchlist.matches = ["part/of-url"];
  ```
  See [MatchList](#matchlist) for more info
  <br>
- Check for matches:
  ```javascript
  if (matchlist.hasMatch)
    doSomething();
  ```

## Feature Roadmap

- [x] Have basic Matchlist
- [x] Have some Options
  - [x] Whether to run in an IFrame
  - [x] Whether to log the running status
- [x] Integration with [Furaffinity-Custom-Settings](https://greasyfork.org/de/scripts/475041-furaffinity-custom-settings)

## Documentation

### MatchList

The MatchList class contains following Properties:

- `matches` - The array of matches for which to check
- `hasMatch` - Wether there is a match
- `match` - The current found match (if there is one)
- `runInIFrame` - Wether your Script is allowed to run in an IFrame
- `isWindowIFrame` - Wether the current Window is running in an IFrame
- `customSettings` - The CustomSettings which to display if your Script is allowed to run _(See [CustomSettings](https://github.com/Midori-Dragon/Furaffinity-Custom-Settings))_

It has following functions:

- `addMatch(match)` - Adds a new match to the list
- `removeMatch()` - Removes the last match from the list
