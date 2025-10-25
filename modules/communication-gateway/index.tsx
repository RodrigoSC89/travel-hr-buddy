// PATCH 109.0: SATCOM & AIS Integrations (Mock)
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { 
  Satellite, 
  Radio, 
  Ship,
  SignalHigh,
  SignalMedium,
  SignalLow,
  AlertCircle,
  CheckCircle,
  Globe,
  Navigation
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SatcomStatus {
  connected: boolean;
  signal_strength: 'high' | 'medium' | 'low' | 'offline';
  last_contact: string;
  data_usage: number;
  mode: 'online' | 'offline';
}

interface AISVessel {
  id: string;
  name: string;
  imo_code: string;
  mmsi: string;
  position: {
    lat: number;
    lng: number;
  };
  course: number;
  speed: number;
  distance: number;
  vessel_type: string;
  last_update: string;
}

const CommunicationGateway: React.FC = () => {
  const [satcomStatus, setSatcomStatus] = useState<SatcomStatus>({
    connected: true,
    signal_strength: 'high',
    last_contact: new Date().toISOString(),
    data_usage: 67.5,
    mode: 'online',
  });

  const [nearbyVessels, setNearbyVessels] = useState<AISVessel[]>([
    {
      id: '1',
      name: 'MV Pacific Star',
      imo_code: 'IMO9876543',
      mmsi: '123456789',
      position: { lat: -23.5505, lng: -46.6333 },
      course: 180,
      speed: 12.5,
      distance: 5.2,
      vessel_type: 'Cargo Ship',
      last_update: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'SS Ocean Pearl',
      imo_code: 'IMO9123456',
      mmsi: '987654321',
      position: { lat: -23.5400, lng: -46.6200 },
      course: 90,
      speed: 10.0,
      distance: 8.7,
      vessel_type: 'Tanker',
      last_update: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'RV Atlantic Explorer',
      imo_code: 'IMO9234567',
      mmsi: '456789123',
      position: { lat: -23.5600, lng: -46.6400 },
      course: 45,
      speed: 8.3,
      distance: 12.1,
      vessel_type: 'Research Vessel',
      last_update: new Date().toISOString(),
    },
  ]);

  const toggleSatcomConnection = () => {
    const newStatus = !satcomStatus.connected;
    setSatcomStatus({
      ...satcomStatus,
      connected: newStatus,
      signal_strength: newStatus ? 'high' : 'offline',
      mode: newStatus ? 'online' : 'offline',
    });

    toast({
      title: newStatus ? "SATCOM Connected" : "SATCOM Disconnected",
      description: newStatus 
        ? "Satellite communication established" 
        : "Switched to offline mode",
    });
  };

  const simulateFallback = () => {
    setSatcomStatus({
      ...satcomStatus,
      connected: false,
      signal_strength: 'offline',
      mode: 'offline',
    });

    toast({
      title: "Offline Mode Activated",
      description: "Operating with local cache",
      variant: "default",
    });
  };

  const getSignalIcon = (strength: string) => {
    switch (strength) {
      case 'high':
        return <SignalHigh className="h-5 w-5 text-green-600" />;
      case 'medium':
        return <SignalMedium className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <SignalLow className="h-5 w-5 text-orange-600" />;
      case 'offline':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <SignalHigh className="h-5 w-5" />;
    }
  };

  const getSignalBadge = (strength: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      high: { variant: "default", label: "High" },
      medium: { variant: "secondary", label: "Medium" },
      low: { variant: "outline", label: "Low" },
      offline: { variant: "destructive", label: "Offline" },
    };
    const config = variants[strength] || variants.offline;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <ModulePageWrapper>
      <ModuleHeader
        title="Communication Gateway"
        description="SATCOM and AIS integration for maritime communications"
        icon={Radio}
      />

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SATCOM Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSignalIcon(satcomStatus.signal_strength)}
                <span className="text-2xl font-bold">
                  {satcomStatus.connected ? 'Online' : 'Offline'}
                </span>
              </div>
              {getSignalBadge(satcomStatus.signal_strength)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satcomStatus.data_usage}%</div>
            <p className="text-xs text-muted-foreground">Of monthly allowance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nearby Vessels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nearbyVessels.length}</div>
            <p className="text-xs text-muted-foreground">Within AIS range</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="satcom" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="satcom">SATCOM</TabsTrigger>
          <TabsTrigger value="ais">AIS</TabsTrigger>
        </TabsList>

        <TabsContent value="satcom" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Satellite Communication</CardTitle>
                  <CardDescription>Manage satellite connection and status</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={simulateFallback}
                  >
                    Simulate Offline
                  </Button>
                  <Button 
                    variant={satcomStatus.connected ? "destructive" : "default"}
                    onClick={toggleSatcomConnection}
                  >
                    {satcomStatus.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Connection Status */}
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Satellite className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Connection Status</h3>
                        <p className="text-sm text-muted-foreground">
                          {satcomStatus.connected 
                            ? 'Satellite link established' 
                            : 'No satellite connection'}
                        </p>
                      </div>
                    </div>
                    {satcomStatus.connected ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Signal Strength</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getSignalIcon(satcomStatus.signal_strength)}
                        <span className="font-medium capitalize">
                          {satcomStatus.signal_strength}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Contact</p>
                      <p className="font-medium mt-1">
                        {new Date(satcomStatus.last_contact).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mode</p>
                      <Badge variant={satcomStatus.mode === 'online' ? 'default' : 'secondary'} className="mt-1">
                        {satcomStatus.mode}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data Usage</p>
                      <p className="font-medium mt-1">{satcomStatus.data_usage}%</p>
                    </div>
                  </div>
                </div>

                {/* Fallback Notice */}
                {!satcomStatus.connected && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-orange-900">Offline Mode Active</h4>
                          <p className="text-sm text-orange-700 mt-1">
                            System is operating with local cache. Some features may be limited.
                            Data will sync automatically when connection is restored.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Connection Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Connection Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Provider</dt>
                        <dd className="text-sm font-medium">Inmarsat Fleet Xpress</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Satellite</dt>
                        <dd className="text-sm font-medium">I-4 F3 (Americas)</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Bandwidth</dt>
                        <dd className="text-sm font-medium">512 Kbps</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Latency</dt>
                        <dd className="text-sm font-medium">600 ms</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ais" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Identification System (AIS)</CardTitle>
              <CardDescription>Track nearby vessels and maritime traffic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nearbyVessels.map((vessel) => (
                  <Card key={vessel.id} className="hover:bg-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Ship className="h-6 w-6 text-blue-600" />
                            <div>
                              <h4 className="font-semibold">{vessel.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {vessel.vessel_type}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">IMO</p>
                              <p className="text-sm font-medium">{vessel.imo_code}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">MMSI</p>
                              <p className="text-sm font-medium">{vessel.mmsi}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Course</p>
                              <p className="text-sm font-medium">{vessel.course}°</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Speed</p>
                              <p className="text-sm font-medium">{vessel.speed} knots</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{vessel.distance} nm</div>
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <Badge variant="outline" className="mt-2">
                            <Navigation className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AIS Info */}
              <Card className="mt-6 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">AIS Integration</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This is a mock implementation of AIS vessel tracking. 
                        Future integration with MarineTraffic or similar services will provide 
                        real-time vessel positions and traffic information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default CommunicationGateway;
