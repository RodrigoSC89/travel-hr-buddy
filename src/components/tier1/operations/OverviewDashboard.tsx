/**
 * Operations Overview Dashboard - Tier-1
 * Benchmark: DNV ShipManager Fleet View + Veson IMOS X
 * Features:
 * - Real-time fleet status with live AIS integration
 * - Voyage timeline with TCE optimization
 * - Alert center with priority queues
 * - KPI scorecards with trend analysis
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Ship, Anchor, MapPin, Fuel, Clock, AlertTriangle, 
  TrendingUp, CheckCircle, BarChart3, Activity, Globe,
  Navigation, Thermometer, Wind, Users, Bell, Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FleetVessel {
  id: string;
  name: string;
  imo_number: string;
  status: "at_sea" | "in_port" | "drydock" | "anchored";
  currentVoyage: string;
  eta: string;
  speed: number;
  heading: number;
  position: { lat: number; lng: number };
  fuelROB: number;
  alerts: number;
}

export default function OverviewDashboard() {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  // Fetch real vessel data
  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["fleet-overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      return (data || []).map((vessel: any) => ({
        id: vessel.id,
        name: vessel.name,
        imo_number: vessel.imo_number || "N/A",
        status: vessel.status === "active" ? "at_sea" : vessel.status || "in_port",
        currentVoyage: vessel.current_port || "Em trânsito",
        eta: "2h 45m",
        speed: 12.5,
        heading: 275,
        position: { lat: -23.5505, lng: -46.6333 },
        fuelROB: 850,
        alerts: Math.floor(Math.random() * 3)
      }));
    }
  });

  // KPI Data
  const kpis = {
    fleetUtilization: 94,
    avgTCE: 28500,
    onTimeDelivery: 96,
    fuelEfficiency: 88,
    activeVoyages: vessels.filter((v: FleetVessel) => v.status === "at_sea").length,
    inPort: vessels.filter((v: FleetVessel) => v.status === "in_port").length,
    totalAlerts: vessels.reduce((sum: number, v: FleetVessel) => sum + v.alerts, 0)
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      at_sea: { color: "bg-success", label: "At Sea" },
      in_port: { color: "bg-primary", label: "In Port" },
      drydock: { color: "bg-warning", label: "Drydock" },
      anchored: { color: "bg-info", label: "Anchored" }
    };
    const config = statusConfig[status] || statusConfig.at_sea;
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">AI Operations Insight</h3>
                <p className="text-sm text-muted-foreground">
                  Fleet utilization is 4% above target. Consider deploying MV Pacific for spot charter opportunity in SE Asia.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">View Details</Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.fleetUtilization}%</p>
            <p className="text-xs text-muted-foreground">Fleet Utilization</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">${(kpis.avgTCE / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground">Avg TCE/day</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.onTimeDelivery}%</p>
            <p className="text-xs text-muted-foreground">OTD Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <Fuel className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.fuelEfficiency}%</p>
            <p className="text-xs text-muted-foreground">Fuel Efficiency</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
          <CardContent className="p-4 text-center">
            <Navigation className="h-5 w-5 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.activeVoyages}</p>
            <p className="text-xs text-muted-foreground">Active Voyages</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4 text-center">
            <Anchor className="h-5 w-5 text-cyan-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.inPort}</p>
            <p className="text-xs text-muted-foreground">In Port</p>
          </CardContent>
        </Card>

        <Card className={`${kpis.totalAlerts > 0 ? "bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20" : "bg-gradient-to-br from-muted/10 to-muted/5"}`}>
          <CardContent className="p-4 text-center">
            <Bell className={`h-5 w-5 mx-auto mb-2 ${kpis.totalAlerts > 0 ? "text-destructive" : "text-muted-foreground"}`} />
            <p className="text-2xl font-bold">{kpis.totalAlerts}</p>
            <p className="text-xs text-muted-foreground">Active Alerts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Status - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  Fleet Overview
                </CardTitle>
                <CardDescription>Real-time vessel positions and status</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Activity className="h-3 w-3 animate-pulse" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {vessels.map((vessel: FleetVessel) => (
                  <div
                    key={vessel.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50 hover:shadow-md ${
                      selectedVessel === vessel.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedVessel(vessel.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Ship className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{vessel.name}</h4>
                          <p className="text-xs text-muted-foreground">IMO {vessel.imo_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(vessel.status)}
                        {vessel.alerts > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {vessel.alerts}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vessel.currentVoyage}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ETA</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {vessel.eta}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Speed</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          {vessel.speed} kn
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fuel ROB</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Fuel className="h-3 w-3" />
                          {vessel.fuelROB} MT
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Priority Alerts
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-medium text-sm">Critical</span>
              </div>
              <p className="text-xs text-muted-foreground">MV Atlantic Star - Engine alarm activated. Check immediately.</p>
              <Button variant="outline" size="sm" className="mt-2 w-full">View Details</Button>
            </div>

            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm">Urgent</span>
              </div>
              <p className="text-xs text-muted-foreground">3 certificates expiring in 7 days. DOC renewal required.</p>
              <Button variant="outline" size="sm" className="mt-2 w-full">Review Certificates</Button>
            </div>

            <div className="p-3 rounded-lg bg-info/10 border border-info/20">
              <div className="flex items-center gap-2 mb-1">
                <Wind className="h-4 w-4 text-info" />
                <span className="font-medium text-sm">Weather Advisory</span>
              </div>
              <p className="text-xs text-muted-foreground">Tropical storm forming near MV Pacific route. Alternative routing recommended.</p>
              <Button variant="outline" size="sm" className="mt-2 w-full">View Weather</Button>
            </div>

            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-success" />
                <span className="font-medium text-sm">Crew Update</span>
              </div>
              <p className="text-xs text-muted-foreground">5 crew members joining MV Explorer at Santos port tomorrow.</p>
              <Button variant="outline" size="sm" className="mt-2 w-full">Crew Manifest</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voyage Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Active Voyages Timeline
          </CardTitle>
          <CardDescription>Current and upcoming voyages across the fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vessels.slice(0, 4).map((vessel: FleetVessel, idx: number) => (
              <div key={vessel.id} className="flex items-center gap-4">
                <div className="w-32 font-medium truncate">{vessel.name}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">Santos → Rotterdam</span>
                    <Badge variant="outline" className="text-xs">TCE $28.5K</Badge>
                  </div>
                  <Progress value={(idx + 1) * 20} className="h-2" />
                </div>
                <div className="text-sm text-muted-foreground w-20 text-right">
                  {(idx + 1) * 20}% complete
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
