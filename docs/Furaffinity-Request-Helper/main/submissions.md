## Submission Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.SubmissionRequests;
```

## Static Class Properties

- `static hardLinks` - Array that holds the urls to the specific Action. Default Keys are:
  - view
  - fav
  - unfav
  - journal

## Class Functions

- `async getSubmissionPage(submissionId, action, delay)` - Returns the Submission Page with the given Id
  - *`submissionId` - Specifies the id of the Submission to get*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async favSubmission(submissionId, favKey, action, delay)` - Favs the Submission Page with the given Id
  - *`submissionId` - Specifies the id of the Submission to fav*
  - *`favKey` - Specifies the fav key required for this request (found in the fav button's href on the submission page)*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async unfavSubmission(submissionId, unfavKey, action, delay)` - Unfavs the Submission Page with the given Id
  - *`submissionId` - Specifies the id of the Submission to unfav*
  - *`unfavKey` - Specifies the unfav key required for this request (found in the unfav button's href on the submission page)*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*
  
  ---

- `async getJournalPage(submissionId, action, delay)` - Returns the Journal Page with the given Id
  - *`submissionId` - Specifies the id of the journal to get*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*
