# Furaffinity Prototype Extensions

A collection of prototype extensions for needed Functions for other Modules.

## How to use

- `@require` this script from GreasyFork or (in case of browser extension) import it as a module
- Use added Functionalities:
  ```javascript
  let someString = "Hello World";
  someString = someString.trimEnd(" World");
  console.log(someString); // logs: "Hello"
  ```

## Feature Roadmap

| Feature                       | Status      |
| ----------------------------- | ----------- |
| String extensions             | ✅ Completed |
| ⠀⠀⠀⠀trimStart('someString')   | ✅ Completed |
| ⠀⠀⠀⠀trimEnd('someString')     | ✅ Completed |
| Node extensions               | ✅ Completed |
| ⠀⠀⠀⠀insertBeforeThis(newNode) | ✅ Completed |
| ⠀⠀⠀⠀insertAfterThis(newNode)  | ✅ Completed |
| ⠀⠀⠀⠀getIndexOfThis()          | ✅ Completed |
| ⠀⠀⠀⠀readdToDom()              | ✅ Completed |
