/**
 * Request Idle Callback Polyfill and Utilities
 * For scheduling non-critical work during idle time
 */

// Polyfill for requestIdleCallback
export const requestIdleCallback = 
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback): number => {
      const start = Date.now();
      return window.setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        });
      }, 1);
    };

export const cancelIdleCallback =
  typeof window !== "undefined" && "cancelIdleCallback" in window
    ? window.cancelIdleCallback
    : (id: number): void => {
      clearTimeout(id);
    };

/**
 * Schedule work during idle time
 */
export function scheduleIdleWork(
  work: () => void,
  options: { timeout?: number } = {}
): number {
  return requestIdleCallback(
    (deadline) => {
      // Only run if we have enough time or already timed out
      if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
        work();
      }
    },
    { timeout: options.timeout || 2000 }
  );
}

/**
 * Batch multiple idle tasks
 */
export function batchIdleTasks(
  tasks: Array<() => void>,
  options: { minTimePerTask?: number; timeout?: number } = {}
): number {
  const { minTimePerTask = 5, timeout = 5000 } = options;
  let taskIndex = 0;

  const runTasks = (deadline: IdleDeadline) => {
    while (
      taskIndex < tasks.length &&
      (deadline.timeRemaining() >= minTimePerTask || deadline.didTimeout)
    ) {
      try {
        tasks[taskIndex]();
      } catch (error) {
        console.error("Error in idle task:", error);
      }
      taskIndex++;
    }

    // Schedule remaining tasks
    if (taskIndex < tasks.length) {
      requestIdleCallback(runTasks, { timeout });
    }
  };

  return requestIdleCallback(runTasks, { timeout });
}

/**
 * Defer non-critical initialization
 */
export function deferInit(initFn: () => void | Promise<void>, delay = 0): void {
  if (delay > 0) {
    setTimeout(() => {
      scheduleIdleWork(() => {
        Promise.resolve(initFn()).catch(console.error);
      });
    }, delay);
  } else {
    scheduleIdleWork(() => {
      Promise.resolve(initFn()).catch(console.error);
    });
  }
}

/**
 * Wait for idle time before executing
 */
export function whenIdle(timeout = 2000): Promise<void> {
  return new Promise((resolve) => {
    requestIdleCallback(
      () => resolve(),
      { timeout }
    );
  });
}

export default {
  requestIdleCallback,
  cancelIdleCallback,
  scheduleIdleWork,
  batchIdleTasks,
  deferInit,
  whenIdle,
};
