/**
 * Weather Service Tests
 * Tests for OpenWeatherMap integration and caching
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { weatherService } from "@/services/weatherService";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "No cache" },
        }),
      }),
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    }),
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("Weather Service", () => {
  const mockWeatherData = {
    main: {
      temp: 25,
      feels_like: 27,
      humidity: 70,
      pressure: 1013,
    },
    wind: {
      speed: 5.5,
      deg: 180,
    },
    visibility: 10000,
    weather: [
      {
        description: "clear sky",
        icon: "01d",
      },
    ],
  };

  const mockForecastData = {
    list: [
      {
        dt_txt: "2024-01-01 12:00:00",
        main: { temp: 25 },
        weather: [{ description: "clear sky", icon: "01d" }],
        wind: { speed: 5 },
      },
      {
        dt_txt: "2024-01-02 12:00:00",
        main: { temp: 26 },
        weather: [{ description: "cloudy", icon: "02d" }],
        wind: { speed: 6 },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentWeather", () => {
    it("should fetch current weather data", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData,
      });

      const weather = await weatherService.getCurrentWeather(
        -23.5505,
        -46.6333
      );

      expect(weather).toMatchObject({
        temperature: 25,
        feels_like: 27,
        humidity: 70,
        pressure: 1013,
        wind_speed: 5.5,
        wind_direction: 180,
        description: "clear sky",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("api.openweathermap.org"),
        undefined
      );
    });

    it("should use cached data when available", async () => {
      const cachedWeather = {
        temperature: 24,
        timestamp: new Date().toISOString(),
      };

      const { supabase } = await import("@/integrations/supabase/client");
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { weather_data: cachedWeather },
            error: null,
          }),
        }),
      });

      const weather = await weatherService.getCurrentWeather(
        -23.5505,
        -46.6333
      );

      expect(weather).toEqual(cachedWeather);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should handle API errors", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: "API Error",
      });

      await expect(
        weatherService.getCurrentWeather(-23.5505, -46.6333)
      ).rejects.toThrow();
    });
  });

  describe("getWeatherForecast", () => {
    it("should fetch 5-day forecast", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData,
      });

      const forecast = await weatherService.getWeatherForecast(
        -23.5505,
        -46.6333
      );

      expect(forecast).toHaveLength(2);
      expect(forecast[0]).toMatchObject({
        date: "2024-01-01",
        temp_max: 25,
        temp_min: 25,
        description: "clear sky",
      });
    });

    it("should handle empty forecast data", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ list: [] }),
      });

      const forecast = await weatherService.getWeatherForecast(
        -23.5505,
        -46.6333
      );

      expect(forecast).toEqual([]);
    });
  });

  describe("getWeatherAlerts", () => {
    it("should fetch weather alerts", async () => {
      const mockAlerts = {
        alerts: [
          {
            event: "Storm Warning",
            description: "Heavy storm expected",
            start: 1672531200,
            end: 1672617600,
            tags: ["severe"],
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlerts,
      });

      const alerts = await weatherService.getWeatherAlerts(-23.5505, -46.6333);

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        event: "Storm Warning",
        severity: "severe",
      });
    });

    it("should return empty array when no alerts", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ alerts: [] }),
      });

      const alerts = await weatherService.getWeatherAlerts(-23.5505, -46.6333);

      expect(alerts).toEqual([]);
    });

    it("should handle alert API errors gracefully", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("API Error"));

      const alerts = await weatherService.getWeatherAlerts(-23.5505, -46.6333);

      expect(alerts).toEqual([]);
    });
  });

  describe("getMaritimeData", () => {
    it("should return maritime-specific data", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData,
      });

      const maritime = await weatherService.getMaritimeData(
        -23.5505,
        -46.6333
      );

      expect(maritime).toMatchObject({
        wind_speed: 5.5,
        wind_direction: 180,
      });
    });
  });
});
