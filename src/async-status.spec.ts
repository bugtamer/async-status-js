import {AsyncStatus } from './async-status';


const OVERFLOW_ERROR_PATTERN = /overflow/i;
const START_ERROR_PATTERN = /start\(\)/i;
const END_ERROR_PATTERN = /end\(\)/i;
const ABORT_ERROR_PATTERN = /abort\(\)/i;

class AsyncStatusOverflowCase extends AsyncStatus {
  setAttemptCount(newCount: number): void {
    this._attemptCount = newCount;
  }
}

function delay(timeout: number, callback: Function): Promise<void> {
  return new Promise(  (resolve) => setTimeout(callback, timeout)  );
}


describe("AsyncStatus throws an Error when", function() {

  it("attemptCount overflows: 9_007_199_254_740_991 * {start() --> [end() | abort()]} --> start()", function() {
    const sut = new AsyncStatusOverflowCase();
    sut.start();
    sut.end();
    sut.setAttemptCount(Number.MAX_SAFE_INTEGER); // to test an (nearly) unreachable condition
    const fn = () => sut.start();
    expect(fn).toThrowError(OVERFLOW_ERROR_PATTERN);
  });


  it("start() was never called but end() was: new AsyncStatus() --> end()", function() {
    const sut = new AsyncStatus();
    // nothing is already running
    expect(sut.isIdle).toBe(true);
    const fn = () => sut.end();
    expect(fn).toThrowError(END_ERROR_PATTERN);
  });


  it("start() was never called but abort() was: new AsyncStatus() --> abort()", function() {
    const sut = new AsyncStatus();
    // nothing is already running
    expect(sut.isIdle).toBe(true);
    const fn = () => sut.abort();
    expect(fn).toThrowError(ABORT_ERROR_PATTERN);
  });


  it("start() is called in isOngoing state: start() --> start()", function() {
    const sut = new AsyncStatus();
    sut.start();
    // async process
    expect(sut.isOngoing).toBe(true);
    const fn = () => sut.start();
    expect(fn).toThrowError(START_ERROR_PATTERN);
  });


  it("end() is called in isIdle state: start() --> end() --> end()", function() {
    const sut = new AsyncStatus();
    sut.start();
    // async process
    sut.end();
    expect(sut.isIdle).toBe(true);
    const fn = () => sut.end();
    expect(fn).toThrowError(END_ERROR_PATTERN);
  });


  it("abort() is called in isIdle state: start() --> abort() --> abort()", function() {
    const sut = new AsyncStatus();
    sut.start();
    // async process
    sut.abort();
    expect(sut.isIdle).toBe(true);
    const fn = () => sut.abort();
    expect(fn).toThrowError(ABORT_ERROR_PATTERN);
  });


  it("abort() is called in isIdle state: start() --> end() --> abort()", function() {
    const sut = new AsyncStatus();
    sut.start();
    // async process
    sut.end();
    expect(sut.isIdle).toBe(true);
    const fn = () => sut.abort();
    expect(fn).toThrowError(ABORT_ERROR_PATTERN);
  });


  it("end() is called in isIdle state: start() --> abort() --> end()", function() {
    const sut = new AsyncStatus();
    sut.start();
    // async process
    sut.abort();
    expect(sut.isIdle).toBe(true);
    const fn = () => sut.end();
    expect(fn).toThrowError(END_ERROR_PATTERN);
  });

});





describe("AsyncStatus timeElapse", function() {
  const milliseconds = 10;

  it("should be -1 just after instantiation", function() {
    const sut = new AsyncStatus();
    expect(sut.elapsedTime).toEqual(-1);
  });


  it("should return approximately the elapse time between start() and end() calls", function() {
    const sut = new AsyncStatus();
    sut.start();
    delay(milliseconds, () => {
      sut.end()
      expect(sut.elapsedTime).toBeGreaterThanOrEqual(milliseconds);
    });
  });


  it("should return approximately the time elapsed since the call of start() and abort()", function() {
    const sut = new AsyncStatus();
    sut.start();
    delay(milliseconds, () => {
      sut.abort()
      expect(sut.elapsedTime).toBeGreaterThanOrEqual(milliseconds);
    });
  });


  it("should return roughly the time elapsed since start(), .elapsedTime and end(): start() --> .elapsedTime --> end() --> .elapsedTime", function() {
    const sut = new AsyncStatus();
    sut.start();
    delay(milliseconds, () => {
      expect(sut.elapsedTime).toBeGreaterThanOrEqual(milliseconds);
      expect(sut.elapsedTime).toBeLessThan(2 * milliseconds);
      delay(milliseconds, () => {
        sut.end();
        expect(sut.elapsedTime).toBeGreaterThanOrEqual(2 * milliseconds);
      });
    });
  });


  it("should return roughly the time elapsed since start(), .elapsedTime and abort(): start() --> .elapsedTime --> abort() --> .elapsedTime", function() {
    const sut = new AsyncStatus();
    sut.start();
    delay(milliseconds, async () => {
      expect(sut.elapsedTime).toBeGreaterThanOrEqual(milliseconds);
      expect(sut.elapsedTime).toBeLessThan(2 * milliseconds);
      delay(milliseconds, () => {
        sut.abort()
        expect(sut.elapsedTime).toBeGreaterThanOrEqual(2 * milliseconds);
      });
    });
  });

});





