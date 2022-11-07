import { IAsyncStatus } from "./async-status.interface";


enum State {

  /** Never executed */
  idle,

  /** Already running */
  started,

  /** Successfully finished */
  done,

  /** Failed execution */
  aborted

}


/**
 * Implementation for managing the async status of a process.
 * @version 0.0.0
 * @license MIT
 * @author Bugtamer
 */
export class AsyncStatus implements IAsyncStatus {

  static readonly undefinedTime = -1;
  static readonly startErrorMessage = `'start()' cannot be called in 'started' state.`;
  static readonly endErrorMessage = `'end()' cannot be called in 'idle' state.`;
  static readonly abortErrorMessage = `'abort()' cannot be called in 'idle' state.`;
  static readonly overflowErrorMessage =`Overflow error.`;
  
  start(): void {
    this._forbiddenStateGuard(this.isOngoing, AsyncStatus.startErrorMessage);
    this._overflowGuard(this._attemptCount);
    this._status = State.started;
    this._attemptCount++;
    this._initialTime = this._timestamp();
    this._finalTime = AsyncStatus.undefinedTime;
  }


  end(): void {
    this._forbiddenStateGuard(this.isIdle, AsyncStatus.endErrorMessage);
    this._status = State.done;
    this._successfulAttemptCount++;
    this._finalTime = this._timestamp();
  }


  abort(): void {
    this._forbiddenStateGuard(this.isIdle, AsyncStatus.abortErrorMessage);
    this._status = State.aborted;
    this._failedAttemptCount++;
    this._finalTime = this._timestamp();
  }


  resetAttemptStats(): void {
    this._attemptCount = 0;
    this._successfulAttemptCount = 0;
    this._failedAttemptCount = 0;
  }

  
  get isIdle(): boolean {
    return (this._status !== State.started);
  }


  get isOngoing(): boolean {
    return (this._status === State.started);
  }


  get wasSuccessful(): boolean {
    return (this._status === State.done);
  }


  get wasFailed(): boolean {
    return (this._status === State.aborted);
  }


  get elapsedTime(): number {
    const duration = (this._finalTime - this._initialTime);
    return (duration < 0) ? AsyncStatus.undefinedTime : duration;
  }


  get attempts(): number {
    return this._attemptCount;
  }


  get successfulAttempts(): number {
    return this._successfulAttemptCount;
  }


  get failedAttempts(): number {
    return this._failedAttemptCount;
  }


  // IMPLEMENTATION DETAILS


  /** @returns milliseconds */
  protected _timestamp(): number {
    return new Date().getTime();
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
  protected _finalTime = AsyncStatus.undefinedTime;
  // states
  protected _status: State = State.idle;

}