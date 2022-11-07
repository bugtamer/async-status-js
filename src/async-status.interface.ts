/**
 * AsyncStatus Interface to define how to manage the status of an async process.
 * @version 0.0.0
 * @license MIT
 * @author Bugtamer
 */
export interface IAsyncStatus {

    /**
     * Flag the process as execution in progress.
     * @throws an error when `start()` is called and the process was already running.
     * @throws an error when `start()` is executed more than `Number.MAX_SAFE_INTEGER`:
     * 9007199254740991 times.
     */
    start(): void;


    /**
     * - Flag the process as successfully completed.
     * @throws an error when `end()` is called and the process was not already running.
     */
    end(): void;


    /**
     * - Flag the process as unexpectedly ended with an error.
     * @throws an error when `abort()` is called and the process was not already running.
     */
    abort(): void;


    /**
     * Set all stats to zero.
     */
    resetAttemptStats(): void;


    /**
     * The process is not already running:
     * - never executed
     * - successfully finished
     * - unsuccessfully finished
     */
    get isIdle(): boolean;


    /**
     * The process is already on execution.
     */
    get isOngoing(): boolean;


    /**
     * The process outcome was successful.
     */
    get wasSuccessful(): boolean;


    /**
     * The process outcome was unsuccessful.
     */
    get wasFailed(): boolean;


    /**
     * Time elapsed since last call to `start()`.
     * @returns elapsed milliseconds. `-1` is returned when `start()`was never called.
     */
    get elapsedTime(): number;


    /**
     * Number of calls to `start()`.
     */
    get attempts(): number;


    /**
     * Number of calls to `end()`.
     */
    get successfulAttempts(): number;


    /**
     * Number of calls to `abort()`.
     */
    get failedAttempts(): number;

}