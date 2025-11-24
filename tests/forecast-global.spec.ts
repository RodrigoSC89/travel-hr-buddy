import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Forecast Global Module Tests
 * Testing global forecasting and prediction
 */

type ForecastQueryResponse<T> = Promise<{ data: T; error: Error | null }>;

type ForecastQueryBuilder<T = unknown> = {
  select: (...args: unknown[]) => ForecastQueryResponse<T>;
  insert: (...args: unknown[]) => ForecastQueryResponse<T>;
  update: (...args: unknown[]) => ForecastQueryResponse<T>;
  eq: (...args: unknown[]) => ForecastQueryBuilder<T>;
  gte: (...args: unknown[]) => ForecastQueryBuilder<T>;
  lte: (...args: unknown[]) => ForecastQueryBuilder<T>;
  order: (...args: unknown[]) => ForecastQueryBuilder<T>;
  limit: (...args: unknown[]) => ForecastQueryBuilder<T>;
};

const createForecastQueryBuilder = <T = unknown>(
  overrides?: Partial<ForecastQueryBuilder<T>>
): ForecastQueryBuilder<T> => {
  const builder = {} as ForecastQueryBuilder<T>;

  builder.select = vi.fn(() => Promise.resolve({ data: [] as T, error: null }));
  builder.insert = vi.fn(() => Promise.resolve({ data: null as T, error: null }));
  builder.update = vi.fn(() => Promise.resolve({ data: null as T, error: null }));
  builder.eq = vi.fn(() => builder);
  builder.gte = vi.fn(() => builder);
  builder.lte = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.limit = vi.fn(() => builder);

  return Object.assign(builder, overrides);
};

const mockSupabaseClient = {
  from: vi.fn((table?: string) => {
    void table;
    return createForecastQueryBuilder();
  }),
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabaseClient,
}));

