/**
 * Developer Bundle
 * PATCH 540 Fase 4 - Agrupa ferramentas de desenvolvedor para reduzir lazy loading
 */

import { lazy } from "react";

// Developer tools - Lazy loaded as bundle
export const DeveloperStatus = lazy(() => import("@/pages/developer/status"));
export const ModuleStatus = lazy(() => import("@/pages/developer/ModuleStatus"));
export const TestsDashboard = lazy(() => import("@/pages/developer/TestsDashboard"));
export const ModuleHealth = lazy(() => import("@/pages/developer/module-health"));
export const WatchdogMonitor = lazy(() => import("@/pages/developer/watchdog-monitor"));
export const ExecutionLogs = lazy(() => import("@/pages/admin/automation/execution-logs"));
export const RestoreReportLogs = lazy(() => import("@/pages/admin/reports/logs"));
export const AssistantReportLogs = lazy(() => import("@/pages/admin/reports/assistant"));
