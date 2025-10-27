import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  TrendingUp,
  MapPin,
  RefreshCw,
  Search
} from "lucide-react";

interface WeatherData {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_deg: number;
    clouds: number;
    visibility: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
  };
  forecast: {
    date: string;
    temp_min: number;
    temp_max: number;
    description: string;
    icon: string;
  }[];
  alerts: {
    event: string;
    description: string;
    severity: string;
  }[];
}

interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export default function WeatherDashboard() {
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Default locations for maritime operations
  const defaultLocations = [
    { name: "Santos, BR", lat: -23.9608, lon: -46.3335 },
    { name: "Rio de Janeiro, BR", lat: -22.9068, lon: -43.1729 },
    { name: "Macaé, BR", lat: -22.3708, lon: -41.7869 },
    { name: "Aberdeen, UK", lat: 57.1497, lon: -2.0943 },
    { name: "Houston, US", lat: 29.7604, lon: -95.3698 }
  ];

  useEffect(() => {
    loadSavedLocations();
    // Load default location (Santos)
    fetchWeatherData(defaultLocations[0].lat, defaultLocations[0].lon, defaultLocations[0].name);
  }, []);

  const loadSavedLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("weather_forecast")
        .select("id, location")
        .order("captured_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      const locations = data?.map(item => ({
        id: item.id,
        name: item.location?.name || "Unknown",
        lat: item.location?.lat || 0,
        lon: item.location?.lng || 0
      })) || [];
      
      setSavedLocations(locations);
    } catch (error: any) {
      console.error("Error loading locations:", error);
    }
  };

  const fetchWeatherData = async (lat: number, lon: number, locationName: string) => {
    setLoading(true);
    try {
      // Mock data for demonstration - in production use OpenWeatherMap API
      const mockWeatherData: WeatherData = {
        location: {
          name: locationName,
          lat,
          lon
        },
        current: {
          temp: 22.5 + Math.random() * 10,
          feels_like: 21.5 + Math.random() * 10,
          humidity: 65 + Math.random() * 20,
          pressure: 1013 + Math.random() * 20,
          wind_speed: 5.5 + Math.random() * 10,
          wind_deg: Math.random() * 360,
          clouds: Math.random() * 100,
          visibility: 10000,
          weather: [{
            main: "Clouds",
            description: "partly cloudy",
            icon: "02d"
          }]
        },
        forecast: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          temp_min: 18 + Math.random() * 5,
          temp_max: 28 + Math.random() * 5,
          description: ["Clear", "Cloudy", "Rainy", "Partly Cloudy"][Math.floor(Math.random() * 4)],
          icon: "02d"
        })),
        alerts: Math.random() > 0.7 ? [{
          event: "Strong Wind Warning",
          description: "Wind speeds may exceed 25 knots in the next 24 hours",
          severity: "moderate"
        }] : []
      };

      setWeatherData(mockWeatherData);
      
      // Save to database
      await supabase.from("weather_forecast").insert({
        location: { lat, lng: lon, name: locationName },
        forecast: mockWeatherData.current
      });
      
      toast({
        title: "Weather data updated",
        description: `Successfully loaded weather for ${locationName}`,
      });
    } catch (error: any) {
      toast({
        title: "Error fetching weather",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes("rain")) return <CloudRain className="h-8 w-8" />;
    if (desc.includes("snow")) return <CloudSnow className="h-8 w-8" />;
    if (desc.includes("cloud")) return <Cloud className="h-8 w-8" />;
    return <Sun className="h-8 w-8" />;
  };

  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  const handleSearch = () => {
    if (searchQuery) {
      toast({
        title: "Search functionality",
        description: "Location search with geocoding API will be implemented",
      });
    }
  };

  const handleLocationSelect = (location: typeof defaultLocations[0]) => {
    setSelectedLocation(location.name);
    fetchWeatherData(location.lat, location.lon, location.name);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Cloud className="h-8 w-8 text-primary" />
            Weather Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time meteorological data for maritime operations
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-64"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => weatherData && fetchWeatherData(
              weatherData.location.lat,
              weatherData.location.lon,
              weatherData.location.name
            )}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Location Buttons */}
      <div className="flex gap-2 flex-wrap">
        {defaultLocations.map((location) => (
          <Button
            key={location.name}
            variant={selectedLocation === location.name ? "default" : "outline"}
            size="sm"
            onClick={() => handleLocationSelect(location)}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {location.name}
          </Button>
        ))}
      </div>

      {/* Weather Alerts */}
      {weatherData?.alerts && weatherData.alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              Weather Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weatherData.alerts.map((alert, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{alert.severity}</Badge>
                  <span className="font-semibold">{alert.event}</span>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Weather */}
      {weatherData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              {getWeatherIcon(weatherData.current.weather[0]?.description || "")}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {weatherData.current.temp.toFixed(1)}°C
              </div>
              <p className="text-xs text-muted-foreground">
                Feels like {weatherData.current.feels_like.toFixed(1)}°C
              </p>
              <p className="text-sm mt-2 capitalize">
                {weatherData.current.weather[0]?.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wind</CardTitle>
              <Wind className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {weatherData.current.wind_speed.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">knots</p>
              <p className="text-sm mt-2">
                Direction: {getWindDirection(weatherData.current.wind_deg)} ({weatherData.current.wind_deg.toFixed(0)}°)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Humidity</CardTitle>
              <Droplets className="h-8 w-8 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {weatherData.current.humidity.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">relative humidity</p>
              <p className="text-sm mt-2">
                Pressure: {weatherData.current.pressure.toFixed(0)} hPa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visibility</CardTitle>
              <Sun className="h-8 w-8 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(weatherData.current.visibility / 1000).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">kilometers</p>
              <p className="text-sm mt-2">
                Cloud cover: {weatherData.current.clouds.toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">
            <TrendingUp className="w-4 h-4 mr-2" />
            7-Day Forecast
          </TabsTrigger>
          <TabsTrigger value="history">
            <Cloud className="w-4 h-4 mr-2" />
            Historical Data
          </TabsTrigger>
          <TabsTrigger value="map">
            <MapPin className="w-4 h-4 mr-2" />
            Weather Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extended Forecast</CardTitle>
              <CardDescription>
                7-day weather forecast for {weatherData?.location.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weatherData?.forecast ? (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weatherData.forecast.map((day, i) => (
                    <Card key={i} className="text-center">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium mb-2">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(day.description)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{day.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {day.temp_max.toFixed(0)}°C
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {day.temp_min.toFixed(0)}°C
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a location to view forecast
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Weather Data</CardTitle>
              <CardDescription>
                Past weather conditions for selected locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Historical data visualization coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weather Heatmap</CardTitle>
              <CardDescription>
                Interactive weather visualization map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p>Weather heatmap integration with mapping service</p>
                  <p className="text-sm mt-2">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