describe("AsyncStatus when there is zero calls of start(), end() or abort()", function() {
  const sut = new AsyncStatus();

  it("attempts = 0", function() {
    expect(sut.attempts).toEqual(0);
  });


  it("successfulAttempts = 0", function() {
    expect(sut.successfulAttempts).toEqual(0);
  });


  it("failedAttempts = 0", function() {
    expect(sut.failedAttempts).toEqual(0);
  });


  it("elapsedTime = -1", function() {
    expect(sut.elapsedTime).toEqual(-1);
  });


  it("isIdle = true", function() {
    expect(sut.isIdle).toBe(true);
  });


  it("isOngoing = false", function() {
    expect(sut.isOngoing).toBe(false);
  });


  it("wasSuccessful = false", function() {
    expect(sut.wasSuccessful).toBe(false);
  });


  it("wasFailed = false", function() {
    expect(sut.wasFailed).toBe(false);
  });

});





describe("AsyncStatus when resetAttemptStats() is called", function() {
  const sut = new AsyncStatus();
  sut.start();
  // async process
  sut.end();
  sut.start();
  // async process
  sut.abort();
  sut.resetAttemptStats();

  it("attempts = 0", function() {
    expect(sut.attempts).toEqual(0);
  });

  it("successfulAttempts = 0", function() {
    expect(sut.successfulAttempts).toEqual(0);
  });

  it("failedAttempts = 0", function() {
    expect(sut.failedAttempts).toEqual(0);
  });

  it("wasSuccessful = false: after abort() call", function() {
    expect(sut.wasSuccessful).toEqual(false);
  });

  it("wasFailed = true: after abort() call", function() {
    expect(sut.wasFailed).toEqual(true);
  });

  it("wasSuccessful = true: after end() call", function() {
    const sut = new AsyncStatus();
    sut.start();
    // async process
    sut.end();
    sut.resetAttemptStats();
      expect(sut.wasSuccessful).toEqual(true);
  });

  it("wasFailed = false: after end() call", function() {
    const sut = new AsyncStatus();
    sut.start();
    // async process
    sut.end();
    sut.resetAttemptStats();
    expect(sut.wasFailed).toEqual(false);
  });

});





describe("AsyncStatus when start() was called", function() {
  const sut = new AsyncStatus();
  sut.start();
  // async process

  it("attempts = 1", function() {
    expect(sut.attempts).toEqual(1);
  });


  it("successfulAttempts = 0", function() {
    expect(sut.successfulAttempts).toEqual(0);
  });


  it("failedAttempts = 0", function() {
    expect(sut.failedAttempts).toEqual(0);
  });


  it("elapsedTime >= 0", function() {
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0); // there is no time consuming process
  });


  it("isIdle = false", function() {
    expect(sut.isIdle).toBe(false);
  });


  it("isOngoing = true", function() {
    expect(sut.isOngoing).toBe(true);
  });


  it("wasSuccessful = false", function() {
    expect(sut.wasSuccessful).toBe(false);
  });


  it("wasFailed = false", function() {
    expect(sut.wasFailed).toBe(false);
  });

});





describe("AsyncStatus when start() --> abort() were called", function() {
  const sut = new AsyncStatus();
  sut.start();
  // async process
  sut.abort();

  it("attempts = 1", function() {
    expect(sut.attempts).toEqual(1);
  });


  it("successfulAttempts = 0", function() {
    expect(sut.successfulAttempts).toEqual(0);
  });


  it("failedAttempts = 1", function() {
    expect(sut.failedAttempts).toEqual(1);
  });


  it("elapsedTime >= 0", function() {
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0); // there is no time consuming process
  });


  it("isIdle = true", function() {
    expect(sut.isIdle).toBe(true);
  });


  it("isOngoing = false", function() {
    expect(sut.isOngoing).toBe(false);
  });


  it("wasSuccessful = false", function() {
    expect(sut.wasSuccessful).toBe(false);
  });


  it("wasFailed = true", function() {
    expect(sut.wasFailed).toBe(true);
  });

});





