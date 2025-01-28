## Furaffinity Request Helper

Helper Library (wrapper) for common Requests to Furaffinity. Also see this Script on GreasyFork as [Furaffinity-Request-Helper](https://greasyfork.org/scripts/483952-furaffinity-request-helper)

<br>

> [!NOTE]
> The Documentation is still in progress and partly outdated.

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

### Class Functions

- `async getHTML(url, action, delay)` - Function for getting any websites HTML
  - *`url` - Specifies the url to which the request goes*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is* going. Default value is `100`

---

### Static Class Properties

- `logLevel` - Specifies the loglevel: 0 = None, 1 = Messages, 2 = Warnings, 3 = Errors
- `domain` - Specifies the domain of Furaffinity. By default is `www.furaffinity.net`
- `useHttps` - Specifies wether to use `https` or `http`

---

### Static Class Functions

- `getUrl()` - Returns the url to Furaffinty. Based on the static `domain` and `useHttps` variables.
