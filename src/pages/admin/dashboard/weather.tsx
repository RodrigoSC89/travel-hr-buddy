import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Cloud, Droplets, Wind, Eye, Gauge, CloudRain } from "lucide-react";
import { fetchMaritimeWeather, MARITIME_LOCATIONS, getWeatherSeverity } from "@/integrations/weather/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * PATCH 630: Weather Dashboard
 * Display real-time weather data for maritime locations
 */
export default function WeatherDashboard() {
  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ["maritime-weather"],
    queryFn: () => fetchMaritimeWeather(MARITIME_LOCATIONS),
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
    staleTime: 30 * 60 * 1000, // Consider data stale after 30 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load weather data. Please check API configuration.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: weatherData?.map(w => w.location.name) || [],
    datasets: [
      {
        label: "Temperature (°C)",
        data: weatherData?.map(w => w.temperature) || [],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Wind Speed (m/s)",
        data: weatherData?.map(w => w.windSpeed) || [],
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Cloud className="h-8 w-8" />
          Maritime Weather Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          PATCH 630: Real-time weather data for maritime operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weatherData?.map((weather) => {
          const severity = getWeatherSeverity(weather);
          const severityColor = {
            safe: "default",
            caution: "secondary",
            warning: "outline",
            danger: "destructive",
          }[severity] as unknown;

          return (
            <Card key={weather.location.name} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{weather.location.name}</CardTitle>
                    <CardDescription>
                      {weather.location.lat.toFixed(4)}, {weather.location.lon.toFixed(4)}
                    </CardDescription>
                  </div>
                  <Badge variant={severityColor}>{severity.toUpperCase()}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">{weather.temperature.toFixed(1)}°C</p>
                  <p className="text-sm text-muted-foreground">{weather.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-muted-foreground">Humidity</p>
                      <p className="font-medium">{weather.humidity}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-muted-foreground">Wind</p>
                      <p className="font-medium">{weather.windSpeed.toFixed(1)} m/s</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-muted-foreground">Pressure</p>
                      <p className="font-medium">{weather.pressure} hPa</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-muted-foreground">Visibility</p>
                      <p className="font-medium">{(weather.visibility / 1000).toFixed(1)} km</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-muted-foreground">Clouds</p>
                      <p className="font-medium">{weather.cloudCoverage}%</p>
                    </div>
                  </div>

                  {weather.precipitation > 0 && (
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-muted-foreground">Rain</p>
                        <p className="font-medium">{weather.precipitation.toFixed(1)} mm</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weather Comparison</CardTitle>
          <CardDescription>Temperature and wind speed across all locations</CardDescription>
        </CardHeader>
        <CardContent>
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </CardContent>
      </Card>
    </div>
  );
}
