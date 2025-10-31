/**
 * Operations Bundle
 * PATCH 540 Fase 5 - Agrupa componentes operacionais para reduzir lazy loading
 */

import { lazy } from "react";

// Operational components - Lazy loaded as bundle
export const RealTimeWorkspace = lazy(() => import("@/modules/workspace/real-time-workspace"));
export const ChannelManager = lazy(() => import("@/modules/connectivity/channel-manager"));
export const TrainingAcademy = lazy(() => import("@/modules/hr/training-academy"));
export const MaintenancePlanner = lazy(() => import("@/modules/maintenance-planner"));
export const TravelManagementPage = lazy(() => import("@/pages/TravelManagementPage"));
export const FuelOptimizer = lazy(() => import("@/modules/logistics/fuel-optimizer"));
export const WeatherDashboard = lazy(() => import("@/modules/weather-dashboard"));
export const VoyagePlanner = lazy(() => import("@/modules/planning/voyage-planner"));
export const TaskAutomation = lazy(() => import("@/modules/task-automation"));
export const AuditCenter = lazy(() => import("@/modules/compliance/audit-center"));
export const PEOTRAM = lazy(() => import("@/pages/PEOTRAM"));
export const CrewWellbeing = lazy(() => import("@/modules/operations/crew-wellbeing"));
export const SatelliteTracker = lazy(() => import("@/modules/logistics/satellite-tracker"));
export const ProjectTimeline = lazy(() => import("@/modules/project-timeline"));
export const UserManagement = lazy(() => import("@/modules/user-management"));
