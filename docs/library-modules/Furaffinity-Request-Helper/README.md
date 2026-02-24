# Furaffinity Request Helper

Helper Library (wrapper) for common Requests to Furaffinity. Also see this Script on GreasyFork as [Furaffinity-Request-Helper](https://greasyfork.org/scripts/483952-furaffinity-request-helper)

## How to use

- `@require` this script from GreasyFork or (in case of browser extension) import it as a module
- Create a instance of the Class
  ```javascript
  const requestHelper = new FARequestHelper(2); // Where 2 is the max amount of simultaneous Requests for this instance.
  ```
- Make a request using the created instance
  ```javascript
  requestHelper.UserRequests.GalleryRequests.Gallery.getPage("someusername", 1);
  ```

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

## Documentation

### Class Properties

- `UserRequests` - Class that holds all User associated Requests - [UserRequests](/main/user)
- `PersonalUserRequests` - Class that holds all Requests associated with your Account - [PersonalUserRequests](/main/personal)
- `SubmissionRequests` - Class that holds all Submission associated Requests - [SubmissionRequests](/main/submissions)

---

### Static Class Functions

- `static async getHTML(url, action, delay)` - Static function for getting any website's HTML as a Document
  - *`url` - Specifies the url to which the request goes*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is* going. Default value is `100`

---

### Static Class Properties

- `logLevel` - Specifies the log level. Default is `1`.
- `useHttps` - Specifies whether to use `https` or `http`
- `fullUrl` - Returns the full URL to FurAffinity (read-only getter, based on the current protocol and hostname)
