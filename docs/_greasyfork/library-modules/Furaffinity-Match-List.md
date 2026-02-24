# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/logo.png" height="30"> Furaffinity Match List

Helper Library to create a Matchlist for your custom FurAffinity Script.

See documentation on [Furaffinity-Match-List](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Match-List/README)

## How to use

- `@require` this script
  <br>

- Create a new MatchList:
  ```javascript
  const matchlist = new FAMatchList(customSettings); //customSettings is optional
  ```
  *See [CustomSettings](https://greasyfork.org/scripts/475041-furaffinity-custom-settings) for more info*
  <br>

- Add Matches to the list with either `addMatch` or `matches.push`:
  ```javascript
  matchlist.addMatch("part/of-url");
  matchlist.matches.push("part/of-url");
  matchlist.matches = ["part/of-url"];
  ```
  *See [MatchList](#matchlist) for more info*
  <br>

- Check for matches:
  ```javascript
  if (matchlist.hasMatch) {
  ⠀⠀doSomething();
  }
  ```

## Feature Roadmap

| Feature                                                                                                           | Status      |
| ----------------------------------------------------------------------------------------------------------------- | ----------- |
| Have basic Matchlist                                                                                              | ✅ Completed |
| Have some Options                                                                                                 | ✅ Completed |
| ⠀⠀⠀⠀Whether to run in an IFrame                                                                                   | ✅ Completed |
| ⠀⠀⠀⠀Whether to log the running status                                                                             | ✅ Completed |
| Integration with [Furaffinity-Custom-Settings](https://greasyfork.org/scripts/475041-furaffinity-custom-settings) | ✅ Completed |
