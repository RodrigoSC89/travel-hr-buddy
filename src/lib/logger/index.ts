/**
 * PATCH 186.0 - Logger Module Export
 */

export { structuredLogger } from './structured-logger';
export type { LogEntry, LogLevel } from './structured-logger';

// Re-export existing logger for backwards compatibility
export { logger } from '../logger';
