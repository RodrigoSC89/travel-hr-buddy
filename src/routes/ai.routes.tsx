/**
 * AI Module Routes
 * All AI-related pages and features
 */
import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import {
  RevolutionaryAI,
  AIEnhancedModules,
  AIOperationsCenter,
  AIObservabilityDashboard,
  SelfHealingLogs,
  AIHubPage,
  AIAnalyticsDashboard,
  VisionAI,
  VoiceAssistant,
  VoiceTranscriber,
  AutonomousCommandCenter,
} from "./lazy-imports";

// Lazy load new AI pages
const NautiBrainPage = lazy(() => import("@/pages/ai/NautiBrainPage"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

export const aiRoutes = (
  <>
    <Route path="revolutionary-ai/*" element={<RevolutionaryAI />} />
    <Route path="ai-modules" element={<AIEnhancedModules />} />
    <Route path="ai-operations-center" element={<AIOperationsCenter />} />
    <Route path="ai-observability" element={<AIObservabilityDashboard />} />
    <Route path="ai-ops/logs" element={<SelfHealingLogs />} />
    <Route path="ai-hub" element={<AIHubPage />} />
    <Route path="ai-analytics" element={<AIAnalyticsDashboard />} />
    <Route path="vision-ai" element={<VisionAI />} />
    <Route path="voice-assistant" element={<VoiceAssistant />} />
    <Route path="voice-transcriber" element={<VoiceTranscriber />} />
    <Route path="autonomous-command" element={<AutonomousCommandCenter />} />
    <Route 
      path="nauti-brain" 
      element={
        <Suspense fallback={<LoadingFallback />}>
          <NautiBrainPage />
        </Suspense>
      } 
    />
  </>
);
