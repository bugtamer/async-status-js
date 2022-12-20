# AsyncStatus JS

Manages the status of an async process.

- Built-in TypeScript declarations.
- Built-in Javascript / TypeScript map declarations.
- Comprehensive unit testing.
- [Available at npmjs.com](https://www.npmjs.com/package/@bugtamer/async-status)
- [Source Code](https://github.com/bugtamer/async-status-js)

## Table Of Content

- [Installation](#installation)
  - [As project dependency](#as-project-dependency)
  - [As script dependency](#as-script-dependency)
- [Basic usage snippets](#basic-usage-snippets)
  - [async / await](#async-await)
  - [Observable](#observable)
- [Status management / Class interface](#status-management-class-interface)
  - [Use](#use)
  - [Check attempt stats](#check-attempt-stats)
  - [Check current state](#check-current-state)
  - [Check last outcome state](#check-last-outcome-state)
  - [Measure the time](#measure-the-time)
- [Final notes](#final-notes)
- [Examples](#examples)

## Installation

### As project dependency

`npm i @bugtamer/async-status`

[Available at npmjs.com](https://www.npmjs.com/package/@bugtamer/async-status)

### As script dependency

['require' demo example](https://runkit.com/bugtamer/async-status)

```javascript
const bugtamer = require("@bugtamer/async-status")
const dataAsyncStatus = new bugtamer.AsyncStatus();
```

or

```javascript
const bugtamer = require("@bugtamer/async-status/lib/async-status")
const dataAsyncStatus = new bugtamer.AsyncStatus();
```

['import' demo example](https://github.com/bugtamer/ng-async-status-example)

```javascript
import { AsyncStatus } from '@bugtamer/async-status/lib/async-status';
const dataAsyncStatus = new AsyncStatus();
```

## Basic usage snippets

### async / await

```javascript
dataAsyncStatus.start();
try {
    data = await fetchData();
    dataAsyncStatus.end();
} catch (error) {
    dataAsyncStatus.abort();
}
```

### Observable

```javascript
dataAsyncStatus.start();
const subscription = fetchData().subscribe(
    response => {
        data = response;
        subscription.unsubscribe();
        dataAsyncStatus.end();
    },
    error => {
        subscription.unsubscribe();
        dataAsyncStatus.abort();
    }
);
```

## Status management / Class interface

### Use

| Current State | Method called / Sentence | Outcome        |
| ------------- | ------------------------ | -------------- |
|               | `new AsyncStatus()`      | idle state     |
| idle          | `start()`                | ongoing state  |
| ongoing       | `end()`                  | idle state     |
| ongoing       | `abort()`                | idle state     |
| ongoing       | `start()`                | Throw an error |
| idle          | `end()`                  | Throw an error |
| idle          | `abort()`                | Throw an error |

Do not try to manage these errors, just fix your code.
They point out that some method should never have called.

### Check attempt stats

| Sentence                              | Description                              |
|---------------------------------------|------------------------------------------|
| `dataAsyncStatus.attempts`            | returns the number of calls to `start()` |
| `dataAsyncStatus.successfulAttempts`  | returns the number of calls to `end()`   |
| `dataAsyncStatus.failedAttempts`      | returns the number of calls to `abort()` |
| `dataAsyncStatus.resetAttemptStats()` | all previous counters are set to 0       |

### Check current state

In this section we understand by _call_ a call to any of the following methods: `start()`, `end()` or `abort()`.

#### Idle State

There is no process activity.

| `dataAsyncStatus.isIdle`                                                    | Returns |
|-----------------------------------------------------------------------------|---------|
| When `start()` was never executed or the last call was `end()` or `abort()` | `true`  |
| In any other case                                                           | `false` |

#### Ongoing state

There is a process in progress.

| `dataAsyncStatus.isOngoing`                                                                       | Returns |
|---------------------------------------------------------------------------------------------------|---------|
| When the last call was `start()` and therefore neither `end()` nor `abort()` have been called yet | `true`  |
| In any other case                                                                                 | `false` |

### Check last outcome state

In this section we understand by _call_ a call to any of the following methods: `start()`, `end()` or `abort()`.

#### A successful outcome

| `dataAsyncStatus.wasSuccessful`         | Returns |
|-----------------------------------------|---------|
| When `end()` was the last method called | `true`  |
| In any other case                       | `false` |

#### A failed outcome

| `dataAsyncStatus.wasFailed`               | Returns |
|-------------------------------------------|---------|
| When `abort()` was the last method called | `true`  |
| In any other case                         | `false` |

### Measure the time

In milliseconds (ms):

| `dataAsyncStatus.elapsedTime`                                                 | Returns                                                          |
|-------------------------------------------------------------------------------|------------------------------------------------------------------|
| when `start()` was never called                                               | `AsyncStatus.UNDEFINED_TIME` (`-1`)                              |
| when `start()` was called but `end()` or `abort()` has not yet been called    | Time elapsed since the call to `start()` to current time         |
| when `start()` was called and eventually `end()` or `abort()` was also called | Elapsed time from call to `start()` to `end()` or `abort()` call |

## Final notes
- Using a single instance of `AsyncStatus` to control multiple independent asynchronous processes that overlap in time could lead to erratic behavior in your program.

- `start()` throws an error when is called more than `Number.MAX_SAFE_INTEGER` times (although is nearly unreachable).

## Examples

- [Angular demo example](https://bugtamer.github.io/ng-async-status-example/)
- [Check out](https://runkit.com/bugtamer/async-status) the following example at RunKit:

```javascript
// const bugtamer = require("@bugtamer/async-status/lib/async-status")
const bugtamer = require("@bugtamer/async-status")


function showStats(asyncStatus, message) {
    console.log(message)
    console.log(`  - Attempts:     ${asyncStatus.attempts}`)
    console.log(`    - successful: ${asyncStatus.successfulAttempts}`)
    console.log(`    - failed:     ${asyncStatus.failedAttempts}`)
    console.log(`  - State:`)
    console.log(`    - idle:       ${asyncStatus.isIdle}`)
    console.log(`    - ongoing:    ${asyncStatus.isOngoing}`)
    console.log(`  - Outcome:`)
    console.log(`    - successful: ${asyncStatus.wasSuccessful}`)
    console.log(`    - failed:     ${asyncStatus.wasFailed}`)
    console.log(`  - Time elapsed: ${asyncStatus.elapsedTime} ms`)
}


// Let's show where the Internation Space Station currently is.
console.log("Let's see where the ISS is with Node " + process.version);

// We can use any package from NPM since they are all built in.
var getJSON = require("async-get-json"); 


const status = new bugtamer.AsyncStatus();
showStats(status, 'new AsyncStatus()')

status.start()
showStats(status, 'start()')


const url = "http://api.open-notify.org/iss-now.json"; // change it to make it fail
try {
    // And we can use ES7 async/await to pull the ISS's position from the open API.
    var result = await getJSON(url);

    status.end()
    showStats(status, 'end()')
} catch (error) {
    status.abort()
    showStats(status, 'abort()')
}


if (!!result) {
    // RunKit will automatically display the last statement and try to find its best representation:
    result.iss_position;
}
```

### Example output

```log
Let's see where the ISS is with Node v14.20.1
new AsyncStatus()
  - Attempts:     0
    - successful: 0
    - failed:     0
  - State:
    - idle:       true
    - ongoing:    false
  - Outcome:
    - successful: false
    - failed:     false
  - Time elapsed: -1 ms
start()
  - Attempts:     1
    - successful: 0
    - failed:     0
  - State:
    - idle:       false
    - ongoing:    true
  - Outcome:
    - successful: false
    - failed:     false
  - Time elapsed: 1 ms
end()
  - Attempts:     1
    - successful: 1
    - failed:     0
  - State:
    - idle:       true
    - ongoing:    false
  - Outcome:
    - successful: true
    - failed:     false
  - Time elapsed: 75 ms
```