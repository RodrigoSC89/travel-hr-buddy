/**
 * Tracking Command Pro - Tier-1 Component
 * Based on MarineTraffic and VesselFinder best practices
 * Real-time AIS tracking with alerts and geofencing
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Navigation, Ship, MapPin, Anchor, Clock, Bell,
  Fuel, Wind, Waves, AlertTriangle, CheckCircle,
  Search, Filter, RefreshCw, Maximize2, Radio
} from "lucide-react";

// Sample vessel tracking data
const vesselPositions = [
  {
    id: "1",
    name: "MV Nautilus Star",
    imo: "9876543",
    mmsi: "123456789",
    type: "Bulk Carrier",
    flag: "🇵🇦 Panama",
    position: { lat: 1.2897, lng: 103.8501 },
    course: 245,
    speed: 12.5,
    heading: 248,
    destination: "Shanghai, China",
    eta: "2026-02-28 14:00",
    status: "underway",
    lastUpdate: "2 min ago",
  },
  {
    id: "2",
    name: "MV Ocean Explorer",
    imo: "9876544",
    mmsi: "123456790",
    type: "Container Ship",
    flag: "🇱🇷 Liberia",
    position: { lat: 22.3193, lng: 114.1694 },
    course: 180,
    speed: 0,
    heading: 185,
    destination: "Hong Kong",
    eta: "In Port",
    status: "moored",
    lastUpdate: "5 min ago",
  },
  {
    id: "3",
    name: "MV Pacific Trader",
    imo: "9876545",
    mmsi: "123456791",
    type: "Tanker",
    flag: "🇲🇭 Marshall Islands",
    position: { lat: 35.4437, lng: 139.6380 },
    course: 90,
    speed: 14.2,
    heading: 88,
    destination: "Los Angeles, USA",
    eta: "2026-03-15 08:00",
    status: "underway",
    lastUpdate: "1 min ago",
  },
  {
    id: "4",
    name: "MV Atlantic Carrier",
    imo: "9876546",
    mmsi: "123456792",
    type: "Bulk Carrier",
    flag: "🇸🇬 Singapore",
    position: { lat: 51.9000, lng: 4.5000 },
    course: 270,
    speed: 0,
    heading: 265,
    destination: "Rotterdam",
    eta: "In Port",
    status: "at_anchor",
    lastUpdate: "3 min ago",
  },
];

const activeAlerts = [
  { vessel: "MV Pacific Trader", type: "geofence", message: "Entered Exclusive Economic Zone - Japan", time: "10 min ago", severity: "info" },
  { vessel: "MV Nautilus Star", type: "weather", message: "High winds forecast on route (>35 knots)", time: "1 hour ago", severity: "warning" },
  { vessel: "MV Atlantic Carrier", type: "delay", message: "ETA delayed by 6 hours due to port congestion", time: "2 hours ago", severity: "info" },
];

export default function TrackingCommandPro() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVessel, setSelectedVessel] = useState(vesselPositions[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'underway': return 'bg-success';
      case 'moored': return 'bg-primary';
      case 'at_anchor': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'underway': return 'Underway';
      case 'moored': return 'Moored';
      case 'at_anchor': return 'At Anchor';
      default: return status;
    }
  };

  const underwayCount = vesselPositions.filter(v => v.status === 'underway').length;
  const inPortCount = vesselPositions.filter(v => v.status === 'moored').length;
  const atAnchorCount = vesselPositions.filter(v => v.status === 'at_anchor').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="h-6 w-6 text-cyan-500" />
            Tracking Command
          </h2>
          <p className="text-muted-foreground">
            Real-time AIS tracking - MarineTraffic Integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-1" />
            Full Map
          </Button>
        </div>
      </div>

      {/* Fleet Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Fleet</p>
            <p className="text-2xl font-bold">{vesselPositions.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Underway</p>
            <p className="text-2xl font-bold text-success">{underwayCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">In Port</p>
            <p className="text-2xl font-bold">{inPortCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">At Anchor</p>
            <p className="text-2xl font-bold text-warning">{atAnchorCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Fleet Positions
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search vessels..." 
                className="pl-8 h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {vesselPositions.map((vessel) => (
                <div 
                  key={vessel.id}
                  className={`flex items-center justify-between p-3 border-b cursor-pointer transition-colors ${
                    selectedVessel.id === vessel.id ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedVessel(vessel)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(vessel.status)}`} />
                    <div>
                      <p className="font-medium text-sm">{vessel.name}</p>
                      <p className="text-xs text-muted-foreground">{vessel.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{vessel.speed} kn</p>
                    <p className="text-xs text-muted-foreground">{vessel.lastUpdate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vessel Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ship className="h-4 w-4" />
                {selectedVessel.name}
              </CardTitle>
              <Badge className={getStatusColor(selectedVessel.status)}>
                {getStatusLabel(selectedVessel.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Map Placeholder */}
            <div className="h-[200px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg flex items-center justify-center mb-4 border">
              <div className="text-center">
                <Navigation className="h-12 w-12 mx-auto text-cyan-500 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Position: {selectedVessel.position.lat.toFixed(4)}°N, {selectedVessel.position.lng.toFixed(4)}°E
                </p>
              </div>
            </div>

            {/* Vessel Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Speed</p>
                <p className="text-lg font-bold">{selectedVessel.speed} kn</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Course</p>
                <p className="text-lg font-bold">{selectedVessel.course}°</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Heading</p>
                <p className="text-lg font-bold">{selectedVessel.heading}°</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">IMO</p>
                <p className="text-lg font-bold">{selectedVessel.imo}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Destination</p>
                </div>
                <p className="font-medium">{selectedVessel.destination}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">ETA</p>
                </div>
                <p className="font-medium">{selectedVessel.eta}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-success" />
                <span className="text-xs">AIS Active</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last Update: {selectedVessel.lastUpdate}
              </div>
              <div className="text-xs">{selectedVessel.flag}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <div key={alert.message} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    {alert.severity === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    ) : (
                      <Bell className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.vessel}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
