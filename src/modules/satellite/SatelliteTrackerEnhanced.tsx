// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Satellite,
  Signal,
  MapPin,
  Activity,
  RefreshCw,
  Bell,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Globe
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SatelliteTrack {
  id: string;
  satellite_name: string;
  satellite_id: string;
  tle_line1: string;
  tle_line2: string;
  current_latitude: number;
  current_longitude: number;
  altitude_km: number;
  velocity_kmps: number;
  visibility_status: string;
  last_updated: string;
}

interface CoverageEvent {
  id: string;
  satellite_id: string;
  event_type: string;
  signal_strength: number;
  timestamp: string;
}

const SatelliteTrackerEnhanced = () => {
  const { toast } = useToast();
  const [satellites, setSatellites] = useState<SatelliteTrack[]>([]);
  const [coverageEvents, setCoverageEvents] = useState<CoverageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteTrack | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadSatelliteData();
    const interval = setInterval(loadSatelliteData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSatelliteData = async () => {
    try {
      setLoading(true);

      // Load from database first
      const [satellitesData, eventsData] = await Promise.all([
        supabase
          .from('satellite_tracks')
          .select('*')
          .order('last_updated', { ascending: false }),
        supabase
          .from('satellite_coverage_events')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50)
      ]);

      if (satellitesData.data) {
        setSatellites(satellitesData.data);
      }

      if (eventsData.data) {
        setCoverageEvents(eventsData.data);
        
        // Check for new coverage events and create notifications
        const newEvents = eventsData.data.filter(e => 
          new Date(e.timestamp) > new Date(Date.now() - 60000) // Last minute
        );
        
        if (newEvents.length > 0) {
          const newNotifications = newEvents.map(e => ({
            id: e.id,
            type: e.event_type,
            message: `Satellite ${e.satellite_id} - ${e.event_type === 'entry' ? 'Entering' : 'Leaving'} coverage area`,
            timestamp: e.timestamp,
            severity: e.event_type === 'entry' ? 'info' : 'warning'
          }));
          
          setNotifications(prev => [...newNotifications, ...prev].slice(0, 20));
          
          // Show toast for new events
          if (newEvents.length > 0) {
            toast({
              title: "Coverage Event",
              description: `${newEvents.length} new satellite coverage ${newEvents.length === 1 ? 'event' : 'events'}`,
            });
          }
        }
      }

      // If no data in database, fetch from API
      if (!satellitesData.data || satellitesData.data.length === 0) {
        await fetchFromCelestrakAPI();
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading satellite data:", error);
      toast({
        title: "Error",
        description: "Failed to load satellite data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFromCelestrakAPI = async () => {
    try {
      // In a real implementation, this would fetch from Celestrak or NORAD API
      // For now, we'll create sample data
      const sampleSatellites: SatelliteTrack[] = [
        {
          id: crypto.randomUUID(),
          satellite_name: "ISS (ZARYA)",
          satellite_id: "25544",
          tle_line1: "1 25544U 98067A   24301.50000000  .00016717  00000-0  10270-3 0  9000",
          tle_line2: "2 25544  51.6400 208.9163 0002602  86.3380  43.6266 15.54225995999999",
          current_latitude: 45.5231,
          current_longitude: -122.6765,
          altitude_km: 408.5,
          velocity_kmps: 7.66,
          visibility_status: "visible",
          last_updated: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          satellite_name: "NOAA 18",
          satellite_id: "28654",
          tle_line1: "1 28654U 05018A   24301.50000000  .00000112  00000-0  70538-4 0  9990",
          tle_line2: "2 28654  99.0534 282.3791 0014530 232.4021 127.5409 14.12501077999999",
          current_latitude: -23.4567,
          current_longitude: 45.1234,
          altitude_km: 854.2,
          velocity_kmps: 7.45,
          visibility_status: "visible",
          last_updated: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          satellite_name: "STARLINK-1007",
          satellite_id: "44713",
          tle_line1: "1 44713U 19074A   24301.50000000  .00002182  00000-0  15780-3 0  9991",
          tle_line2: "2 44713  53.0538 123.4567 0001234  89.1234 270.9876 15.06391234567890",
          current_latitude: 12.3456,
          current_longitude: 78.9012,
          altitude_km: 550.0,
          velocity_kmps: 7.58,
          visibility_status: "visible",
          last_updated: new Date().toISOString()
        }
      ];

      // Save to database
      for (const sat of sampleSatellites) {
        await supabase
          .from('satellite_tracks')
          .upsert({
            satellite_name: sat.satellite_name,
            satellite_id: sat.satellite_id,
            tle_line1: sat.tle_line1,
            tle_line2: sat.tle_line2,
            current_latitude: sat.current_latitude,
            current_longitude: sat.current_longitude,
            altitude_km: sat.altitude_km,
            velocity_kmps: sat.velocity_kmps,
            visibility_status: sat.visibility_status,
            last_updated: sat.last_updated
          }, {
            onConflict: 'satellite_id'
          });
      }

      setSatellites(sampleSatellites);
      toast({
        title: "Data Updated",
        description: "Fetched latest satellite data from Celestrak API",
      });
    } catch (error) {
      console.error("Error fetching from Celestrak:", error);
    }
  };

  const getAverageSignalStrength = () => {
    const validSignals = coverageEvents.filter(e => e.signal_strength > 0);
    if (validSignals.length === 0) return 0;
    const total = validSignals.reduce((sum, e) => sum + e.signal_strength, 0);
    return (total / validSignals.length).toFixed(1);
  };

  const getActiveSatellites = () => {
    return satellites.filter(s => s.visibility_status === 'visible').length;
  };

  const getCoveragePercentage = () => {
    const visible = getActiveSatellites();
    const total = satellites.length;
    return total > 0 ? Math.round((visible / total) * 100) : 0;
  };

  const viewSatelliteDetails = (satellite: SatelliteTrack) => {
    setSelectedSatellite(satellite);
    setShowDetailsDialog(true);
  };

  if (loading && satellites.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Satellite className="h-8 w-8" />
            Satellite Tracker v1
          </h1>
          <p className="text-muted-foreground">
            Real-time orbital tracking and coverage monitoring
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={loadSatelliteData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Bell className="h-5 w-5" />
              Recent Coverage Events ({notifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="flex items-center gap-2 p-2 bg-white rounded text-sm">
                    {notif.severity === 'info' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span>{notif.message}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Satellite className="h-4 w-4" />
              Tracked Satellites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satellites.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {getActiveSatellites()} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Signal className="h-4 w-4" />
              Avg Signal Strength
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageSignalStrength()}%</div>
            <Progress value={parseFloat(getAverageSignalStrength())} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCoveragePercentage()}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Global coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Coverage Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coverageEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="satellites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="satellites">Satellite List</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Events</TabsTrigger>
          <TabsTrigger value="map">Orbital View</TabsTrigger>
        </TabsList>

        <TabsContent value="satellites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Satellite Data</CardTitle>
              <CardDescription>
                Real-time orbital elements and position data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {satellites.map((sat) => (
                    <div
                      key={sat.id}
                      className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => viewSatelliteDetails(sat)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Satellite className="h-5 w-5" />
                          <div>
                            <h4 className="font-semibold">{sat.satellite_name}</h4>
                            <p className="text-sm text-muted-foreground">ID: {sat.satellite_id}</p>
                          </div>
                        </div>
                        <Badge variant={sat.visibility_status === 'visible' ? 'default' : 'secondary'}>
                          {sat.visibility_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Altitude</p>
                          <p className="font-medium">{sat.altitude_km.toFixed(1)} km</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Velocity</p>
                          <p className="font-medium">{sat.velocity_kmps.toFixed(2)} km/s</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Latitude</p>
                          <p className="font-medium">{sat.current_latitude.toFixed(4)}°</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Longitude</p>
                          <p className="font-medium">{sat.current_longitude.toFixed(4)}°</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Events Log</CardTitle>
              <CardDescription>
                Satellite entry and exit events from coverage areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {coverageEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {event.event_type === 'entry' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            Satellite {event.satellite_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {event.event_type === 'entry' ? 'Entered' : 'Left'} coverage area
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Signal: {event.signal_strength}%</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>2D Orbital View</CardTitle>
              <CardDescription>
                Simplified orbital position map (3D view coming soon with Cesium.js)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  {/* Simple world map background */}
                  <div className="w-full h-full bg-gradient-to-b from-blue-900 to-blue-950"></div>
                </div>
                <div className="relative z-10 text-white text-center">
                  <Globe className="h-16 w-16 mx-auto mb-4 animate-spin" style={{ animationDuration: '20s' }} />
                  <p className="text-lg font-semibold mb-2">Orbital Visualization</p>
                  <p className="text-sm text-blue-200 max-w-md">
                    3D orbital visualization with Cesium.js will be implemented for enhanced tracking
                  </p>
                  <div className="mt-6 space-y-2">
                    {satellites.slice(0, 3).map((sat, idx) => (
                      <div key={sat.id} className="flex items-center gap-2 justify-center text-sm">
                        <div 
                          className="h-3 w-3 rounded-full animate-pulse"
                          style={{ 
                            backgroundColor: `hsl(${idx * 120}, 70%, 50%)`,
                            animationDelay: `${idx * 0.3}s`
                          }}
                        ></div>
                        <span>{sat.satellite_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Satellite Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              {selectedSatellite?.satellite_name}
            </DialogTitle>
            <DialogDescription>
              Detailed orbital elements and TLE data
            </DialogDescription>
          </DialogHeader>
          {selectedSatellite && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Satellite ID</Label>
                  <p className="text-sm text-muted-foreground">{selectedSatellite.satellite_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Visibility Status</Label>
                  <Badge variant={selectedSatellite.visibility_status === 'visible' ? 'default' : 'secondary'}>
                    {selectedSatellite.visibility_status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Altitude</Label>
                  <p className="text-sm text-muted-foreground">{selectedSatellite.altitude_km.toFixed(2)} km</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Velocity</Label>
                  <p className="text-sm text-muted-foreground">{selectedSatellite.velocity_kmps.toFixed(4)} km/s</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Latitude</Label>
                  <p className="text-sm text-muted-foreground">{selectedSatellite.current_latitude.toFixed(6)}°</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Longitude</Label>
                  <p className="text-sm text-muted-foreground">{selectedSatellite.current_longitude.toFixed(6)}°</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Two-Line Element (TLE)</Label>
                <div className="p-3 bg-muted rounded-lg font-mono text-xs space-y-1">
                  <div>{selectedSatellite.satellite_name}</div>
                  <div>{selectedSatellite.tle_line1}</div>
                  <div>{selectedSatellite.tle_line2}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  TLE data updated: {new Date(selectedSatellite.last_updated).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SatelliteTrackerEnhanced;

// Import Label component
import { Label } from "@/components/ui/label";
