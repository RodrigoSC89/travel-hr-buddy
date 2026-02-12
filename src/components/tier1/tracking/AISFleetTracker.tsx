/**
 * AIS Fleet Tracker - Real-time Vessel Tracking
 * Connected to Supabase via useFleetPositions hook
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useFleetPositions, type VesselPosition } from "@/hooks/useFleetPositions";
import { 
  Ship, 
  MapPin, 
  Navigation, 
  Clock,
  Anchor,
  Wind,
  Gauge,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Bell,
  Map
} from "lucide-react";

// Geofence type (static zones — could be moved to DB later)
interface Geofence {
  id: string;
  name: string;
  type: 'port' | 'exclusion_zone' | 'eca' | 'custom';
  alerts: boolean;
  vessels: string[];
}

const staticGeofences: Geofence[] = [
  { id: "g1", name: "Rotterdam Port Area", type: "port", alerts: true, vessels: [] },
  { id: "g2", name: "North Sea ECA", type: "eca", alerts: true, vessels: [] },
  { id: "g3", name: "Singapore Strait", type: "exclusion_zone", alerts: true, vessels: [] },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'underway': return 'text-success';
    case 'anchored': return 'text-warning';
    case 'moored': return 'text-primary';
    case 'not_under_command': return 'text-destructive';
    default: return 'text-muted-foreground';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'underway': return 'default';
    case 'anchored': return 'secondary';
    case 'moored': return 'outline';
    case 'not_under_command': return 'destructive';
    default: return 'outline';
  }
};

export function AISFleetTracker() {
  const { data, isLoading, error, refetch } = useFleetPositions();
  const vessels = data?.vessels || [];
  const fleetStats = data?.stats || { total: 0, underway: 0, anchored: 0, moored: 0, alerts: 0 };

  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-select first vessel when data loads
  useEffect(() => {
    if (vessels.length > 0 && !selectedVessel) {
      setSelectedVessel(vessels[0]);
    }
  }, [vessels, selectedVessel]);

  const filteredVessels = vessels.filter(v => 
    v.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.imoNumber.includes(searchQuery)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Fleet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Fleet</span>
            </div>
            <p className="text-2xl font-bold mt-2">{fleetStats.total}</p>
            <p className="text-xs text-muted-foreground">Active vessels</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">Underway</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-success">{fleetStats.underway}</p>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Anchor className="h-5 w-5 text-warning" />
              <span className="text-sm text-muted-foreground">Anchored</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-warning">{fleetStats.anchored}</p>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">In Port</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-primary">{fleetStats.moored}</p>
            <p className="text-xs text-muted-foreground">Moored</p>
          </CardContent>
        </Card>

        <Card className={fleetStats.alerts > 0 ? 'border-warning' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Bell className={`h-5 w-5 ${fleetStats.alerts > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
              <span className="text-sm text-muted-foreground">Active Alerts</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${fleetStats.alerts > 0 ? 'text-warning' : ''}`}>
              {fleetStats.alerts}
            </p>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fleet" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fleet">
            <Ship className="h-4 w-4 mr-2" />
            Fleet List
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="geofences">
            <MapPin className="h-4 w-4 mr-2" />
            Geofences
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Fleet Positions
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search vessel..." 
                      className="pl-8 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {/* Vessel List */}
                <div className="w-1/2 space-y-2 max-h-96 overflow-y-auto">
                  {filteredVessels.map((vessel) => (
                    <div 
                      key={vessel.vesselId}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedVessel?.vesselId === vessel.vesselId 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedVessel(vessel)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Ship className={`h-5 w-5 ${getStatusColor(vessel.status)}`} />
                          <div>
                            <p className="font-semibold">{vessel.vesselName}</p>
                            <p className="text-xs text-muted-foreground">
                              IMO {vessel.imoNumber} • {vessel.flag}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusBadge(vessel.status) as "default" | "secondary" | "destructive" | "outline"}>
                            {vessel.status.replace('_', ' ')}
                          </Badge>
                          {vessel.alerts.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {vessel.alerts.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vessel Details */}
                {selectedVessel && (
                  <div className="w-1/2 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">{selectedVessel.vesselName}</h3>
                      <Badge variant={getStatusBadge(selectedVessel.status) as "default" | "secondary" | "destructive" | "outline"}>
                        {selectedVessel.navigation.navStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Position
                          </p>
                          <p className="font-mono text-sm">
                            {selectedVessel.position.latitude.toFixed(4)}°N, {selectedVessel.position.longitude.toFixed(4)}°E
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Gauge className="h-3 w-3" /> Speed / Course
                          </p>
                          <p className="font-semibold">
                            {selectedVessel.navigation.speed} kn / {selectedVessel.navigation.course}°
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Wind className="h-3 w-3" /> Heading
                          </p>
                          <p className="font-semibold">{selectedVessel.navigation.heading}°</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Navigation className="h-3 w-3" /> Destination
                          </p>
                          <p className="font-semibold">{selectedVessel.navigation.destination}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> ETA
                          </p>
                          <p className="font-semibold">
                            {selectedVessel.navigation.eta 
                              ? selectedVessel.navigation.eta.toLocaleDateString() 
                              : '-'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Distance Remaining</p>
                          <p className="font-semibold">{selectedVessel.voyage.distanceRemaining} nm</p>
                        </div>
                      </div>
                    </div>

                    {selectedVessel.alerts.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          Active Alerts
                        </p>
                        {selectedVessel.alerts.map((alert) => (
                          <div key={alert.message} className={`p-2 rounded text-sm ${
                            alert.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                            alert.severity === 'warning' ? 'bg-warning/10 text-warning' :
                            'bg-info/10 text-info'
                          }`}>
                            {alert.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-right">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="h-96 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Interactive Map View</p>
                  <p className="text-sm text-muted-foreground">Mapbox/Leaflet integration</p>
                  <Button className="mt-4" variant="outline">
                    Open Full Screen Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geofences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Geofence Zones
                </div>
                <Button size="sm">
                  + Create Geofence
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staticGeofences.map((geofence: Geofence) => (
                  <div key={geofence.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className={`h-5 w-5 ${
                          geofence.type === 'port' ? 'text-primary' :
                          geofence.type === 'eca' ? 'text-success' :
                          geofence.type === 'exclusion_zone' ? 'text-destructive' : 'text-accent-foreground'
                        }`} />
                        <div>
                          <p className="font-semibold">{geofence.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {geofence.vessels.length} vessels in zone
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          geofence.type === 'eca' ? 'default' :
                          geofence.type === 'exclusion_zone' ? 'destructive' : 'outline'
                        }>
                          {geofence.type.replace('_', ' ')}
                        </Badge>
                        {geofence.alerts && (
                          <Badge variant="secondary">
                            <Bell className="h-3 w-3 mr-1" />
                            Alerts On
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vessels.flatMap(v => v.alerts.map((a, i) => ({ ...a, vessel: v.vesselName, key: `${v.vesselId}-${i}` }))).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active alerts</p>
                  </div>
                ) : (
                  vessels.flatMap(v => 
                    v.alerts.map((a: VesselPosition["alerts"][0], idx: number) => (
                      <div key={`${v.vesselId}-${idx}`} className={`p-4 border rounded-lg ${
                        a.severity === 'critical' ? 'border-destructive bg-destructive/5' :
                        a.severity === 'warning' ? 'border-warning bg-warning/5' :
                        'border-info bg-info/5'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{v.vesselName}</p>
                            <p className="text-sm">{a.message}</p>
                          </div>
                          <Badge variant={
                            a.severity === 'critical' ? 'destructive' :
                            a.severity === 'warning' ? 'secondary' : 'outline'
                          }>
                            {a.type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
