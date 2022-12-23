import { performance } from 'perf_hooks';


enum State {

  /** Never executed */
  noCalls,

  /** Already running */
  started,

  /** Successfully finished */
  done,

  /** Failed execution */
  aborted

}


/**
 * Async process status management.
 * @license MIT
 * @author Bugtamer
 */
export class AsyncStatus {

  static readonly UNDEFINED_TIME = -1;

  /**
   * Flag the process as execution in progress.
   * @throws an error when `start()` is called and the process was already running.
   * @throws an error when `start()` is executed more than `Number.MAX_SAFE_INTEGER`:
   * 9007199254740991 times.
   */
  start(): void {
    this._forbiddenStateGuard(this.isOngoing, AsyncStatus.startErrorMessage);
    this._overflowGuard(this._attemptCount);
    this._status = State.started;
    this._attemptCount++;
    this._initialTime = this._currentTime();
    this._finalTime = AsyncStatus.UNDEFINED_TIME;
  }


  /**
   * - Flag the process as successfully completed.
   * @throws an error when `end()` is called and the process was not already running.
   */
  end(): void {
    this._forbiddenStateGuard(this.isIdle, AsyncStatus.endErrorMessage);
    this._status = State.done;
    this._successfulAttemptCount++;
    this._finalTime = this._currentTime();
  }


  /**
   * - Flag the process as unexpectedly ended with an error.
   * @throws an error when `abort()` is called and the process was not already running.
   */
  abort(): void {
    this._forbiddenStateGuard(this.isIdle, AsyncStatus.abortErrorMessage);
    this._status = State.aborted;
    this._failedAttemptCount++;
    this._finalTime = this._currentTime();
  }


  /**
   * Set all stats to zero.
   */
  resetAttemptStats(): void {
    this._attemptCount = 0;
    this._successfulAttemptCount = 0;
    this._failedAttemptCount = 0;
  }


  /**
   * The process is not already running:
   * - never executed
   * - successfully finished
   * - unsuccessfully finished
   */
  get isIdle(): boolean {
    return (this._status !== State.started);
  }


  /**
   * The process is already on execution.
   */
  get isOngoing(): boolean {
    return (this._status === State.started);
  }


  /**
   * The process outcome was successful.
   */
  get wasSuccessful(): boolean {
    return (this._status === State.done);
  }


  /**
   * The process outcome was unsuccessful.
   */
  get wasFailed(): boolean {
    return (this._status === State.aborted);
  }


  /**
   * Time elapsed in milliseconds between the last call to `start()`
   * and a call to `end()`, `abort()` or current time if neither of them were called.
   * `-1` is returned when `start()` has never been called.
   */
  get elapsedTime(): number {
    if (this._status === State.noCalls) {
      return AsyncStatus.UNDEFINED_TIME;
    }
    if (this._status === State.started) {
      return this._currentTime() - this._initialTime;
    }
    return this._finalTime - this._initialTime;
  }


  /**
   * Number of calls to `start()`.
   */
  get attempts(): number {
    return this._attemptCount;
  }


  /**
   * Number of calls to `end()`.
   */
  get successfulAttempts(): number {
    return this._successfulAttemptCount;
  }


  /**
   * Number of calls to `abort()`.
   */
  get failedAttempts(): number {
    return this._failedAttemptCount;
  }


  // IMPLEMENTATION DETAILS


  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
   * @returns milliseconds
   */
  protected _currentTime(): number {
    return performance.now();
  }


  protected _forbiddenStateGuard(isAnIllegalState: boolean, errorMessage: string): void {
    if (isAnIllegalState) {
      throw new Error(errorMessage);
    }
  }


  protected _overflowGuard(currentCount: number): void {
    if (currentCount === Number.MAX_SAFE_INTEGER ) {
      throw new Error(AsyncStatus.overflowErrorMessage); // (nearly) unreachable
    }
  }


  // attempts
  protected _attemptCount = 0;
  protected _successfulAttemptCount = 0;
  protected _failedAttemptCount = 0;
  // times
  protected _initialTime = 0;
  protected _finalTime = AsyncStatus.UNDEFINED_TIME;
  // state
  protected _status: State = State.noCalls;
  // messages
  protected static readonly startErrorMessage = `'start()' cannot be called in 'started' state.`;
  protected static readonly endErrorMessage = `'end()' cannot be called in 'idle' state.`;
  protected static readonly abortErrorMessage = `'abort()' cannot be called in 'idle' state.`;
  protected static readonly overflowErrorMessage =`Overflow error.`;

}