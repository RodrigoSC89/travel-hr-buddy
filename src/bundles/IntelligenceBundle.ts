/**
 * Intelligence Bundle
 * PATCH 540 Fase 5 - Agrupa módulos de inteligência e IA para reduzir lazy loading
 */

import { lazy } from "react";

// Intelligence & AI modules - Lazy loaded as bundle
export const AutomationModule = lazy(() => import("@/modules/intelligence/automation"));
export const RiskManagementModule = lazy(() => import("@/modules/emergency/risk-management"));
export const AnalyticsCoreModule = lazy(() => import("@/modules/intelligence/analytics-core"));
export const VoiceAssistantModule = lazy(() => import("@/modules/assistants/voice-assistant"));
export const NotificationsCenterModule = lazy(() => import("@/modules/connectivity/notifications-center"));
export const AIModulesStatus = lazy(() => import("@/pages/AIModulesStatus"));
export const SonarAI = lazy(() => import("@/modules/sonar-ai"));
export const IncidentReplayAI = lazy(() => import("@/modules/incident-replay"));
export const AIVisionCore = lazy(() => import("@/modules/ai-vision-core"));
export const FinanceHub = lazy(() => import("@/modules/finance-hub"));
export const APIGateway = lazy(() => import("@/modules/connectivity/api-gateway"));
export const APIGatewayDocs = lazy(() => import("@/pages/api-gateway-docs"));
export const ExecutiveReport = lazy(() => import("@/pages/ExecutiveReport"));
