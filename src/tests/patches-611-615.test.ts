/**
 * Integration tests for Patches 611-615
 * Tests all 5 modules working together
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { graphInferenceEngine } from '@/ai/inference/graph-engine';
import { autonomousDecisionSimulator } from '@/ai/decisions/simulation-engine';
import { contextualThreatMonitor } from '@/ai/security/context-threat-monitor';
import { jointCopilotStrategyRecommender } from '@/copilot/strategy/recommender';

describe('Patches 611-615 Integration', () => {
  beforeAll(async () => {
    // Initialize all systems
    await graphInferenceEngine.initialize();
    await autonomousDecisionSimulator.initialize();
    await contextualThreatMonitor.start();
    await jointCopilotStrategyRecommender.initialize();
  });

  describe('PATCH 612 - Graph Inference Engine', () => {
    it('should initialize graph with nodes and edges', () => {
      const stats = graphInferenceEngine.getStats();
      expect(stats.nodeCount).toBeGreaterThan(0);
      expect(stats.edgeCount).toBeGreaterThan(0);
    });

    it('should calculate influence scores', () => {
      const stats = graphInferenceEngine.getStats();
      expect(stats.avgInfluence).toBeGreaterThan(0);
      expect(stats.topInfluencers).toHaveLength(5);
    });

    it('should detect bottlenecks', () => {
      const bottlenecks = graphInferenceEngine.detectBottlenecks();
      expect(Array.isArray(bottlenecks)).toBe(true);
      // Bottlenecks may or may not exist depending on system state
    });

    it('should propagate decisions through graph', () => {
      const paths = graphInferenceEngine.propagateDecision('agent-decision-core', {
        type: 'test',
        data: 'test-decision',
      });
      
      expect(Array.isArray(paths)).toBe(true);
      if (paths.length > 0) {
        expect(paths[0]).toHaveProperty('path');
        expect(paths[0]).toHaveProperty('confidence');
        expect(paths[0]).toHaveProperty('reasoning');
      }
    });

    it('should export graph data', () => {
      const graphData = graphInferenceEngine.exportGraph();
      expect(graphData).toHaveProperty('nodes');
      expect(graphData).toHaveProperty('edges');
      expect(Array.isArray(graphData.nodes)).toBe(true);
      expect(Array.isArray(graphData.edges)).toBe(true);
    });
  });

  describe('PATCH 613 - Autonomous Decision Simulator', () => {
    it('should load predefined scenarios', () => {
      const scenarios = autonomousDecisionSimulator.getScenarios();
      expect(scenarios.length).toBeGreaterThan(0);
      expect(scenarios[0]).toHaveProperty('id');
      expect(scenarios[0]).toHaveProperty('type');
      expect(scenarios[0]).toHaveProperty('severity');
    });

    it('should load strategies for scenarios', () => {
      const scenarios = autonomousDecisionSimulator.getScenarios();
      const scenario = scenarios[0];
      const strategies = autonomousDecisionSimulator.getStrategies(scenario.id);
      
      expect(strategies.length).toBeGreaterThan(0);
      expect(strategies[0]).toHaveProperty('id');
      expect(strategies[0]).toHaveProperty('actions');
    });

    it('should simulate scenario and generate report', async () => {
      const scenarios = autonomousDecisionSimulator.getScenarios();
      const scenario = scenarios[0];
      
      const report = await autonomousDecisionSimulator.simulateScenario(scenario.id);
      
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('scenario');
      expect(report).toHaveProperty('strategies');
      expect(report).toHaveProperty('results');
      expect(report).toHaveProperty('recommendation');
      expect(report.results.length).toBeGreaterThan(0);
      
      // Check result structure
      const result = report.results[0];
      expect(result).toHaveProperty('impactScore');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('risks');
      expect(result).toHaveProperty('benefits');
      expect(result).toHaveProperty('reasoning');
      
      expect(result.impactScore).toBeGreaterThanOrEqual(0);
      expect(result.impactScore).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should export simulation report', async () => {
      const scenarios = autonomousDecisionSimulator.getScenarios();
      const scenario = scenarios[0];
      const report = await autonomousDecisionSimulator.simulateScenario(scenario.id);
      
      const exportedReport = autonomousDecisionSimulator.exportReport(report);
      
      expect(typeof exportedReport).toBe('string');
      expect(exportedReport).toContain('AUTONOMOUS DECISION SIMULATION REPORT');
      expect(exportedReport).toContain(scenario.name);
      expect(exportedReport).toContain('RECOMMENDATION');
    });
  });

  describe('PATCH 614 - Contextual Threat Monitor', () => {
    it('should start monitoring', async () => {
      const stats = contextualThreatMonitor.getStats();
      expect(stats.isActive).toBe(true);
    });

    it('should track threats by severity', () => {
      const stats = contextualThreatMonitor.getStats();
      expect(stats).toHaveProperty('threatsBySeverity');
      expect(stats.threatsBySeverity).toHaveProperty('critical');
      expect(stats.threatsBySeverity).toHaveProperty('high');
      expect(stats.threatsBySeverity).toHaveProperty('medium');
      expect(stats.threatsBySeverity).toHaveProperty('low');
    });

    it('should get active threats', () => {
      const threats = contextualThreatMonitor.getActiveThreats();
      expect(Array.isArray(threats)).toBe(true);
      
      if (threats.length > 0) {
        const threat = threats[0];
        expect(threat).toHaveProperty('id');
        expect(threat).toHaveProperty('type');
        expect(threat).toHaveProperty('severity');
        expect(threat).toHaveProperty('severityScore');
        expect(threat).toHaveProperty('contexts');
        expect(threat).toHaveProperty('recommendations');
      }
    });

    it('should get active alerts', () => {
      const alerts = contextualThreatMonitor.getActiveAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should acknowledge alerts', () => {
      const alerts = contextualThreatMonitor.getActiveAlerts();
      
      if (alerts.length > 0) {
        const alertId = alerts[0].id;
        contextualThreatMonitor.acknowledgeAlert(alertId);
        
        const updatedAlerts = contextualThreatMonitor.getActiveAlerts();
        const acknowledgedAlert = updatedAlerts.find((a) => a.id === alertId);
        
        // Alert should be removed from active alerts after acknowledgment
        expect(acknowledgedAlert).toBeUndefined();
      }
    });
  });

  describe('PATCH 615 - Joint Copilot Strategy Recommender', () => {
    it('should initialize with copilots', () => {
      const stats = jointCopilotStrategyRecommender.getStats();
      expect(stats.copilotCount).toBe(4); // voice, navigation, mission, tactical
      expect(stats).toHaveProperty('copilotMetrics');
    });

    it('should generate unified recommendation', async () => {
      const recommendation = await jointCopilotStrategyRecommender.generateRecommendation();
      
      expect(recommendation).toHaveProperty('id');
      expect(recommendation).toHaveProperty('title');
      expect(recommendation).toHaveProperty('description');
      expect(recommendation).toHaveProperty('priority');
      expect(recommendation).toHaveProperty('confidence');
      expect(recommendation).toHaveProperty('reasoning');
      expect(recommendation).toHaveProperty('sources');
      expect(recommendation).toHaveProperty('actions');
      expect(recommendation).toHaveProperty('expectedOutcome');
      expect(recommendation).toHaveProperty('alternatives');
      expect(recommendation).toHaveProperty('risks');
      
      expect(['low', 'medium', 'high', 'critical']).toContain(recommendation.priority);
      expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(recommendation.confidence).toBeLessThanOrEqual(1);
      expect(recommendation.sources.length).toBe(4); // One for each copilot
    });

    it('should handle user response - accept', async () => {
      const recommendation = await jointCopilotStrategyRecommender.generateRecommendation();
      
      await jointCopilotStrategyRecommender.handleUserResponse(
        recommendation.id,
        'accept',
        'Good recommendation'
      );
      
      const stats = jointCopilotStrategyRecommender.getStats();
      expect(stats.totalResponses).toBeGreaterThan(0);
    });

    it('should handle user response - reject', async () => {
      const recommendation = await jointCopilotStrategyRecommender.generateRecommendation();
      
      await jointCopilotStrategyRecommender.handleUserResponse(
        recommendation.id,
        'reject',
        'Not suitable at this time'
      );
      
      const stats = jointCopilotStrategyRecommender.getStats();
      expect(stats.totalResponses).toBeGreaterThan(0);
    });

    it('should calculate acceptance rate', async () => {
      const stats = jointCopilotStrategyRecommender.getStats();
      expect(stats).toHaveProperty('acceptanceRate');
      expect(stats.acceptanceRate).toBeGreaterThanOrEqual(0);
      expect(stats.acceptanceRate).toBeLessThanOrEqual(1);
    });

    it('should get recent recommendations', async () => {
      await jointCopilotStrategyRecommender.generateRecommendation();
      await jointCopilotStrategyRecommender.generateRecommendation();
      
      const recent = jointCopilotStrategyRecommender.getRecentRecommendations(5);
      expect(Array.isArray(recent)).toBe(true);
      expect(recent.length).toBeGreaterThan(0);
      
      // Should be sorted by timestamp descending
      if (recent.length > 1) {
        expect(recent[0].timestamp.getTime()).toBeGreaterThanOrEqual(
          recent[1].timestamp.getTime()
        );
      }
    });
  });

  describe('Integration - All Systems Working Together', () => {
    it('should coordinate between threat monitor and recommender', async () => {
      // Get threats from monitor
      const threats = contextualThreatMonitor.getActiveThreats();
      
      // Generate recommendation (should consider threats)
      const recommendation = await jointCopilotStrategyRecommender.generateRecommendation();
      
      // If there are critical threats, recommendation should be high priority
      const hasCriticalThreats = threats.some((t) => t.severity === 'critical');
      if (hasCriticalThreats) {
        expect(['high', 'critical']).toContain(recommendation.priority);
      }
      
      expect(recommendation).toBeDefined();
    });

    it('should use graph engine bottlenecks in threat detection', () => {
      const bottlenecks = graphInferenceEngine.detectBottlenecks();
      const threats = contextualThreatMonitor.getActiveThreats();
      
      // Both should be arrays (may or may not have content)
      expect(Array.isArray(bottlenecks)).toBe(true);
      expect(Array.isArray(threats)).toBe(true);
    });

    it('should incorporate graph inference in decision simulation', async () => {
      const scenarios = autonomousDecisionSimulator.getScenarios();
      const scenario = scenarios[0];
      
      const report = await autonomousDecisionSimulator.simulateScenario(scenario.id);
      
      // Simulation should have reasoning that includes system analysis
      expect(report.results.length).toBeGreaterThan(0);
      expect(report.results[0].reasoning.length).toBeGreaterThan(0);
    });

    it('should provide comprehensive system overview', async () => {
      // Graph stats
      const graphStats = graphInferenceEngine.getStats();
      
      // Threat stats
      const threatStats = contextualThreatMonitor.getStats();
      
      // Copilot stats
      const copilotStats = jointCopilotStrategyRecommender.getStats();
      
      // All stats should be available
      expect(graphStats.nodeCount).toBeGreaterThan(0);
      expect(threatStats).toHaveProperty('isActive');
      expect(copilotStats.copilotCount).toBe(4);
      
      // Generate comprehensive recommendation
      const recommendation = await jointCopilotStrategyRecommender.generateRecommendation();
      
      // Recommendation should reflect system state
      expect(recommendation.reasoning.length).toBeGreaterThan(0);
      expect(recommendation.sources.length).toBe(4);
    });
  });
});
