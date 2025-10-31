/**
 * Admin Bundle
 * PATCH 540 Fase 4 - Agrupa componentes administrativos para reduzir lazy loading
 */

import { lazy } from "react";

// Admin core pages - Lazy loaded as bundle
export const APITester = lazy(() => import("@/pages/admin/api-tester"));
export const APIStatus = lazy(() => import("@/pages/admin/api-status"));
export const ControlPanel = lazy(() => import("@/pages/admin/control-panel"));
export const TestDashboard = lazy(() => import("@/pages/admin/tests"));
export const CIHistory = lazy(() => import("@/pages/admin/ci-history"));
export const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
export const AdminBI = lazy(() => import("@/pages/admin/bi"));
export const AdminWall = lazy(() => import("@/pages/admin/wall"));
export const AdminChecklists = lazy(() => import("@/pages/admin/checklists"));
export const AdminChecklistsDashboard = lazy(() => import("@/pages/admin/checklists-dashboard"));
export const SystemHealth = lazy(() => import("@/pages/admin/system-health"));
export const Forecast = lazy(() => import("@/pages/admin/forecast"));
export const DocumentsAI = lazy(() => import("@/pages/admin/documents-ai"));
export const DocumentAIEditor = lazy(() => import("@/pages/admin/documents/ai-editor"));
export const Assistant = lazy(() => import("@/pages/admin/assistant"));
export const AssistantLogs = lazy(() => import("@/pages/admin/assistant-logs"));
export const AdminCollaboration = lazy(() => import("@/pages/admin/collaboration"));
