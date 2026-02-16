import { useState } from "react";
import { useFleetStatus } from "@/hooks/useAISTracking";
import { useAISFeed } from "@/hooks/useAISFeed";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Loader2, Ship, MapPin, Navigation, Clock, Anchor, RefreshCw,
  Search, Compass, Gauge, Globe, Radio, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Fetch real vessels from database
const useFleetVessels = () => {
  return useQuery({
    queryKey: ['fleet-vessels-ais'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vessels')
        .select('id, name, imo_number, status, vessel_type, current_location, flag_state, gross_tonnage')
        .order('name');
      return data || [];
    },
    staleTime: 60_000,
  });
};

export default function AISTrackerPage() {
  const [searchMMSI, setSearchMMSI] = useState("");
  const [activeMMSI, setActiveMMSI] = useState<string | undefined>();
  const { data: fleetVessels = [], isLoading: loadingFleet } = useFleetVessels();
  const { data, isLoading, isError, error, refetch, isFetching } = useAISFeed(activeMMSI);
  const { data: fleetStatus } = useFleetStatus();

  const handleSearch = () => {
    if (searchMMSI.trim()) {
      setActiveMMSI(searchMMSI.trim());
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Radio className="h-6 w-6 text-primary" />
            AIS Fleet Tracker
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time vessel tracking • Fleet overview • Position history
          </p>
        </div>
        <div className="flex gap-2">
          {activeMMSI && (
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Fleet Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <Ship className="h-4 w-4 mx-auto text-primary" />
            <div className="text-xl font-bold">{fleetVessels.length}</div>
            <div className="text-[10px] text-muted-foreground">Total Fleet</div>
          </CardContent>
        </Card>
        <Card className="border-success/30">
          <CardContent className="pt-3 pb-2 text-center">
            <Navigation className="h-4 w-4 mx-auto text-success" />
            <div className="text-xl font-bold text-success">
              {fleetVessels.filter(v => v.status === 'active' || v.status === 'at_sea').length}
            </div>
            <div className="text-[10px] text-muted-foreground">At Sea</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <Anchor className="h-4 w-4 mx-auto text-primary" />
            <div className="text-xl font-bold">
              {fleetVessels.filter(v => v.status === 'in_port' || v.status === 'moored').length}
            </div>
            <div className="text-[10px] text-muted-foreground">In Port</div>
          </CardContent>
        </Card>
        <Card className={fleetVessels.filter(v => v.status === 'maintenance').length > 0 ? 'border-warning/30' : ''}>
          <CardContent className="pt-3 pb-2 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-warning" />
            <div className="text-xl font-bold">
              {fleetVessels.filter(v => v.status === 'maintenance').length}
            </div>
            <div className="text-[10px] text-muted-foreground">Maintenance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <Globe className="h-4 w-4 mx-auto text-primary" />
            <div className="text-xl font-bold">
              {fleetStatus?.summary?.avgSpeed?.toFixed(1) || '—'}
            </div>
            <div className="text-[10px] text-muted-foreground">Avg Speed (kts)</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fleet" className="w-full">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="fleet">Fleet Overview</TabsTrigger>
          <TabsTrigger value="search">Track by MMSI</TabsTrigger>
          <TabsTrigger value="details">Vessel Details</TabsTrigger>
        </TabsList>

        {/* Fleet Overview */}
        <TabsContent value="fleet">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Ship className="h-4 w-4" /> Registered Fleet
              </CardTitle>
              <CardDescription>Click a vessel to view AIS position data</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFleet ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 px-2">Vessel</th>
                        <th className="text-left py-2 px-2 hidden md:table-cell">Type</th>
                        <th className="text-left py-2 px-2 hidden md:table-cell">IMO</th>
                        <th className="text-left py-2 px-2">Location</th>
                        <th className="text-center py-2 px-2">Status</th>
                        <th className="text-left py-2 px-2 hidden lg:table-cell">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fleetVessels.map(vessel => (
                        <tr
                          key={vessel.id}
                          className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => {
                            if (vessel.imo_number) {
                              setSearchMMSI(vessel.imo_number);
                              setActiveMMSI(vessel.imo_number);
                            }
                          }}
                        >
                          <td className="py-2 px-2 font-medium">
                            <div className="flex items-center gap-2">
                              <Ship className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="truncate max-w-[150px]">{vessel.name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">{vessel.vessel_type}</Badge>
                          </td>
                          <td className="py-2 px-2 font-mono text-xs hidden md:table-cell">
                            {vessel.imo_number || '—'}
                          </td>
                          <td className="py-2 px-2 text-xs">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{vessel.current_location || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Badge
                              variant={vessel.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {vessel.status || 'Unknown'}
                            </Badge>
                          </td>
                          <td className="py-2 px-2 text-xs hidden lg:table-cell">
                            {vessel.flag_state}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {fleetVessels.length === 0 && !loadingFleet && (
                <div className="text-center py-12 text-muted-foreground">
                  <Ship className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No vessels registered. Add vessels to start tracking.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search by MMSI */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4" /> Search by MMSI / IMO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="mmsi">MMSI or IMO Number</Label>
                  <Input
                    id="mmsi"
                    type="text"
                    value={searchMMSI}
                    onChange={(e) => setSearchMMSI(e.target.value)}
                    placeholder="Ex: 538005989"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isLoading || !searchMMSI.trim()} className="self-end">
                  <Search className="h-4 w-4 mr-2" /> Track
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vessel Details */}
        <TabsContent value="details">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Fetching AIS data...</span>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">
                  Error: {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Vessel Data */}
          {data && !isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-info/10 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Ship className="h-4 w-4 text-primary" /> Vessel Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">MMSI/IMO</p>
                      <p className="font-mono font-bold text-sm">{activeMMSI}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="default" className="bg-success text-xs">Tracking</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-success/10 to-info/10 border-success/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-success" /> Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Lat</p>
                      <p className="font-mono font-bold text-sm">{data.track?.[0]?.lat?.toFixed(6) ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lon</p>
                      <p className="font-mono font-bold text-sm">{data.track?.[0]?.lng?.toFixed(6) ?? "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Gauge className="h-4 w-4 text-warning" /> Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Speed</p>
                      <p className="text-xl font-bold text-warning">
                        {data.track?.[0]?.speed?.toFixed(1) ?? "—"} <span className="text-sm">kts</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Course</p>
                      <p className="text-xl font-bold text-warning">
                        {data.track?.[0]?.course?.toFixed(0) ?? "—"}°
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" /> Last Update
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono">
                    {data.track?.[0]?.timestamp
                      ? new Date(data.track[0].timestamp).toLocaleString()
                      : "—"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Track History */}
          {data?.track && data.track.length > 1 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Compass className="h-4 w-4" /> Position History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 px-2">Time</th>
                        <th className="text-left py-2 px-2">Lat</th>
                        <th className="text-left py-2 px-2">Lon</th>
                        <th className="text-left py-2 px-2">Speed</th>
                        <th className="text-left py-2 px-2">Course</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.track.slice(0, 10).map((point, ptIdx) => (
                        <tr key={`track-${ptIdx}-${point.timestamp}`} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2 font-mono text-xs">
                            {point.timestamp ? new Date(point.timestamp).toLocaleString() : "—"}
                          </td>
                          <td className="py-2 px-2 font-mono text-xs">{point.lat?.toFixed(6)}</td>
                          <td className="py-2 px-2 font-mono text-xs">{point.lng?.toFixed(6)}</td>
                          <td className="py-2 px-2 text-xs">{point.speed?.toFixed(1)} kts</td>
                          <td className="py-2 px-2 text-xs">{point.course?.toFixed(0)}°</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!activeMMSI && !isLoading && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center py-12">
                <Radio className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No vessel selected</h3>
                <p className="text-muted-foreground text-sm">
                  Select a vessel from Fleet Overview or search by MMSI to start tracking.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
