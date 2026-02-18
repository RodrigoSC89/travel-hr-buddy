/**
 * NAUTI ONE — Integration Module Index
 * Central export point for the auto-integration system
 */

export { installAutoIntegration } from './install-auto-integration';
export { interceptMutation, TABLE_EVENT_MAP } from './auto-integration-interceptor';
export { executeSideEffects, getSideEffectStats } from './cross-module-side-effects';
export type { TableEventMapping } from './auto-integration-interceptor';
