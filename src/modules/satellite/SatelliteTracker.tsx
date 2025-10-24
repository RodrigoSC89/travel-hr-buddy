import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Satellite, Globe, Activity, Radio, Signal } from "lucide-react";

interface SatelliteInfo {
  id: string;
  name: string;
  status: "active" | "idle" | "maintenance";
  signal: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
}

const SatelliteTracker = () => {
  const [satellites] = useState<SatelliteInfo[]>([
    {
      id: "SAT-001",
      name: "Maritime Comm 1",
      status: "active",
      signal: 95,
      latitude: -23.5505,
      longitude: -46.6333,
      altitude: 35786,
      speed: 3075
    },
    {
      id: "SAT-002",
      name: "Maritime Comm 2",
      status: "active",
      signal: 88,
      latitude: 40.7128,
      longitude: -74.0060,
      altitude: 35786,
      speed: 3075
    },
    {
      id: "SAT-003",
      name: "Navigation Sat",
      status: "idle",
      signal: 72,
      latitude: 51.5074,
      longitude: -0.1278,
      altitude: 20180,
      speed: 3874
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "idle":
        return "secondary";
      case "maintenance":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getSignalColor = (signal: number) => {
    if (signal >= 80) return "text-green-500";
    if (signal >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Satellite className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Satellite Tracker</h1>
          <p className="text-muted-foreground">Monitor satellite communications and positioning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Satellites</CardTitle>
            <Satellite className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {satellites.filter(s => s.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {satellites.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Signal</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(satellites.reduce((acc, s) => acc + s.signal, 0) / satellites.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Signal strength</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Global</div>
            <p className="text-xs text-muted-foreground">All regions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">99.9%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="satellites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="satellites">Satellites</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="satellites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Satellite Status</CardTitle>
              <CardDescription>Real-time satellite monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {satellites.map((satellite) => (
                  <div
                    key={satellite.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Satellite className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{satellite.name}</h3>
                          <Badge variant={getStatusColor(satellite.status)}>
                            {satellite.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{satellite.id}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getSignalColor(satellite.signal)}`}>
                          {satellite.signal}%
                        </div>
                        <div className="text-xs text-muted-foreground">signal</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{satellite.altitude.toLocaleString()}km</div>
                        <div className="text-xs text-muted-foreground">altitude</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{satellite.speed.toLocaleString()}m/s</div>
                        <div className="text-xs text-muted-foreground">speed</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4">
                      Track
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Global Satellite Map</CardTitle>
              <CardDescription>Real-time satellite positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center border rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="text-center space-y-2">
                  <Globe className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Interactive satellite map will be rendered here</p>
                  <p className="text-sm text-muted-foreground">Tracking {satellites.length} satellites globally</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telemetry">
          <Card>
            <CardHeader>
              <CardTitle>Telemetry Data</CardTitle>
              <CardDescription>Real-time satellite telemetry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {satellites.map((satellite) => (
                  <div key={satellite.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{satellite.name}</h3>
                      <Badge variant={getStatusColor(satellite.status)}>{satellite.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Latitude</div>
                        <div className="font-mono font-semibold">{satellite.latitude.toFixed(4)}°</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Longitude</div>
                        <div className="font-mono font-semibold">{satellite.longitude.toFixed(4)}°</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Altitude</div>
                        <div className="font-mono font-semibold">{satellite.altitude.toLocaleString()} km</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Speed</div>
                        <div className="font-mono font-semibold">{satellite.speed.toLocaleString()} m/s</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Communication Channels</CardTitle>
              <CardDescription>Satellite communication status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Radio className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-semibold">Primary Channel</div>
                      <div className="text-sm text-muted-foreground">14.5 GHz - Active</div>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Radio className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-semibold">Backup Channel</div>
                      <div className="text-sm text-muted-foreground">12.2 GHz - Standby</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Standby</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Radio className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-semibold">Emergency Channel</div>
                      <div className="text-sm text-muted-foreground">11.7 GHz - Reserved</div>
                    </div>
                  </div>
                  <Badge variant="outline">Reserved</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SatelliteTracker;
