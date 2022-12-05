# AsyncStatus

Manages the status of an async process.

- Built-in TypeScript declarations.
- Comprehensive unit testing.

## Installation

**As project dependency**

`npm i @bugtamer/async-status`

**As script dependency**

`import { AsyncStatus } from '@bugtamer/async-status/lib/async-status';`

## Basic usage examples

[AsyncStatus source code](https://github.com/bugtamer/async-status-js)
[Live demo source code](https://github.com/bugtamer/ng-async-status-example)
[Live demo](https://bugtamer.github.io/ng-async-status-example/)
[NPM](https://www.npmjs.com/package/@bugtamer/async-status)

### async / await

```typescript
const dataAsyncStatus = new AsyncStatus();
dataAsyncStatus.start();
try {
    data = await fetchData();
    dataAsyncStatus.end();
} catch (error) {
    dataAsyncStatus.abort();
}
```

### Observable

```typescript
const dataAsyncStatus = new AsyncStatus();
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
