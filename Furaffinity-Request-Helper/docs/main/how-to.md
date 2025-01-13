# How To [Something]

Here you can find general information on how to use the following Features:

- [Create and use Class Instances](#create-and-use-class-instances)
- [Access Class Properties](#access-class-properties)
- [Access Static Properties](#access-static-properties)
- [Use Class Functions](#use-class-functions)
- [Use Static Functions](#use-static-functions)
- [Use Functions as Parameters](#use-functions-as-parameters)
- [Use Asynchronious Functions](#use-asychronious-functions)
- [Access Value of a Key/Value Array](#access-value-of-a-keyvalue-array)

## Create and use Class Instances

Create a Class Instance and asign it to a Variable

```javascript
const classVariable = new Class();
```

## Access Class Properties

Access a Class Property

```javascript
classVariable.classProperty;
```

Access a Class Property and assing it to a Variable

```javascript
const classPropertyVar = classVariable.classProperty;
```

## Access Static Properties

Access a static Property and assing it to a variable

```javascript
const staticClassPropVar = Class.staticVar;
```

## Use Class Functions

Use a Classes Function

```javascript
classVariable.classFunction();
```

Use a Classes Function and assign its return value to a Variable

```javascript
const classFunctionReturnVar = classVariable.classFuntionWithReturnValue();
```

## Use static Functions

Use a static Classes Function

```javascript
Class.staticClassFunction();
```

## Use Functions as Parameters

Use a pre definied function as a Parameter in another Function

```javascript
function myFunction() {
  console.log("cool function!");
}

classVariable.functionThaAcceptsAFunctionParam("some string parameter", myFunction);
```

Use local function as a Parameter in another Function

```javascript
classVariable.functionThaAcceptsAFunctionParam(
  "some string parameter",
  () => {
    console.log("cool function!");
  },
  "some other parameter"
);
```

To define some parameters in your function just put them in your functions Parantheses `(yourParameter)`

## Use Asychronious Functions

Use Asychronious Functions with awaiting it.

```javascript
async function yourAsyncFunction() {
  const yourVar = await classVariable.someAsyncFunction();
}
```

Awaiting an async functions is needed when asigning a variable to it. Awaiting is only possible in an async function. When not awaiting an async function the program will still call it like normal, but it won't wait for it to finish executing and instantly continue to the next line of code

## Access Value of a Key/Value Array

Access the Value by using a Key in a Key/Value Array

```javascript
const arrayValue = classVariable.keyValueArray["key"];
```