describe("AsyncStatus when start() --> end() were called", function() {
  const sut = new AsyncStatus();
  sut.start();
  // async process
  sut.end();

  it("attempts = 1", function() {
    expect(sut.attempts).toEqual(1);
  });


  it("successfulAttempts = 1", function() {
    expect(sut.successfulAttempts).toEqual(1);
  });


  it("failedAttempts = 0", function() {
    expect(sut.failedAttempts).toEqual(0);
  });


  it("elapsedTime >= 0", function() {
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0); // there is no time consuming process
  });


  it("isIdle = true", function() {
    expect(sut.isIdle).toBe(true);
  });


  it("isOngoing = false", function() {
    expect(sut.isOngoing).toBe(false);
  });


  it("wasSuccessful = true", function() {
    expect(sut.wasSuccessful).toBe(true);
  });


  it("wasFailed = false", function() {
    expect(sut.wasFailed).toBe(false);
  });

});





describe("AsyncStatus when start() --> end() --> start() were called", function() {
  const sut = new AsyncStatus();
  sut.start();
  // async process
  sut.end();
  sut.start();
  // async process

  it("attempts = 2", function() {
    expect(sut.attempts).toEqual(2);
  });


  it("successfulAttempts = 1", function() {
    expect(sut.successfulAttempts).toEqual(1);
  });


  it("failedAttempts = 0", function() {
    expect(sut.failedAttempts).toEqual(0);
  });


  it("elapsedTime >= 0", function() {
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0); // there is no time consuming process
  });


  it("isIdle = false", function() {
    expect(sut.isIdle).toBe(false);
  });


  it("isOngoing = true", function() {
    expect(sut.isOngoing).toBe(true);
  });


  it("wasSuccessful = false", function() {
    expect(sut.wasSuccessful).toBe(false);
  });


  it("wasFailed = false", function() {
    expect(sut.wasFailed).toBe(false);
  });

});





describe("AsyncStatus when start() --> end() --> start() --> end() were called", function() {
  const sut = new AsyncStatus();
  sut.start();
  // async process
  sut.end();
  sut.start();
  // async process
  sut.end();

  it("attempts = 2", function() {
    expect(sut.attempts).toEqual(2);
  });


  it("successfulAttempts = 2", function() {
    expect(sut.successfulAttempts).toEqual(2);
  });


  it("failedAttempts = 0", function() {
    expect(sut.failedAttempts).toEqual(0);
  });


  it("elapsedTime >= 0", function() {
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0); // there is no time consuming process
  });


  it("isIdle = true", function() {
    expect(sut.isIdle).toBe(true);
  });


  it("isOngoing = false", function() {
    expect(sut.isOngoing).toBe(false);
  });


  it("wasSuccessful = true", function() {
    expect(sut.wasSuccessful).toBe(true);
  });


  it("wasFailed = false", function() {
    expect(sut.wasFailed).toBe(false);
  });

});





describe("AsyncStatus when start() --> end() --> start() --> abort() were called", function() {
  const sut = new AsyncStatus();
  sut.start();
  // async process
  sut.end();
  sut.start();
  // async process
  sut.abort();

  it("attempts = 2", function() {
    expect(sut.attempts).toEqual(2);
  });


  it("successfulAttempts = 1", function() {
    expect(sut.successfulAttempts).toEqual(1);
  });


  it("failedAttempts = 1", function() {
    expect(sut.failedAttempts).toEqual(1);
  });


  it("elapsedTime >= 0", function() {
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0); // there is no time consuming process
  });


  it("isIdle = true", function() {
    expect(sut.isIdle).toBe(true);
  });


  it("isOngoing = false", function() {
    expect(sut.isOngoing).toBe(false);
  });


  it("wasSuccessful = false", function() {
    expect(sut.wasSuccessful).toBe(false);
  });


  it("wasFailed = true", function() {
    expect(sut.wasFailed).toBe(true);
  });

});





describe("AsyncStatus when start() --> abort() --> start() --> abort() were called", function() {
  const sut = new AsyncStatus();
  sut.start();
  // async process
  sut.abort();
  sut.start();
  // async process
  sut.abort();

  it("attempts = 2", function() {
    expect(sut.attempts).toEqual(2);
  });


  it("successfulAttempts = 0", function() {
    expect(sut.successfulAttempts).toEqual(0);
  });


  it("failedAttempts = 2", function() {
    expect(sut.failedAttempts).toEqual(2);
  });


  it("elapsedTime >= 0", function() {
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0); // there is no time consuming process
  });


  it("isIdle = true", function() {
    expect(sut.isIdle).toBe(true);
  });


  it("isOngoing = false", function() {
    expect(sut.isOngoing).toBe(false);
  });


  it("wasSuccessful = false", function() {
    expect(sut.wasSuccessful).toBe(false);
  });


  it("wasFailed = true", function() {
    expect(sut.wasFailed).toBe(true);
  });

});