/**
 * DP Intelligence Module - Consolidated
 * 
 * Central module for Dynamic Positioning intelligence analysis,
 * incident management, and AI-powered insights.
 * 
 * @module dp-intelligence
 * @version 2.0.0
 * @since PATCH 90.0
 */

// Main Components
export { default as DPIntelligenceCenter } from './components/DPIntelligenceCenter';
export { default as DPAIAnalyzer } from './components/DPAIAnalyzer';
export { default as DPIntelligenceDashboard } from './components/DPIntelligenceDashboard';
export { default as DPOverview } from './components/DPOverview';
export { default as DPRealtime } from './components/DPRealtime';

// Re-export default as main entry point
export { default } from './components/DPIntelligenceCenter';
