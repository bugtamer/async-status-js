import { AsyncStatus } from './async-status.model';


describe("AsyncStatus throws an Error when", function() {

  it("start() is never called and end() is called", function() { 
    const sut = new AsyncStatus();
    // nothing is already running
    expect(sut.isIdle).toBe(true);
    expect(sut.end).toThrowError();
  });


  it("start() is never called and abort() does", function() { 
    const sut = new AsyncStatus();
    // nothing is already running
    expect(sut.isIdle).toBe(true);
    expect(sut.abort).toThrowError();
  });


  it("start() is called in isOngoing state", function() { 
    const sut = new AsyncStatus();
    sut.start();
    // async process
    expect(sut.isOngoing).toBe(true);
    expect(sut.start).toThrowError();
  });


  it("start() --> end() --> end()", function() { 
    const sut = new AsyncStatus();
    sut.start();
    // async process
    sut.end();
    expect(sut.isIdle).toBe(true);
    expect(sut.end).toThrowError();
  });


  it("start() --> abort() --> abort()", function() { 
    const sut = new AsyncStatus();
    sut.start();
    // async process
    sut.abort();
    expect(sut.isIdle).toBe(true);
    expect(sut.abort).toThrowError();
  });


  it("start() --> end() --> abort()", function() { 
    const sut = new AsyncStatus();
    sut.start();
    // async process
    sut.end();
    expect(sut.isIdle).toBe(true);
    expect(sut.abort).toThrowError();
  });


  it("start() --> abort() --> end()", function() { 
    const sut = new AsyncStatus();
    sut.start();
    // async process
    sut.abort();
    expect(sut.isIdle).toBe(true);
    expect(sut.end).toThrowError();
  });

});





describe("AsyncStatus when there is zero calls", function() {
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


  it("elapsedTime = -1", function() {
    expect(sut.elapsedTime).toEqual(-1);
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
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0);
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
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0);
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


  it("elapsedTime = -1", function() {
    expect(sut.elapsedTime).toEqual(-1);
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
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0);
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
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0);
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
    expect(sut.elapsedTime).toBeGreaterThanOrEqual(0);
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