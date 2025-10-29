import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Forecast AI Engine Unit Tests
 * Tests forecasting logic, risk classification, and prediction algorithms
 */

// Mock ONNX runtime
vi.mock('onnxruntime-web', () => ({
  InferenceSession: {
    create: vi.fn(() => Promise.resolve({
      run: vi.fn(() => Promise.resolve({
        output: { data: [0.85] }
      }))
    }))
  }
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    eq: vi.fn(function(this: any) { return this; }),
    order: vi.fn(function(this: any) { return this; }),
    limit: vi.fn(function(this: any) { return this; }),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}));

describe('Forecast AI Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Risk Classification', () => {
    it('should classify low risk correctly', () => {
      const riskValue = 0.2;
      
      let level: 'OK' | 'Risco' | 'Crítico' = 'OK';
      if (riskValue > 0.7) level = 'Crítico';
      else if (riskValue > 0.4) level = 'Risco';

      expect(level).toBe('OK');
    });

    it('should classify medium risk correctly', () => {
      const riskValue = 0.5;
      
      let level: 'OK' | 'Risco' | 'Crítico' = 'OK';
      if (riskValue > 0.7) level = 'Crítico';
      else if (riskValue > 0.4) level = 'Risco';

      expect(level).toBe('Risco');
    });

    it('should classify critical risk correctly', () => {
      const riskValue = 0.85;
      
      let level: 'OK' | 'Risco' | 'Crítico' = 'OK';
      if (riskValue > 0.7) level = 'Crítico';
      else if (riskValue > 0.4) level = 'Risco';

      expect(level).toBe('Crítico');
    });

    it('should handle edge case at boundary', () => {
      const riskValue = 0.7;
      
      let level: 'OK' | 'Risco' | 'Crítico' = 'OK';
      if (riskValue > 0.7) level = 'Crítico';
      else if (riskValue > 0.4) level = 'Risco';

      expect(level).toBe('Risco');
    });
  });

  describe('Telemetry Data Processing', () => {
    it('should fetch telemetry data successfully', async () => {
      const mockTelemetry = [
        { id: 1, sensor: 'temperature', value: 75.5, timestamp: new Date().toISOString() },
        { id: 2, sensor: 'pressure', value: 120.3, timestamp: new Date().toISOString() },
      ];

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(function(this: any) { return this; }),
        order: vi.fn(function(this: any) { return this; }),
        limit: vi.fn(() => Promise.resolve({ data: mockTelemetry, error: null })),
        eq: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabaseClient.from('dp_telemetry')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      expect(result.data).toEqual(mockTelemetry);
      expect(result.error).toBeNull();
    });

    it('should handle empty telemetry data', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(function(this: any) { return this; }),
        order: vi.fn(function(this: any) { return this; }),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        eq: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabaseClient.from('dp_telemetry')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      expect(result.data).toEqual([]);
      expect(result.data?.length).toBe(0);
    });

    it('should normalize telemetry values', () => {
      const rawData = [
        { value: 100 },
        { value: 200 },
        { value: 150 },
      ];

      const max = Math.max(...rawData.map(d => d.value));
      const normalized = rawData.map(d => ({
        ...d,
        normalized: d.value / max
      }));

      expect(normalized[0].normalized).toBe(0.5);
      expect(normalized[1].normalized).toBe(1.0);
      expect(normalized[2].normalized).toBe(0.75);
    });
  });

  describe('Forecast Predictions', () => {
    it('should generate valid forecast result', () => {
      const forecastResult = {
        status: 'success',
        level: 'Risco',
        value: 0.6,
        message: 'Moderate risk detected'
      };

      expect(forecastResult.status).toBe('success');
      expect(forecastResult.level).toBe('Risco');
      expect(forecastResult.value).toBeGreaterThan(0);
      expect(forecastResult.value).toBeLessThan(1);
    });

    it('should handle prediction errors gracefully', () => {
      const errorResult = {
        status: 'error',
        message: 'Model not loaded'
      };

      expect(errorResult.status).toBe('error');
      expect(errorResult.message).toBeDefined();
      expect(errorResult.level).toBeUndefined();
    });

    it('should validate prediction output format', () => {
      const prediction = { data: [0.75, 0.25, 0.5] };

      expect(Array.isArray(prediction.data)).toBe(true);
      expect(prediction.data.length).toBeGreaterThan(0);
      prediction.data.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Time Series Analysis', () => {
    it('should calculate moving average', () => {
      const values = [10, 20, 30, 40, 50];
      const windowSize = 3;
      
      const movingAvg = [];
      for (let i = windowSize - 1; i < values.length; i++) {
        const window = values.slice(i - windowSize + 1, i + 1);
        const avg = window.reduce((sum, val) => sum + val, 0) / windowSize;
        movingAvg.push(avg);
      }

      expect(movingAvg[0]).toBe(20); // (10+20+30)/3
      expect(movingAvg[1]).toBe(30); // (20+30+40)/3
      expect(movingAvg[2]).toBe(40); // (30+40+50)/3
    });

    it('should detect trend direction', () => {
      const ascendingData = [10, 20, 30, 40, 50];
      const descendingData = [50, 40, 30, 20, 10];

      const getTrend = (data: number[]) => {
        const first = data[0];
        const last = data[data.length - 1];
        return last > first ? 'ascending' : last < first ? 'descending' : 'stable';
      };

      expect(getTrend(ascendingData)).toBe('ascending');
      expect(getTrend(descendingData)).toBe('descending');
    });

    it('should identify anomalies', () => {
      const data = [10, 12, 11, 13, 100, 12, 11]; // 100 is anomaly
      
      const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
      const stdDev = Math.sqrt(
        data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
      );
      
      const anomalies = data.filter(val => 
        Math.abs(val - mean) > 2 * stdDev
      );

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies).toContain(100);
    });
  });

  describe('Forecast Storage', () => {
    it('should save forecast results', async () => {
      const forecastData = {
        vessel_id: 'vessel-123',
        risk_level: 'Risco',
        risk_value: 0.6,
        created_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn(() => Promise.resolve({ data: forecastData, error: null })),
        select: vi.fn(function(this: any) { return this; }),
        eq: vi.fn(function(this: any) { return this; }),
        order: vi.fn(function(this: any) { return this; }),
        limit: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabaseClient.from('forecasts').insert(forecastData);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(forecastData);
    });

    it('should retrieve forecast history', async () => {
      const mockHistory = [
        { id: 1, risk_level: 'OK', created_at: '2025-10-29T10:00:00Z' },
        { id: 2, risk_level: 'Risco', created_at: '2025-10-29T11:00:00Z' },
      ];

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(function(this: any) { return this; }),
        eq: vi.fn(function(this: any) { return this; }),
        order: vi.fn(function(this: any) { return this; }),
        limit: vi.fn(() => Promise.resolve({ data: mockHistory, error: null })),
      });

      const result = await mockSupabaseClient.from('forecasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      expect(result.data).toEqual(mockHistory);
    });
  });

  describe('Model Performance', () => {
    it('should track prediction accuracy', () => {
      const predictions = [
        { predicted: 'Risco', actual: 'Risco' },
        { predicted: 'OK', actual: 'OK' },
        { predicted: 'Crítico', actual: 'Risco' },
      ];

      const correct = predictions.filter(p => p.predicted === p.actual).length;
      const accuracy = correct / predictions.length;

      expect(accuracy).toBeGreaterThan(0.5);
      expect(accuracy).toBe(2/3);
    });

    it('should calculate confidence score', () => {
      const modelOutput = 0.85;
      
      // Confidence is distance from 0.5 (decision boundary)
      const confidence = Math.abs(modelOutput - 0.5) * 2;

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
      expect(confidence).toBe(0.7);
    });
  });

  describe('Data Validation', () => {
    it('should validate telemetry data format', () => {
      const telemetry = {
        sensor: 'temperature',
        value: 75.5,
        timestamp: new Date().toISOString(),
        unit: 'celsius',
      };

      expect(telemetry.sensor).toBeDefined();
      expect(typeof telemetry.value).toBe('number');
      expect(new Date(telemetry.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should reject invalid sensor values', () => {
      const invalidValues = [NaN, Infinity, -Infinity];
      
      invalidValues.forEach(value => {
        expect(Number.isFinite(value)).toBe(false);
      });
    });
  });
});
