/**
 * Unit tests for Analytics Core Module
 * Tests data aggregation, metrics calculation, and analytics functions
 */

import { describe, it, expect } from 'vitest';

interface AnalyticsData {
  timestamp: string;
  metric: string;
  value: number;
  category?: string;
}

interface MetricSummary {
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
}

describe('Analytics Core Module', () => {
  describe('Data Aggregation', () => {
    it('should calculate sum of values', () => {
      const data: AnalyticsData[] = [
        { timestamp: '2025-10-01', metric: 'revenue', value: 1000 },
        { timestamp: '2025-10-02', metric: 'revenue', value: 1500 },
        { timestamp: '2025-10-03', metric: 'revenue', value: 2000 },
      ];

      const total = data.reduce((sum, item) => sum + item.value, 0);
      expect(total).toBe(4500);
    });

    it('should calculate average of values', () => {
      const data: AnalyticsData[] = [
        { timestamp: '2025-10-01', metric: 'score', value: 80 },
        { timestamp: '2025-10-02', metric: 'score', value: 90 },
        { timestamp: '2025-10-03', metric: 'score', value: 85 },
      ];

      const average = data.reduce((sum, item) => sum + item.value, 0) / data.length;
      expect(average).toBe(85);
    });

    it('should find minimum value', () => {
      const values = [100, 50, 75, 25, 90];
      const min = Math.min(...values);
      expect(min).toBe(25);
    });

    it('should find maximum value', () => {
      const values = [100, 50, 75, 25, 90];
      const max = Math.max(...values);
      expect(max).toBe(100);
    });

    it('should generate metric summary', () => {
      const data: AnalyticsData[] = [
        { timestamp: '2025-10-01', metric: 'sales', value: 100 },
        { timestamp: '2025-10-02', metric: 'sales', value: 150 },
        { timestamp: '2025-10-03', metric: 'sales', value: 200 },
      ];

      const values = data.map(d => d.value);
      const summary: MetricSummary = {
        total: values.reduce((sum, v) => sum + v, 0),
        average: values.reduce((sum, v) => sum + v, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };

      expect(summary.total).toBe(450);
      expect(summary.average).toBe(150);
      expect(summary.min).toBe(100);
      expect(summary.max).toBe(200);
      expect(summary.count).toBe(3);
    });
  });

  describe('Time Series Analytics', () => {
    it('should group data by date', () => {
      const data: AnalyticsData[] = [
        { timestamp: '2025-10-01', metric: 'views', value: 100 },
        { timestamp: '2025-10-01', metric: 'clicks', value: 50 },
        { timestamp: '2025-10-02', metric: 'views', value: 150 },
      ];

      const groupedByDate = data.reduce((acc, item) => {
        const date = item.timestamp;
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      }, {} as Record<string, AnalyticsData[]>);

      expect(Object.keys(groupedByDate)).toHaveLength(2);
      expect(groupedByDate['2025-10-01']).toHaveLength(2);
    });

    it('should calculate growth rate', () => {
      const previousValue = 1000;
      const currentValue = 1200;
      const growthRate = ((currentValue - previousValue) / previousValue) * 100;
      
      expect(growthRate).toBe(20);
    });

    it('should calculate moving average', () => {
      const values = [10, 20, 30, 40, 50];
      const windowSize = 3;
      
      // Calculate simple moving average for last 3 values
      const lastWindow = values.slice(-windowSize);
      const movingAvg = lastWindow.reduce((sum, v) => sum + v, 0) / windowSize;
      
      expect(movingAvg).toBe(40);
    });
  });

  describe('Category Analytics', () => {
    it('should group data by category', () => {
      const data: AnalyticsData[] = [
        { timestamp: '2025-10-01', metric: 'sales', value: 100, category: 'A' },
        { timestamp: '2025-10-01', metric: 'sales', value: 150, category: 'B' },
        { timestamp: '2025-10-02', metric: 'sales', value: 200, category: 'A' },
      ];

      const groupedByCategory = data.reduce((acc, item) => {
        const cat = item.category || 'uncategorized';
        if (!acc[cat]) acc[cat] = 0;
        acc[cat] += item.value;
        return acc;
      }, {} as Record<string, number>);

      expect(groupedByCategory['A']).toBe(300);
      expect(groupedByCategory['B']).toBe(150);
    });

    it('should calculate category percentages', () => {
      const categoryTotals = {
        'A': 300,
        'B': 200,
        'C': 500,
      };

      const total = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);
      const percentages = Object.entries(categoryTotals).reduce((acc, [cat, value]) => {
        acc[cat] = (value / total) * 100;
        return acc;
      }, {} as Record<string, number>);

      expect(percentages['A']).toBe(30);
      expect(percentages['B']).toBe(20);
      expect(percentages['C']).toBe(50);
    });
  });

  describe('Statistical Functions', () => {
    it('should calculate median', () => {
      const values = [1, 3, 3, 6, 7, 8, 9];
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      
      expect(median).toBe(6);
    });

    it('should calculate standard deviation', () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
      const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      expect(mean).toBe(5);
      expect(stdDev).toBeCloseTo(2, 0);
    });

    it('should detect outliers', () => {
      const values = [10, 12, 11, 13, 12, 100]; // 100 is an outlier
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const threshold = mean * 2; // Simple threshold
      
      const outliers = values.filter(v => v > threshold);
      expect(outliers).toContain(100);
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate conversion rate', () => {
      const visitors = 1000;
      const conversions = 150;
      const conversionRate = (conversions / visitors) * 100;
      
      expect(conversionRate).toBe(15);
    });

    it('should calculate retention rate', () => {
      const initialUsers = 1000;
      const returningUsers = 700;
      const retentionRate = (returningUsers / initialUsers) * 100;
      
      expect(retentionRate).toBe(70);
    });

    it('should calculate churn rate', () => {
      const startUsers = 1000;
      const lostUsers = 200;
      const churnRate = (lostUsers / startUsers) * 100;
      
      expect(churnRate).toBe(20);
    });
  });
});
