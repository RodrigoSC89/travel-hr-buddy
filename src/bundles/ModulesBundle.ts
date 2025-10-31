/**
 * Modules Bundle
 * PATCH 540 - Agrupa módulos para reduzir lazy loading
 */

import { lazy } from "react";

// Módulos agrupados com lazy loading otimizado
export const FeedbackModule = lazy(() => import("@/modules/operations/feedback"));
export const FleetModule = lazy(() => import("@/modules/fleet"));
export const PerformanceModule = lazy(() => import("@/modules/operations/performance"));
export const ReportsModule = lazy(() => import("@/modules/compliance/reports"));
export const IncidentReports = lazy(() => import("@/modules/incident-reports"));
export const ComplianceHubModule = lazy(() => import("@/modules/compliance/compliance-hub"));
export const AIInsights = lazy(() => import("@/modules/intelligence/ai-insights"));
export const OperationsDashboard = lazy(() => import("@/modules/operations/operations-dashboard"));
export const LogisticsHub = lazy(() => import("@/modules/logistics/logistics-hub"));
export const CrewManagement = lazy(() => import("@/modules/crew"));
export const EmergencyResponse = lazy(() => import("@/modules/emergency/emergency-response"));
export const MissionControl = lazy(() => import("@/modules/emergency/mission-control"));