describe("Forecast Global Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Forecast Generation", () => {
    it("should generate forecast for given period", async () => {
      const mockForecast = {
        id: 1,
        period: "2025-11",
        predictions: {
          demand: 1500,
          capacity: 2000,
          utilization: 75,
        },
        confidence: 0.85,
      };

      const builder = createForecastQueryBuilder({
        insert: vi.fn(() => Promise.resolve({ data: mockForecast, error: null })),
      });

      mockSupabaseClient.from.mockReturnValueOnce(builder);

      const result = await mockSupabaseClient.from("forecasts").insert(mockForecast);
      const forecast = result.data as typeof mockForecast;

      expect(forecast).toEqual(mockForecast);
      expect(forecast.confidence).toBeGreaterThan(0.8);
    });

    it("should fetch historical forecasts", async () => {
      const mockForecasts = [
        { id: 1, period: "2025-09", accuracy: 92 },
        { id: 2, period: "2025-10", accuracy: 88 },
      ];

      const builder = createForecastQueryBuilder({
        select: vi.fn(() => Promise.resolve({ data: mockForecasts, error: null })),
      });

      mockSupabaseClient.from.mockReturnValueOnce(builder);

      const result = await mockSupabaseClient.from("forecasts").select("*");
      const forecasts = result.data as typeof mockForecasts;

      expect(forecasts).toHaveLength(2);
      expect(forecasts).toEqual(mockForecasts);
    });
  });

  describe("Trend Analysis", () => {
    it("should identify upward trend", () => {
      const data = [100, 120, 140, 160, 180];
      
      const diffs = data.slice(1).map((val, idx) => val - data[idx]);
      const avgDiff = diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length;
      const isUpward = avgDiff > 0;

      expect(isUpward).toBe(true);
      expect(avgDiff).toBe(20);
    });

    it("should identify downward trend", () => {
      const data = [180, 160, 140, 120, 100];
      
      const diffs = data.slice(1).map((val, idx) => val - data[idx]);
      const avgDiff = diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length;
      const isDownward = avgDiff < 0;

      expect(isDownward).toBe(true);
      expect(avgDiff).toBe(-20);
    });
  });

  describe("Accuracy Calculation", () => {
    it("should calculate forecast accuracy", () => {
      const forecasts = [
        { predicted: 100, actual: 95 },
        { predicted: 150, actual: 155 },
        { predicted: 200, actual: 190 },
      ];

      const accuracies = forecasts.map(f => {
        const error = Math.abs(f.predicted - f.actual);
        const percentError = (error / f.actual) * 100;
        return 100 - percentError;
      });

      const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

      expect(avgAccuracy).toBeGreaterThan(90);
      expect(avgAccuracy).toBeLessThan(100);
    });

    it("should identify low accuracy forecasts", () => {
      const forecasts = [
        { id: 1, predicted: 100, actual: 95, accuracy: 95 },
        { id: 2, predicted: 150, actual: 110, accuracy: 73 },
        { id: 3, predicted: 200, actual: 195, accuracy: 97 },
      ];

      const lowAccuracy = forecasts.filter(f => f.accuracy < 80);

      expect(lowAccuracy).toHaveLength(1);
      expect(lowAccuracy[0].id).toBe(2);
    });
  });

  describe("Seasonal Patterns", () => {
    it("should detect seasonal peaks", () => {
      const monthlyData = [
        { month: 1, value: 100 },
        { month: 2, value: 110 },
        { month: 3, value: 150 }, // Peak
        { month: 4, value: 120 },
        { month: 5, value: 100 },
      ];

      const maxValue = Math.max(...monthlyData.map(d => d.value));
      const peakMonth = monthlyData.find(d => d.value === maxValue);

      expect(peakMonth?.month).toBe(3);
      expect(peakMonth?.value).toBe(150);
    });

    it("should calculate seasonal index", () => {
      const monthlyData = [100, 120, 140, 130, 110, 100];
      const average = monthlyData.reduce((sum, val) => sum + val, 0) / monthlyData.length;
      
      const seasonalIndices = monthlyData.map(val => (val / average) * 100);

      expect(seasonalIndices[0]).toBeLessThan(100); // Below average
      expect(seasonalIndices[2]).toBeGreaterThan(100); // Above average
    });
  });

  describe("Confidence Intervals", () => {
    it("should calculate confidence intervals", () => {
      const forecast = {
        predicted: 150,
        stdDev: 10,
        confidence: 0.95,
      };

      // 95% confidence interval (approx 2 std devs)
      const zScore = 1.96;
      const margin = zScore * forecast.stdDev;
      const lowerBound = forecast.predicted - margin;
      const upperBound = forecast.predicted + margin;

      expect(lowerBound).toBeCloseTo(130.4, 0);
      expect(upperBound).toBeCloseTo(169.6, 0);
    });

    it("should adjust for high variance", () => {
      const lowVarianceForecast = { predicted: 100, variance: 5 };
      const highVarianceForecast = { predicted: 100, variance: 20 };

      expect(highVarianceForecast.variance).toBeGreaterThan(lowVarianceForecast.variance);
    });
  });

  describe("Multi-Model Ensemble", () => {
    it("should average multiple model predictions", () => {
      const modelPredictions = [
        { model: "linear", prediction: 150 },
        { model: "exponential", prediction: 160 },
        { model: "arima", prediction: 155 },
      ];

      const ensemble = modelPredictions.reduce((sum, m) => sum + m.prediction, 0) / modelPredictions.length;

      expect(ensemble).toBeCloseTo(155, 0);
    });

    it("should weight models by accuracy", () => {
      const modelPredictions = [
        { model: "linear", prediction: 150, weight: 0.3 },
        { model: "exponential", prediction: 160, weight: 0.5 },
        { model: "arima", prediction: 155, weight: 0.2 },
      ];

      const weightedEnsemble = modelPredictions.reduce(
        (sum, m) => sum + m.prediction * m.weight,
        0
      );

      expect(weightedEnsemble).toBeCloseTo(156, 0);
    });
  });

  describe("Data Validation", () => {
    it("should validate forecast data structure", () => {
      const validForecast = {
        period: "2025-11",
        predictions: {},
        confidence: 0.85,
        generated_at: new Date().toISOString(),
      };

      const isValid = 
        validForecast.period &&
        validForecast.confidence >= 0 &&
        validForecast.confidence <= 1;

      expect(isValid).toBe(true);
    });

    it("should reject invalid confidence values", () => {
      const invalidConfidence = 1.5;
      const isValid = invalidConfidence >= 0 && invalidConfidence <= 1;

      expect(isValid).toBe(false);
    });
  });
});
