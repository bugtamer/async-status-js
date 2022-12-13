# AsyncStatus JS

Manages the status of an async process.

- Built-in TypeScript declarations.
- Comprehensive unit testing.
- [Live demo](https://runkit.com/bugtamer/usage-example-of-bugtamer-async-status)
- [Available at npmjs.com](https://www.npmjs.com/package/@bugtamer/async-status)
- [Source Code](https://github.com/bugtamer/async-status-js)

## Table Of Content

- [Installation](#installation)
  - [As project dependency](#as-project-dependency)
  - [As script dependency](#as-script-dependency)
- [Basic usage examples](#basic-usage-examples)
  - [async / await](#async-await)
  - [Observable](#observable)
- [Status management / Class interface](#status-management-class-interface)
  - [Use](#use)
  - [Check attempt stats](#check-attempt-stats) (succeded | failed | total)
  - [Check current state](#check-current-state) (idle | ongoing)
  - [Check last outcome state](#check-last-outcome-state) (succeded | failed)
  - [Measure the time](#measure-the-time)
- [Final notes](#final-notes)

## Installation

### As project dependency

`npm i @bugtamer/async-status`

[Available at npmjs.com](https://www.npmjs.com/package/@bugtamer/async-status)

### As script dependency

```javascript
const bugtamer = require("@bugtamer/async-status")
const dataAsyncStatus = new bugtamer.AsyncStatus();
```

```javascript
const bugtamer = require("@bugtamer/async-status/lib/async-status")
const dataAsyncStatus = new bugtamer.AsyncStatus();
```

```javascript
import { AsyncStatus } from '@bugtamer/async-status/lib/async-status';
const dataAsyncStatus = new AsyncStatus();
```



## Basic usage examples

- [Live vanilla JS demo](https://runkit.com/bugtamer/usage-example-of-bugtamer-async-status)
- [Live Angular demo](https://bugtamer.github.io/ng-async-status-example/)
- [Live Angular demo source code](https://github.com/bugtamer/ng-async-status-example)

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

### Check attempt stats

- `dataAsyncStatus.attempts`
  returns the number of calls to `start()`.

- `dataAsyncStatus.successfulAttempts`
  returns the number of calls to `end()`.

- `dataAsyncStatus.failedAttempts`
  returns the number of calls to `abort()`.

- `dataAsyncStatus.resetAttemptStats()` all counters (`attempts`, `successfulAttempts` and `failedAttempts`) are set to 0.

### Check current state

- `dataAsyncStatus.isIdle`
  returns `true` only when the process was
    - never executed (`start()` was never called) or
    - successfully finished (`start()` was called before `end()`) or
    - unsuccessfully finished (`start()` was called before `abort()`)

- `dataAsyncStatus.isOngoing`
  returns `true` when `start()` was executed but not `end()` or `abort()`, otherwise `false`.

### Check last outcome state

- `dataAsyncStatus.wasSuccessful` returns `true` when `end()` was the last method called. Otherwise `false`.

- `dataAsyncStatus.wasFailed` returns `true` when `abort()` was the last method called. Otherwise `false`.

### Measure the time

- `dataAsyncStatus.elapsedTime` returns the elapsed time in milliseconds between the last call to `start()` and a call to `end()`, `abort()` or current time if neither of them were called . Returns `-1` when `start()` has never been called.

## Final notes
- Using a single instance of `AsyncStatus` to control multiple independent asynchronous processes that overlap in time could lead to erratic behavior in your code.

- Throws an error when `start()` is called more than `Number.MAX_SAFE_INTEGER` times (although is nearly unreachable).
