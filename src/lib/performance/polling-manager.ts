/**
 * Polling Manager - PATCH 651.0
 * Centralized polling management to prevent multiple intervals
 */

import { logger } from "@/lib/logger";

interface PollConfig {
  id: string;
  callback: () => void | Promise<void>;
  interval: number;
  immediate?: boolean;
  enabled?: boolean;
}

interface ActivePoll {
  id: string;
  intervalId: number;
  callback: () => void | Promise<void>;
  interval: number;
  startedAt: Date;
  lastRun: Date | null;
  runCount: number;
}

class PollingManager {
  private polls = new Map<string, ActivePoll>();
  private pageVisible = true;
  private online = true;

  constructor() {
    // Pause polling when page is hidden
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        this.pageVisible = !document.hidden;
        if (this.pageVisible) {
          logger.info("Page visible - resuming polling");
          this.resumeAll();
        } else {
          logger.info("Page hidden - pausing polling");
          this.pauseAll();
        }
      });
    }

    // Pause polling when offline
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.online = true;
        logger.info("Online - resuming polling");
        this.resumeAll();
      });

      window.addEventListener("offline", () => {
        this.online = false;
        logger.info("Offline - pausing polling");
        this.pauseAll();
      });
    }
  }

  /**
   * Register a new polling operation
   */
  register(config: PollConfig): () => void {
    const { id, callback, interval, immediate = false, enabled = true } = config;

    // Don't register if disabled
    if (!enabled) {
      return () => {};
    }

    // Stop existing poll with same ID
    this.stop(id);

    // Run immediately if requested
    if (immediate && this.shouldPoll()) {
      this.runCallback(id, callback);
    }

    // Start interval
    const intervalId = window.setInterval(() => {
      if (this.shouldPoll()) {
        this.runCallback(id, callback);
      }
    }, interval);

    // Store poll info
    this.polls.set(id, {
      id,
      intervalId,
      callback,
      interval,
      startedAt: new Date(),
      lastRun: immediate ? new Date() : null,
      runCount: immediate ? 1 : 0,
    });

    logger.debug(`Registered poll: ${id} (interval: ${interval}ms)`);

    // Return cleanup function
    return () => this.stop(id);
  }

  /**
   * Stop a specific poll
   */
  stop(id: string): void {
    const poll = this.polls.get(id);
    if (poll) {
      clearInterval(poll.intervalId);
      this.polls.delete(id);
      logger.debug(`Stopped poll: ${id}`);
    }
  }

  /**
   * Stop all polls
   */
  stopAll(): void {
    this.polls.forEach((poll) => {
      clearInterval(poll.intervalId);
    });
    this.polls.clear();
    logger.info("Stopped all polls");
  }

  /**
   * Pause all polls (without stopping)
   */
  private pauseAll(): void {
    // Intervals continue but callbacks won't run
    logger.debug(`Paused ${this.polls.size} polls`);
  }

  /**
   * Resume all polls
   */
  private resumeAll(): void {
    // Run all callbacks immediately on resume
    if (this.shouldPoll()) {
      this.polls.forEach((poll) => {
        this.runCallback(poll.id, poll.callback);
      });
    }
    logger.debug(`Resumed ${this.polls.size} polls`);
  }

  /**
   * Check if we should run polls
   */
  private shouldPoll(): boolean {
    return this.pageVisible && this.online;
  }

  /**
   * Run a callback and track metrics
   */
  private async runCallback(id: string, callback: () => void | Promise<void>): Promise<void> {
    const poll = this.polls.get(id);
    if (!poll) return;

    try {
      const startTime = Date.now();
      await callback();
      const duration = Date.now() - startTime;

      // Update metrics
      poll.lastRun = new Date();
      poll.runCount++;

      if (duration > 1000) {
        logger.warn(`Slow poll detected: ${id} (${duration}ms)`);
      }
    } catch (error) {
      logger.error(`Poll error: ${id}`, error);
    }
  }

  /**
   * Get statistics about active polls
   */
  getStats() {
    const stats = Array.from(this.polls.values()).map((poll) => ({
      id: poll.id,
      interval: poll.interval,
      startedAt: poll.startedAt,
      lastRun: poll.lastRun,
      runCount: poll.runCount,
      uptime: Date.now() - poll.startedAt.getTime(),
    }));

    return {
      total: this.polls.size,
      active: this.shouldPoll() ? this.polls.size : 0,
      paused: !this.shouldPoll() ? this.polls.size : 0,
      polls: stats,
    };
  }

  /**
   * Force run a specific poll immediately
   */
  async runNow(id: string): Promise<void> {
    const poll = this.polls.get(id);
    if (poll && this.shouldPoll()) {
      await this.runCallback(id, poll.callback);
    }
  }
}

// Export singleton
export const pollingManager = new PollingManager();

// Expose to window for debugging
if (typeof window !== "undefined") {
  (window as any).__NAUTILUS_POLLING__ = pollingManager;
}
