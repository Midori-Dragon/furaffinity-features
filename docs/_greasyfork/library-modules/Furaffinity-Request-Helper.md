# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/logo.png" height="30"> Furaffinity Request Helper

Helper Library (wrapper) for common Requests to FurAffinity.

See documentation on [Furaffinity-Request-Helper](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Request-Helper/README).

## How to use

- `@require` this script from
  <br>

- Create an instance:
  ```javascript
  const requestHelper = new FARequestHelper(2); // Where 2 is the max amount of simultaneous Requests for this instance.
  ```

- Make a request using the created instance:
  ```javascript
  requestHelper.UserRequests.GalleryRequests.Gallery.getPage("someusername", 1);
  ```
  *See [Furaffinity-Request-Helper](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Request-Helper/README) for more info*

## Feature Roadmap

| Feature                       | Status      |
| ----------------------------- | ----------- |
| Adding Gallery Requests       | ✅ Completed |
| ⠀⠀⠀⠀Gallery                   | ✅ Completed |
| ⠀⠀⠀⠀Scraps                    | ✅ Completed |
| ⠀⠀⠀⠀Favorites                 | ✅ Completed |
| ⠀⠀⠀⠀Journals                  | ✅ Completed |
| ⠀⠀⠀⠀Browse                    | ✅ Completed |
| ⠀⠀⠀⠀Search                    | ✅ Completed |
| Adding Personal User Requests | ✅ Completed |
| Adding Search Requests        | ✅ Completed |
| Adding Submission Requests    | ✅ Completed |
| ⠀⠀⠀⠀Fav and Unfav Submission  | ✅ Completed |
| Improving the Documentation   | ⬜ Planned   |
| Adding more Requests          | ⬜ Planned   |
