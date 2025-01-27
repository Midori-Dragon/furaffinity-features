## Furaffinity Request Helper

Helper Library (wrapper) for common Requests to Furaffinity. Also see this Script on GreasyFork as [Furaffinity-Request-Helper](https://greasyfork.org/scripts/483952-furaffinity-request-helper)

#### Table of Contents

- [How to use](#how-to-use)
- [Feature Roadmap](#feature-roadmap)
- [Documentation](#documentation)

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

- [x] Adding Gallery Requests
  - [x] Gallery
  - [x] Scraps
  - [x] Favorites
  - [x] Journals
  - [x] Browse
  - [x] Search
- [x] Adding Personal User Requests
- [x] Adding Search Requests
- [x] Adding Submission Requests
  - [x] Fav and Unfav Submission
- [ ] Improving the Documentation
- [ ] Adding more Requests

## Documentation

### Class Properties

- `UserRequests` - Class that holds all User associated Requests - [UserRequests](main/user)
- `PersonalUserRequests` - Class that holds all Requests associated with your Account - [PersonalUserRequests](main/personal)
- `SubmissionRequests` - Class that holds all Submission associated Requests - [SubmissionRequests](main/submissions)

### Class Functions

- `async getHTML(url, action, delay)` - Function for getting any websites HTML
  - *`url` - Specifies the url to which the request goes*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is* going. Default value is `100`

### Static Class Properties

- `logLevel` - Specifies the loglevel: 0 = None, 1 = Messages, 2 = Warnings, 3 = Errors
- `domain` - Specifies the domain of Furaffinity. By default is `www.furaffinity.net`
- `useHttps` - Specifies wether to use `https` or `http`

### Static Class Functions

- `getUrl()` - Returns the url to Furaffinty. Based on the static `domain` and `useHttps` variables.
