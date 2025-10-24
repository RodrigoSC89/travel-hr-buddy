import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Wind, Thermometer, Droplets, AlertTriangle, TrendingUp, MapPin, Activity } from "lucide-react";
import { getCurrentWeather, getWeatherForecast, WeatherData, WeatherForecast } from "@/lib/weather";
import { runAIContext } from "@/ai/kernel";
import { logger } from "@/lib/logger";

interface AIWeatherRecommendation {
  type: string;
  message: string;
  confidence: number;
}

const WeatherDashboard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<AIWeatherRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logger.info("WeatherDashboard mounted");
    loadWeatherData();
    loadAIRecommendations();
  }, []);

  const loadWeatherData = async () => {
    try {
      logger.info("Loading weather data from OpenWeather API");
      
      const currentWeather = await getCurrentWeather();
      setWeather(currentWeather);
      
      const weatherForecast = await getWeatherForecast();
      setForecast(weatherForecast);
      
      logger.info("Weather data loaded successfully", { 
        location: currentWeather.location,
        alerts: currentWeather.alerts.length 
      });
      
      setLoading(false);
    } catch (err) {
      logger.error("Failed to load weather data", err);
      setError("Failed to load weather data");
      setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    try {
      logger.info("Requesting AI weather recommendations");
      
      const response = await runAIContext({
        module: "weather-dashboard",
        action: "analyze",
        context: {
          timestamp: new Date().toISOString(),
        },
      });

      setAiRecommendation({
        type: response.type,
        message: response.message,
        confidence: response.confidence,
      });

      logger.info("AI recommendations loaded successfully", { confidence: response.confidence });
    } catch (err) {
      logger.error("Failed to load AI recommendations", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Cloud className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold">Weather Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Loading weather data...</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-bold">Weather Dashboard</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error || "Weather data unavailable"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Cloud className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Weather Dashboard</h1>
      </div>

      {/* Current Location */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{weather.location}</span>
            <span className="text-xs text-muted-foreground ml-auto capitalize">{weather.description}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Current Weather KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weather.temperature}°C</div>
            <p className="text-xs text-muted-foreground">Current temperature</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wind Speed</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weather.windSpeed} kn</div>
            <p className="text-xs text-muted-foreground">Direction: {weather.windDirection}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Humidity</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weather.humidity}%</div>
            <p className="text-xs text-muted-foreground">Relative humidity</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weather.alerts.length}</div>
            <p className="text-xs text-muted-foreground">Weather warnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Weather Alerts */}
      {weather.alerts.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Active Weather Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weather.alerts.map((alert, index) => (
                <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{alert.event}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Until: {alert.end.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            5-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground capitalize mb-2">{day.description}</p>
                <div className="flex justify-center items-center gap-2 mb-2">
                  <span className="text-lg font-bold">{day.temperature.max}°</span>
                  <span className="text-sm text-muted-foreground">{day.temperature.min}°</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {day.precipitationProbability}% precip
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Weather Recommendations */}
      {aiRecommendation && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              AI Weather Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Type:</span>
                <span className="text-sm text-muted-foreground capitalize">{aiRecommendation.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Confidence:</span>
                <span className="text-sm text-muted-foreground">{aiRecommendation.confidence.toFixed(1)}%</span>
              </div>
              <p className="text-sm mt-4">{aiRecommendation.message}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Module Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Real-time weather monitoring powered by OpenWeather API with route-specific conditions, 
            severe weather alerts, 5-day forecasts, and AI-driven operational recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherDashboard;
