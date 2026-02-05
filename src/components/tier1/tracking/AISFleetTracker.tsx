/**
 * AIS Fleet Tracker - Real-time Vessel Tracking
 * Global AIS Integration with Geofencing
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface VesselPosition {
  vesselId: string;
  vesselName: string;
  imoNumber: string;
  mmsi: string;
  flag: string;
  vesselType: string;
  position: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  navigation: {
    speed: number; // knots
    course: number; // degrees
    heading: number; // degrees
    draught: number; // meters
    destination: string;
    eta: Date | null;
    navStatus: string;
  };
  voyage: {
    currentVoyage: string | null;
    departurePort: string;
    arrivalPort: string;
    distanceRemaining: number; // nm
    distanceTraveled: number; // nm
  };
  alerts: {
    type: 'geofence' | 'speed' | 'deviation' | 'anchor' | 'weather';
    message: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: Date;
  }[];
  status: 'underway' | 'anchored' | 'moored' | 'not_under_command' | 'restricted_maneuverability';
}

interface Geofence {
  id: string;
  name: string;
  type: 'port' | 'exclusion_zone' | 'eca' | 'custom';
  polygon: { lat: number; lng: number }[];
  alerts: boolean;
  vessels: string[];
}

const mockVessels: VesselPosition[] = [
  {
    vesselId: "v1",
    vesselName: "MV Atlantic Pioneer",
    imoNumber: "9876543",
    mmsi: "123456789",
    flag: "Panama",
    vesselType: "Bulk Carrier",
    position: {
      latitude: 51.9225,
      longitude: 4.4791,
      timestamp: new Date()
    },
    navigation: {
      speed: 12.5,
      course: 245,
      heading: 243,
      draught: 11.2,
      destination: "DEHAM",
      eta: new Date(Date.now() + 86400000 * 2),
      navStatus: "Under way using engine"
    },
    voyage: {
      currentVoyage: "V2025-042",
      departurePort: "Rotterdam",
      arrivalPort: "Hamburg",
      distanceRemaining: 280,
      distanceTraveled: 45
    },
    alerts: [],
    status: 'underway'
  },
  {
    vesselId: "v2",
    vesselName: "MV Pacific Star",
    imoNumber: "9876544",
    mmsi: "987654321",
    flag: "Liberia",
    vesselType: "Container Ship",
    position: {
      latitude: 1.2655,
      longitude: 103.8200,
      timestamp: new Date()
    },
    navigation: {
      speed: 0,
      course: 0,
      heading: 180,
      draught: 12.5,
      destination: "NLRTM",
      eta: new Date(Date.now() + 86400000 * 14),
      navStatus: "At anchor"
    },
    voyage: {
      currentVoyage: "V2025-043",
      departurePort: "Singapore",
      arrivalPort: "Rotterdam",
      distanceRemaining: 8420,
      distanceTraveled: 0
    },
    alerts: [
      {
        type: 'anchor',
        message: 'Vessel at anchor for 8 hours - awaiting berth',
        severity: 'info',
        timestamp: new Date()
      }
    ],
    status: 'anchored'
  },
  {
    vesselId: "v3",
    vesselName: "MV Nordic Wind",
    imoNumber: "9876545",
    mmsi: "111222333",
    flag: "Norway",
    vesselType: "Tanker",
    position: {
      latitude: 59.9139,
      longitude: 10.7522,
      timestamp: new Date()
    },
    navigation: {
      speed: 0,
      course: 0,
      heading: 90,
      draught: 10.8,
      destination: "In Port",
      eta: null,
      navStatus: "Moored"
    },
    voyage: {
      currentVoyage: null,
      departurePort: "Oslo",
      arrivalPort: "-",
      distanceRemaining: 0,
      distanceTraveled: 0
    },
    alerts: [
      {
        type: 'weather',
        message: 'Storm warning in area - Wind 45 kn expected',
        severity: 'warning',
        timestamp: new Date()
      }
    ],
    status: 'moored'
  }
];

const mockGeofences: Geofence[] = [
  {
    id: "g1",
    name: "Rotterdam Port Area",
    type: "port",
    polygon: [],
    alerts: true,
    vessels: ["v1"]
  },
  {
    id: "g2",
    name: "North Sea ECA",
    type: "eca",
    polygon: [],
    alerts: true,
    vessels: ["v1"]
  },
  {
    id: "g3",
    name: "Singapore Strait",
    type: "exclusion_zone",
    polygon: [],
    alerts: true,
    vessels: ["v2"]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'underway': return 'text-green-500';
    case 'anchored': return 'text-yellow-500';
    case 'moored': return 'text-blue-500';
    case 'not_under_command': return 'text-red-500';
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
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(mockVessels[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const filteredVessels = mockVessels.filter(v => 
    v.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.imoNumber.includes(searchQuery)
  );

  const fleetStats = {
    total: mockVessels.length,
    underway: mockVessels.filter(v => v.status === 'underway').length,
    anchored: mockVessels.filter(v => v.status === 'anchored').length,
    moored: mockVessels.filter(v => v.status === 'moored').length,
    alerts: mockVessels.reduce((acc, v) => acc + v.alerts.length, 0)
  };

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
              <Ship className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Fleet</span>
            </div>
            <p className="text-2xl font-bold mt-2">{fleetStats.total}</p>
            <p className="text-xs text-muted-foreground">Active vessels</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Underway</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-500">{fleetStats.underway}</p>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Anchor className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Anchored</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-500">{fleetStats.anchored}</p>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">In Port</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-500">{fleetStats.moored}</p>
            <p className="text-xs text-muted-foreground">Moored</p>
          </CardContent>
        </Card>

        <Card className={fleetStats.alerts > 0 ? 'border-orange-500' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Bell className={`h-5 w-5 ${fleetStats.alerts > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
              <span className="text-sm text-muted-foreground">Active Alerts</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${fleetStats.alerts > 0 ? 'text-orange-500' : ''}`}>
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
                          <Badge variant={getStatusBadge(vessel.status) as any}>
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
                      <Badge variant={getStatusBadge(selectedVessel.status) as any}>
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
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Active Alerts
                        </p>
                        {selectedVessel.alerts.map((alert, idx) => (
                          <div key={idx} className={`p-2 rounded text-sm ${
                            alert.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                            alert.severity === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                            'bg-blue-500/10 text-blue-500'
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
                {mockGeofences.map((geofence) => (
                  <div key={geofence.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className={`h-5 w-5 ${
                          geofence.type === 'port' ? 'text-blue-500' :
                          geofence.type === 'eca' ? 'text-green-500' :
                          geofence.type === 'exclusion_zone' ? 'text-red-500' : 'text-purple-500'
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
                {mockVessels.flatMap(v => v.alerts.map(a => ({ ...a, vessel: v.vesselName }))).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active alerts</p>
                  </div>
                ) : (
                  mockVessels.flatMap(v => 
                    v.alerts.map((a, idx) => (
                      <div key={`${v.vesselId}-${idx}`} className={`p-4 border rounded-lg ${
                        a.severity === 'critical' ? 'border-red-500 bg-red-500/5' :
                        a.severity === 'warning' ? 'border-orange-500 bg-orange-500/5' :
                        'border-blue-500 bg-blue-500/5'
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
