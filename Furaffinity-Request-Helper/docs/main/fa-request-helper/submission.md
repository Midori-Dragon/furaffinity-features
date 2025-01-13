## Submission Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests.SubmissionRequests;
```

## Statis Class Properties

- `static hardLinks` - Array that holds the urls to the specific Action. Default Keys are:
  - view
  - fav
  - unfav
  - journal

## Class Functions

- `async getSubmissionPage(submissionId, action, delay)` - Returns the Submission Page with the given Id
  - _`submissionId` - Specifies the id of the Submission to get_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
- `async favSubmission(submissionId, action, delay)` - Favs the Submission Page with the given Id
  - _`submissionId` - Specifies the id of the Submission to fav_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
- `async unfavSubmission(submissionId, action, delay)` - Unfavs the Submission Page with the given Id
  - _`submissionId` - Specifies the id of the Submission to unfav_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
- `async getJournalPage(submissionId, action, delay)` - Returns the Journal Page with the given Id
  - _`submissionId` - Specifies the id of the journal to get_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
