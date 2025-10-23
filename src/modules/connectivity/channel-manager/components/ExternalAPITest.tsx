import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Satellite, Cloud, Anchor, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export function ExternalAPITest() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [satelliteData, setSatelliteData] = useState<any>(null);
  const [aisData, setAisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-gateway`;

  const callExternalAPI = async (endpoint: string, setter: (data: any) => void) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setter(data);
      
      toast({
        title: "API Success",
        description: `${endpoint} data retrieved successfully`,
      });
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      toast({
        title: "API Error",
        description: error instanceof Error ? error.message : "Failed to fetch data",
        variant: "destructive"
      });
      setter({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">External API Integration Test</h2>
        <p className="text-muted-foreground">
          Test connections to external data sources through the API Gateway
        </p>
      </div>

      {/* Weather API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            Weather API
          </CardTitle>
          <CardDescription>
            Real-time weather data for maritime operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => callExternalAPI('weather?location=Santos', setWeatherData)}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Fetch Weather Data
          </Button>

          {weatherData && (
            <div className="p-3 bg-muted rounded-lg">
              {weatherData.error ? (
                <div className="flex items-center gap-2 text-red-500">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">{weatherData.error}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-500 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium">{weatherData.location}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Temperature:</span>
                      <p className="font-medium">{weatherData.temperature}°C</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conditions:</span>
                      <Badge variant="outline">{weatherData.conditions}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Wind:</span>
                      <p className="font-medium">{weatherData.wind_speed} km/h</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Satellite API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="w-5 h-5 text-purple-500" />
            Satellite Tracking
          </CardTitle>
          <CardDescription>
            Real-time vessel positioning via satellite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => callExternalAPI('satellite?vessel_id=NAV-001', setSatelliteData)}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Fetch Satellite Data
          </Button>

          {satelliteData && (
            <div className="p-3 bg-muted rounded-lg">
              {satelliteData.error ? (
                <div className="flex items-center gap-2 text-red-500">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">{satelliteData.error}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-500 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Tracking Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Vessel ID:</span>
                      <p className="font-medium">{satelliteData.vessel_id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Speed:</span>
                      <p className="font-medium">{satelliteData.speed} knots</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Position:</span>
                      <p className="font-medium text-xs">
                        {satelliteData.position?.latitude.toFixed(4)}, {satelliteData.position?.longitude.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Signal:</span>
                      <Badge variant="outline">{satelliteData.satellite_signal}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AIS API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-orange-500" />
            AIS Vessel Traffic
          </CardTitle>
          <CardDescription>
            Automatic Identification System data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => callExternalAPI('ais?area=Santos%20Port', setAisData)}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Fetch AIS Data
          </Button>

          {aisData && (
            <div className="p-3 bg-muted rounded-lg">
              {aisData.error ? (
                <div className="flex items-center gap-2 text-red-500">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">{aisData.error}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-500 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">AIS Online</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Area:</span>
                      <p className="font-medium">{aisData.area}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vessels:</span>
                      <p className="font-medium">{aisData.vessels_detected}</p>
                    </div>
                  </div>
                  
                  {aisData.vessels && aisData.vessels.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Nearby Vessels:</span>
                      {aisData.vessels.slice(0, 3).map((vessel: any, idx: number) => (
                        <div key={idx} className="p-2 bg-background rounded border">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{vessel.name}</span>
                            <Badge variant="secondary" className="text-xs">{vessel.type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            MMSI: {vessel.mmsi} | Speed: {vessel.speed} kn
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
