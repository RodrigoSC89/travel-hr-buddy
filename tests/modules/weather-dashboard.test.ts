/**
 * PATCH 89.5 - Weather Dashboard Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import WeatherDashboard from '@/modules/weather-dashboard';
import { getCurrentWeather, getWeatherForecast } from '@/lib/weather';
import { runAIContext } from '@/ai/kernel';

// Mock dependencies
vi.mock('@/lib/weather', () => ({
  getCurrentWeather: vi.fn(),
  getWeatherForecast: vi.fn(),
}));

vi.mock('@/ai/kernel', () => ({
  runAIContext: vi.fn(),
}));

vi.mock('@/hooks/use-logger', () => ({
  useLogger: vi.fn(() => ({
    logMount: vi.fn(),
    logDataLoad: vi.fn(),
    logAIActivation: vi.fn(),
    logUserAction: vi.fn(),
    logError: vi.fn(),
  })),
}));

describe('WeatherDashboard', () => {
  const mockWeatherData = {
    temperature: 25,
    humidity: 70,
    windSpeed: 15,
    windDirection: 'NE',
    description: 'partly cloudy',
    alerts: [
      {
        event: 'Strong Wind Advisory',
        severity: 'medium',
        description: 'Wind speeds may reach 25 knots',
        start: new Date(),
        end: new Date(Date.now() + 6 * 60 * 60 * 1000),
      },
    ],
    location: 'Test Location',
  };

  const mockForecast = [
    {
      date: new Date(),
      temperature: { min: 18, max: 28 },
      description: 'clear sky',
      precipitationProbability: 10,
    },
    {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      temperature: { min: 20, max: 30 },
      description: 'partly cloudy',
      precipitationProbability: 20,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock weather service responses
    (getCurrentWeather as any).mockResolvedValue(mockWeatherData);
    (getWeatherForecast as any).mockResolvedValue(mockForecast);

    // Mock AI context response
    (runAIContext as any).mockResolvedValue({
      type: 'recommendation',
      message: 'Weather conditions are favorable for operations',
      confidence: 92.5,
      timestamp: new Date(),
    });
  });

  it('should render the weather dashboard title', async () => {
    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(screen.getByText('Weather Dashboard')).toBeDefined();
    });
  });

  it('should load and display current weather data', async () => {
    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(getCurrentWeather).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Temperature')).toBeDefined();
      expect(screen.getByText('Wind Speed')).toBeDefined();
      expect(screen.getByText('Humidity')).toBeDefined();
      expect(screen.getByText('Active Alerts')).toBeDefined();
    });
  });

  it('should display weather forecast', async () => {
    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(getWeatherForecast).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('5-Day Forecast')).toBeDefined();
    });
  });

  it('should execute AI context for weather recommendations', async () => {
    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(runAIContext).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'weather-dashboard',
          action: 'analyze',
        })
      );
    });
  });

  it('should display weather alerts when present', async () => {
    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(screen.getByText('Active Weather Alerts')).toBeDefined();
      expect(screen.getByText('Strong Wind Advisory')).toBeDefined();
    });
  });

  it('should display current location', async () => {
    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(screen.getByText('Test Location')).toBeDefined();
    });
  });

  it('should handle weather service errors gracefully', async () => {
    (getCurrentWeather as any).mockRejectedValue(new Error('API error'));

    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(screen.getByText('Weather Dashboard')).toBeDefined();
    });
  });

  it('should display AI weather recommendations', async () => {
    (runAIContext as any).mockResolvedValue({
      type: 'recommendation',
      message: 'Optimal conditions for sailing',
      confidence: 95.0,
      timestamp: new Date(),
    });

    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(screen.getByText('AI Weather Recommendations')).toBeDefined();
    });
  });

  it('should display weather KPIs with correct values', async () => {
    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(screen.getByText('25°C')).toBeDefined();
      expect(screen.getByText('15 kn')).toBeDefined();
      expect(screen.getByText('70%')).toBeDefined();
    });
  });

  it('should handle empty weather alerts', async () => {
    (getCurrentWeather as any).mockResolvedValue({
      ...mockWeatherData,
      alerts: [],
    });

    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(screen.getByText('Weather Dashboard')).toBeDefined();
    });

    // Active Weather Alerts section should not be displayed
    await waitFor(() => {
      const alertsSection = screen.queryByText('Active Weather Alerts');
      expect(alertsSection).toBeNull();
    });
  });

  it('should display forecast with precipitation probability', async () => {
    render(React.createElement(WeatherDashboard));

    await waitFor(() => {
      expect(screen.getByText('10% precip')).toBeDefined();
      expect(screen.getByText('20% precip')).toBeDefined();
    });
  });
});
