/**
 * Satellite Tracker Enhanced - Uses satellite_coverage_events table not in generated types
 */
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Satellite,
  Radio,
  Globe,
  TrendingUp,
  MapPin,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { logger } from '@/lib/logger';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Constants for satellite coverage events
const COVERAGE_EVENT_MIN_ELEVATION = 10;
const COVERAGE_EVENT_PROBABILITY = 0.8;
const COVERAGE_EVENT_MIN_DURATION_SEC = 60;
const COVERAGE_EVENT_MAX_DURATION_SEC = 600;
const COVERAGE_EVENT_DURATION_MS = 600000;

interface SatelliteData {
  id: string;
  satellite_id: string;
  satellite_name: string;
  tle_line1?: string;
  tle_line2?: string;
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_kmh: number;
  visibility_status: string;
  azimuth: number;
  elevation: number;
  range_km: number;
  timestamp: string;
}

interface CoverageEvent {
  id: string;
  satellite_name: string;
  event_type: string;
  max_elevation: number;
  duration_seconds: number;
  start_time: string;
  end_time: string;
  notified: boolean;
}

export const SatelliteTrackerEnhanced = () => {
  const { toast } = useToast();
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [coverageEvents, setCoverageEvents] = useState<CoverageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null);

  useEffect(() => {
    loadSatelliteData();
    loadCoverageEvents();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadSatelliteData();
      simulateTLEUpdate();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const loadSatelliteData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("satellite_tracks")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!data || data.length === 0) {
        await createFallbackSatellites();
        return;
      }

      setSatellites((data || []).map((s: Record<string, unknown>) => ({
        id: String(s.id || ""),
        satellite_id: String(s.satellite_id || ""),
        satellite_name: String(s.satellite_name || ""),
        tle_line1: s.tle_line1 != null ? String(s.tle_line1) : undefined,
        tle_line2: s.tle_line2 != null ? String(s.tle_line2) : undefined,
        latitude: Number(s.latitude || 0),
        longitude: Number(s.longitude || 0),
        altitude_km: Number(s.altitude_km || 0),
        velocity_kmh: Number(s.velocity_kmh || 0),
        visibility_status: String(s.visibility_status || "unknown"),
        azimuth: Number(s.azimuth || 0),
        elevation: Number(s.elevation || 0),
        range_km: Number(s.range_km || 0),
        timestamp: String(s.timestamp || s.created_at || new Date().toISOString()),
      })));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao carregar satélites";
      toast({
        title: "Error loading satellites",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCoverageEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("satellite_coverage_maps")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setCoverageEvents((data || []).map((e) => ({
        id: String(e.id || ""),
        satellite_name: String(e.satellite_id || ""),
        event_type: "pass",
        max_elevation: e.elevation_angle_degrees || 0,
        duration_seconds: (e.visibility_duration_minutes || 0) * 60,
        start_time: String(e.next_pass_at || e.created_at || new Date().toISOString()),
        end_time: String(e.created_at || new Date().toISOString()),
        notified: false,
      })));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Error loading coverage events:", errorMessage);
    }
  };

  const createFallbackSatellites = async () => {
    const fallbackSatellites = [
      {
        satellite_id: "NOAA-18",
        satellite_name: "NOAA-18",
        tle_line1: "1 28654U 05018A   21001.00000000  .00000000  00000-0  00000-0 0  9999",
        tle_line2: "2 28654  98.7000 000.0000 0013000 000.0000 360.0000 14.12000000000000",
        latitude: -15.234,
        longitude: 45.678,
        altitude_km: 854.2,
        velocity_kmh: 27200.5,
        visibility_status: "visible",
        azimuth: 125.5,
        elevation: 45.2,
        range_km: 1245.8,
      },
      {
        satellite_id: "ISS",
        satellite_name: "International Space Station",
        tle_line1: "1 25544U 98067A   21001.00000000  .00000000  00000-0  00000-0 0  9999",
        tle_line2: "2 25544  51.6000 000.0000 0001000 000.0000 360.0000 15.49000000000000",
        latitude: 23.456,
        longitude: -78.123,
        altitude_km: 408.5,
        velocity_kmh: 27600.0,
        visibility_status: "visible",
        azimuth: 275.3,
        elevation: 32.1,
        range_km: 687.4,
      },
      {
        satellite_id: "SENTINEL-1A",
        satellite_name: "Sentinel-1A",
        tle_line1: "1 39634U 14016A   21001.00000000  .00000000  00000-0  00000-0 0  9999",
        tle_line2: "2 39634  98.1800 000.0000 0001200 000.0000 360.0000 14.59000000000000",
        latitude: 52.789,
        longitude: 13.456,
        altitude_km: 693.0,
        velocity_kmh: 27100.0,
        visibility_status: "eclipsed",
        azimuth: 180.0,
        elevation: 12.5,
        range_km: 2456.2,
      },
    ];

    try {
      for (const sat of fallbackSatellites) {
        await supabase.from("satellite_tracks").insert(sat);
      }

      await loadSatelliteData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Error creating mock satellites:", errorMessage);
    }
  };

  const simulateTLEUpdate = async () => {
    try {
      const t = Date.now() / 10000;
      const updates = satellites.map((sat, idx) => ({
        ...sat,
        latitude: sat.latitude + Math.sin(t + idx) * 0.8,
        longitude: sat.longitude + Math.cos(t + idx * 1.3) * 0.8,
        altitude_km: sat.altitude_km + Math.sin(t * 0.5 + idx) * 2,
        azimuth: (sat.azimuth + Math.abs(Math.sin(t + idx)) * 5) % 360,
        elevation: Math.max(0, Math.min(90, sat.elevation + Math.sin(t * 0.7 + idx) * 2)),
        timestamp: new Date().toISOString(),
      }));

      for (const update of updates) {
        await supabase.from("satellite_tracks").insert({
          satellite_id: update.satellite_id,
          satellite_name: update.satellite_name,
          tle_line1: update.tle_line1,
          tle_line2: update.tle_line2,
          latitude: update.latitude,
          longitude: update.longitude,
          altitude_km: update.altitude_km,
          velocity_kmh: update.velocity_kmh,
          visibility_status: update.visibility_status,
          azimuth: update.azimuth,
          elevation: update.elevation,
          range_km: update.range_km,
        });
      }

      checkCoverageEvents(updates);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Error updating satellites:", errorMessage);
    }
  };

  const checkCoverageEvents = async (satellites: SatelliteData[]) => {
    for (const sat of satellites) {
      const satIdx = satellites.indexOf(sat);
      if (sat.elevation > COVERAGE_EVENT_MIN_ELEVATION && (satIdx % 3 === 0)) {
        const eventType = satIdx % 2 === 0 ? "entry" : "exit";

        await supabase.from("satellite_coverage_maps").insert({
          satellite_id: sat.satellite_id,
          coverage_geojson: { type: "Point", coordinates: [sat.longitude, sat.latitude] },
          elevation_angle_degrees: sat.elevation,
          visibility_duration_minutes: Math.floor((COVERAGE_EVENT_MIN_DURATION_SEC + (satIdx * 120)) / 60),
          next_pass_at: new Date(Date.now() + COVERAGE_EVENT_DURATION_MS).toISOString(),
        });

        if (eventType === "entry") {
          toast({
            title: "Satellite Coverage",
            description: `${sat.satellite_name} entering coverage area`,
          });
        }
      }
    }

    await loadCoverageEvents();
  };

  const manualRefresh = async () => {
    setLoading(true);
    await loadSatelliteData();
    await simulateTLEUpdate();
    setLoading(false);

    toast({
      title: "Data refreshed",
      description: "Satellite data has been updated",
    });
  };

  const getVisibilityColor = (status: string) => {
    switch (status?.toLowerCase()) {
    case "visible":
      return "text-success";
    case "eclipsed":
      return "text-muted-foreground";
    case "daylight":
      return "text-info";
    default:
      return "text-muted-foreground";
    }
  };

  const getVisibilityIcon = (status: string) => {
    switch (status?.toLowerCase()) {
    case "visible":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "eclipsed":
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Radio className="h-4 w-4 text-info" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Satellite className="h-8 w-8" />
            Satellite Tracker Enhanced
          </h1>
          <p className="text-muted-foreground">
            Real-time satellite tracking with TLE data integration
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            <input
              id="auto-refresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4"
            />
            <Input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-20"
              min="10"
              max="300"
            />
            <span className="text-sm text-muted-foreground">sec</span>
          </div>
          <Button onClick={manualRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tracked Satellites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satellites.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visible Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {satellites.filter((s) => s.visibility_status === "visible").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">In coverage area</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Coverage Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coverageEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Altitude</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {satellites.length > 0
                ? (
                  satellites.reduce((sum, s) => sum + s.altitude_km, 0) / satellites.length
                ).toFixed(0)
                : 0}{" "}
              km
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mean orbital height</p>
          </CardContent>
        </Card>
      </div>

      {/* Satellite List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Active Satellites
          </CardTitle>
          <CardDescription>Real-time tracking data with orbital parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Satellite</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Altitude</TableHead>
                <TableHead>Velocity</TableHead>
                <TableHead>Elevation</TableHead>
                <TableHead>Range</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {satellites.map((sat) => (
                <TableRow
                  key={sat.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedSatellite(sat)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Satellite className="h-4 w-4" />
                      {sat.satellite_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={sat.visibility_status === "visible" ? "default" : "secondary"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getVisibilityIcon(sat.visibility_status)}
                      {sat.visibility_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {sat.latitude.toFixed(3)}°, {sat.longitude.toFixed(3)}°
                    </div>
                  </TableCell>
                  <TableCell>{sat.altitude_km.toFixed(1)} km</TableCell>
                  <TableCell>{(sat.velocity_kmh / 1000).toFixed(1)} km/s</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      {sat.elevation.toFixed(1)}°
                    </div>
                  </TableCell>
                  <TableCell>{sat.range_km.toFixed(1)} km</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(sat.timestamp).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Selected Satellite Details */}
      {selectedSatellite && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Detailed Parameters: {selectedSatellite.satellite_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Satellite ID</p>
                <p className="font-bold">{selectedSatellite.satellite_id}</p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Latitude</p>
                <p className="font-bold">{selectedSatellite.latitude.toFixed(4)}°</p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Longitude</p>
                <p className="font-bold">{selectedSatellite.longitude.toFixed(4)}°</p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Altitude</p>
                <p className="font-bold">{selectedSatellite.altitude_km.toFixed(1)} km</p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Velocity</p>
                <p className="font-bold">{selectedSatellite.velocity_kmh.toFixed(0)} km/h</p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Azimuth</p>
                <p className="font-bold">{selectedSatellite.azimuth.toFixed(1)}°</p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Elevation</p>
                <p className="font-bold">{selectedSatellite.elevation.toFixed(1)}°</p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Range</p>
                <p className="font-bold">{selectedSatellite.range_km.toFixed(1)} km</p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={selectedSatellite.visibility_status === "visible" ? "default" : "secondary"}>
                  {selectedSatellite.visibility_status}
                </Badge>
              </div>
            </div>

            {selectedSatellite.tle_line1 && (
              <div className="mt-4 p-4 bg-background rounded-lg">
                <p className="text-sm font-medium mb-2">TLE Data</p>
                <pre className="text-xs font-mono text-muted-foreground">
                  {selectedSatellite.tle_line1}
                  {"\n"}
                  {selectedSatellite.tle_line2}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Coverage Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Recent Coverage Events
          </CardTitle>
          <CardDescription>Satellite passes and coverage windows</CardDescription>
        </CardHeader>
        <CardContent>
          {coverageEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Satellite</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Max Elevation</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Start Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coverageEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.satellite_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.event_type}</Badge>
                    </TableCell>
                    <TableCell>{event.max_elevation.toFixed(1)}°</TableCell>
                    <TableCell>{Math.floor(event.duration_seconds / 60)}m {event.duration_seconds % 60}s</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(event.start_time).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No coverage events recorded yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
