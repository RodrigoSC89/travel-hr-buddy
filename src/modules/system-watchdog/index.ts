/**
 * PATCH 93.0 - System Watchdog Module
 * Entry point for the autonomous monitoring module
 */

export { default as SystemWatchdog } from "./SystemWatchdog";
export { watchdogService } from "./watchdog-service";
export type { HealthCheckResult, WatchdogEvent } from "./watchdog-service";
