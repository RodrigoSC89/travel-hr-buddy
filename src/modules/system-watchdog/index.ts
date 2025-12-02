/**
 * PATCH 93.0 - System Watchdog Module
 * Entry point for the autonomous monitoring module
 */

import SystemWatchdog from "./SystemWatchdog";
export { SystemWatchdog };
export { watchdogService } from "./watchdog-service";
export type { HealthCheckResult, WatchdogEvent } from "./watchdog-service";
export default SystemWatchdog;
