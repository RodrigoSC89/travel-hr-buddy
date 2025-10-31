/**
 * Mission Bundle
 * PATCH 540 Fase 5 - Agrupa componentes de missões e controle para reduzir lazy loading
 */

import { lazy } from "react";

// Mission control & operations - Lazy loaded as bundle
export const MissionEngine = lazy(() => import("@/modules/mission-engine"));
export const InsightDashboard = lazy(() => import("@/pages/mission-control/insight-dashboard"));
export const AutonomyConsole = lazy(() => import("@/pages/mission-control/autonomy"));
export const AICommandCenter = lazy(() => import("@/pages/mission-control/ai-command-center"));
export const WorkflowEngine = lazy(() => import("@/pages/mission-control/workflow-engine"));
export const NautilusLLM = lazy(() => import("@/pages/mission-control/nautilus-llm"));
export const ThoughtChain = lazy(() => import("@/pages/mission-control/thought-chain"));
export const MissionLogs = lazy(() => import("@/pages/MissionLogsPage"));
export const DroneCommander = lazy(() => import("@/pages/DroneCommander"));
export const SensorsHubPage = lazy(() => import("@/pages/SensorsHub"));
export const SatcomPage = lazy(() => import("@/pages/Satcom"));
export const NautilusOS = lazy(() => import("@/pages/NautilusOS"));
