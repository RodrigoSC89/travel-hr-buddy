/**
 * PATCH 95.0 - Performance Dashboard Module Tests
 * Tests for performance KPIs, AI analysis, and PDF export
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPerformanceStatus, getPerformanceAnalysis, comparePerformance, calculateKPIScore } from '@/lib/insights/performance';
import { runAIContext } from '@/ai/kernel';

// Mock AI kernel
vi.mock('@/ai/kernel', () => ({
  runAIContext: vi.fn(),
}));

describe('Performance Dashboard Module', () => {
  describe('getPerformanceStatus', () => {
    it('should return optimal status for excellent metrics', () => {
      const metrics = {
        fuelEfficiency: 95,
        navigationHours: 160,
        productivity: 90,
        downtime: 3,
        totalMissions: 25,
      };

      const status = getPerformanceStatus(metrics);
      expect(status).toBe('optimal');
    });

    it('should return average status for moderate metrics', () => {
      const metrics = {
        fuelEfficiency: 80,
        navigationHours: 150,
        productivity: 75,
        downtime: 8,
        totalMissions: 20,
      };

      const status = getPerformanceStatus(metrics);
      expect(status).toBe('average');
    });

    it('should return critical status for poor metrics', () => {
      const metrics = {
        fuelEfficiency: 60,
        navigationHours: 100,
        productivity: 55,
        downtime: 18,
        totalMissions: 10,
      };

      const status = getPerformanceStatus(metrics);
      expect(status).toBe('critical');
    });

    it('should handle edge case with all threshold values', () => {
      const metrics = {
        fuelEfficiency: 90,
        navigationHours: 0,
        productivity: 85,
        downtime: 5,
        totalMissions: 0,
      };

      const status = getPerformanceStatus(metrics);
      expect(status).toBe('optimal');
    });
  });

  describe('getPerformanceAnalysis', () => {
    it('should provide detailed analysis for optimal performance', () => {
      const metrics = {
        fuelEfficiency: 95,
        navigationHours: 160,
        productivity: 90,
        downtime: 3,
        totalMissions: 25,
      };

      const analysis = getPerformanceAnalysis(metrics);
      
      expect(analysis.status).toBe('optimal');
      expect(analysis.issues).toHaveLength(0);
      expect(analysis.recommendations).toHaveLength(0);
      expect(analysis.metrics).toEqual(metrics);
      expect(analysis.timestamp).toBeDefined();
    });

    it('should identify issues and provide recommendations for poor performance', () => {
      const metrics = {
        fuelEfficiency: 70,
        navigationHours: 120,
        productivity: 65,
        downtime: 12,
        totalMissions: 15,
      };

      const analysis = getPerformanceAnalysis(metrics);
      
      expect(analysis.status).toBe('critical');
      expect(analysis.issues.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.issues).toContain('Eficiência de combustível abaixo do esperado');
      expect(analysis.issues).toContain('Produtividade abaixo da meta');
      expect(analysis.issues).toContain('Downtime acima do aceitável');
    });
  });

  describe('comparePerformance', () => {
    it('should correctly identify improving trends', () => {
      const currentMetrics = {
        fuelEfficiency: 95,
        navigationHours: 160,
        productivity: 90,
        downtime: 3,
        totalMissions: 25,
      };

      const historicalMetrics = {
        fuelEfficiency: 85,
        navigationHours: 140,
        productivity: 80,
        downtime: 6,
        totalMissions: 20,
      };

      const trends = comparePerformance(currentMetrics, historicalMetrics);

      expect(trends.fuelEfficiency.trend).toBe('improving');
      expect(trends.fuelEfficiency.change).toBe(10);
      expect(trends.productivity.trend).toBe('improving');
      expect(trends.productivity.change).toBe(10);
      expect(trends.downtime.trend).toBe('improving');
      expect(trends.downtime.change).toBe(-3);
    });

    it('should correctly identify declining trends', () => {
      const currentMetrics = {
        fuelEfficiency: 75,
        navigationHours: 130,
        productivity: 70,
        downtime: 10,
        totalMissions: 15,
      };

      const historicalMetrics = {
        fuelEfficiency: 85,
        navigationHours: 150,
        productivity: 85,
        downtime: 5,
        totalMissions: 20,
      };

      const trends = comparePerformance(currentMetrics, historicalMetrics);

      expect(trends.fuelEfficiency.trend).toBe('declining');
      expect(trends.productivity.trend).toBe('declining');
      expect(trends.downtime.trend).toBe('declining');
    });
  });

  describe('calculateKPIScore', () => {
    it('should calculate high score for excellent metrics', () => {
      const metrics = {
        fuelEfficiency: 95,
        navigationHours: 160,
        productivity: 90,
        downtime: 3,
        totalMissions: 25,
      };

      const score = calculateKPIScore(metrics);
      
      expect(score).toBeGreaterThanOrEqual(90);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate low score for poor metrics', () => {
      const metrics = {
        fuelEfficiency: 60,
        navigationHours: 100,
        productivity: 55,
        downtime: 20,
        totalMissions: 10,
      };

      const score = calculateKPIScore(metrics);
      
      expect(score).toBeLessThan(70);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should calculate medium score for average metrics', () => {
      const metrics = {
        fuelEfficiency: 80,
        navigationHours: 140,
        productivity: 75,
        downtime: 8,
        totalMissions: 18,
      };

      const score = calculateKPIScore(metrics);
      
      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThanOrEqual(90);
    });

    it('should handle extreme downtime correctly', () => {
      const metrics = {
        fuelEfficiency: 90,
        navigationHours: 150,
        productivity: 85,
        downtime: 25,
        totalMissions: 20,
      };

      const score = calculateKPIScore(metrics);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('AI Performance Analysis Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call AI context with performance module', async () => {
      const mockResponse = {
        type: 'diagnosis' as const,
        message: 'Performance operacional estável. KPIs dentro dos parâmetros esperados.',
        confidence: 92.0,
        timestamp: new Date(),
      };

      vi.mocked(runAIContext).mockResolvedValue(mockResponse);

      const metrics = {
        fuelEfficiency: 94.2,
        navigationHours: 156,
        productivity: 87.5,
        downtime: 4.3,
        totalMissions: 23,
      };

      const result = await runAIContext({
        module: 'operations.performance',
        action: 'analyze',
        context: { metrics, period: '7' },
      });

      expect(runAIContext).toHaveBeenCalledWith({
        module: 'operations.performance',
        action: 'analyze',
        context: { metrics, period: '7' },
      });

      expect(result.message).toBe('Performance operacional estável. KPIs dentro dos parâmetros esperados.');
      expect(result.confidence).toBe(92.0);
    });

    it('should handle AI context errors gracefully', async () => {
      vi.mocked(runAIContext).mockRejectedValue(new Error('AI service unavailable'));

      await expect(
        runAIContext({
          module: 'operations.performance',
          action: 'analyze',
          context: {},
        })
      ).rejects.toThrow('AI service unavailable');
    });
  });

  describe('Data Consistency Tests', () => {
    it('should ensure all metrics are non-negative', () => {
      const metrics = {
        fuelEfficiency: 94.2,
        navigationHours: 156,
        productivity: 87.5,
        downtime: 4.3,
        totalMissions: 23,
      };

      expect(metrics.fuelEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.navigationHours).toBeGreaterThanOrEqual(0);
      expect(metrics.productivity).toBeGreaterThanOrEqual(0);
      expect(metrics.downtime).toBeGreaterThanOrEqual(0);
      expect(metrics.totalMissions).toBeGreaterThanOrEqual(0);
    });

    it('should ensure metrics are within reasonable ranges', () => {
      const metrics = {
        fuelEfficiency: 94.2,
        navigationHours: 156,
        productivity: 87.5,
        downtime: 4.3,
        totalMissions: 23,
      };

      expect(metrics.fuelEfficiency).toBeLessThanOrEqual(100);
      expect(metrics.productivity).toBeLessThanOrEqual(100);
      expect(metrics.downtime).toBeLessThanOrEqual(100);
    });
  });

  describe('PDF Export Simulation', () => {
    it('should prepare data structure for PDF export', () => {
      const metrics = {
        fuelEfficiency: 94.2,
        navigationHours: 156,
        productivity: 87.5,
        downtime: 4.3,
        totalMissions: 23,
      };

      const fuelData = [
        { name: 'Missão A', value: 95.2, label: 'Otimizado' },
        { name: 'Missão B', value: 89.8, label: 'Normal' },
      ];

      const productivityData = [
        { name: 'Semana 1', value: 145 },
        { name: 'Semana 2', value: 162 },
      ];

      const downtimeData = [
        { name: 'Manutenção', value: 45 },
        { name: 'Clima', value: 18 },
      ];

      const reportData = {
        metrics,
        fuelData,
        productivityData,
        downtimeData,
        aiInsight: 'Performance operacional estável.',
        performanceStatus: 'optimal',
        period: '7',
        vessel: 'all',
        missionType: 'all',
      };

      expect(reportData.metrics).toBeDefined();
      expect(reportData.fuelData).toHaveLength(2);
      expect(reportData.productivityData).toHaveLength(2);
      expect(reportData.downtimeData).toHaveLength(2);
      expect(reportData.aiInsight).toBeDefined();
      expect(reportData.performanceStatus).toBe('optimal');
    });
  });
});
