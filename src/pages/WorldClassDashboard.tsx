/**
 * WorldClassDashboard v2 - Unified Command Center
 * Full-stack integration: Edge Functions ↔ Supabase ↔ UI
 * Surpasses: Veson, AMOS, DNV, Compas, RightShip, Kongsberg
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Trophy, Ship, Wrench, Shield, Users, Leaf, BarChart3, RefreshCw, DollarSign,
} from "lucide-react";

import { TCEBenchmark } from "@/components/voyage/TCEBenchmark";
import { CIIRatingDashboard } from "@/components/esg/CIIRatingDashboard";
import { ComplianceScoreRealTime } from "@/components/compliance/ComplianceScoreRealTime";
import { MaintenanceKPIs } from "@/components/maintenance/MaintenanceKPIs";
import { FleetSTCWDashboard } from "@/components/crew/FleetSTCWDashboard";

export default function WorldClassDashboard() {
  const [selectedVessel, setSelectedVessel] = useState<string>("");

  const { data: vessels } = useQuery({
    queryKey: ["vessels-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, vessel_type")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Dynamic TCE from voyage data
  const { data: voyageTCE } = useQuery({
    queryKey: ["voyage-tce", selectedVessel],
    queryFn: async () => {
      const query = supabase
        .from("voyage_plans")
        .select("distance_nm, estimated_fuel_consumption, departure_date, arrival_date")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(5);
      
      const finalQuery = selectedVessel ? query.eq("vessel_id", selectedVessel) : query;
      const { data } = await finalQuery;
      
      if (!data || data.length === 0) return 15000;
      
      // Estimate TCE from distance and fuel: simplified market proxy
      const avgDistance = data.reduce((s, v) => s + (Number(v.distance_nm) || 500), 0) / data.length;
      const fuelPerDay = data.reduce((s, v) => s + (Number(v.estimated_fuel_consumption) || 30), 0) / data.length;
      // TCE proxy: revenue/distance factor minus fuel cost
      const estimatedTCE = Math.round((avgDistance * 18) - (fuelPerDay * 600));
      return Math.max(5000, estimatedTCE) || 15000;
    },
    enabled: true,
    staleTime: 1000 * 60 * 30,
  });

  const vessel = vessels?.find((v) => v.id === selectedVessel);
  const tce = voyageTCE ?? 15000;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            World-Class Command Center
            <Badge className="ml-2 bg-primary/10 text-primary border-primary/30">
              NAUTI ONE #1
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm">
            Full-stack real-time · Superando Veson · AMOS · DNV · Compas
          </p>
        </div>
        <Select value={selectedVessel} onValueChange={setSelectedVessel}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Selecione um navio..." />
          </SelectTrigger>
          <SelectContent>
            {vessels?.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                <span className="flex items-center gap-2">
                  <Ship className="h-3 w-3" /> {v.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" className="gap-1">
            <BarChart3 className="h-3 w-3" /> Overview
          </TabsTrigger>
          <TabsTrigger value="voyage" className="gap-1">
            <DollarSign className="h-3 w-3" /> Voyage P&L
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-1">
            <Wrench className="h-3 w-3" /> Manutenção
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-1">
            <Shield className="h-3 w-3" /> Compliance
          </TabsTrigger>
          <TabsTrigger value="esg" className="gap-1">
            <Leaf className="h-3 w-3" /> ESG / CII
          </TabsTrigger>
          <TabsTrigger value="crew" className="gap-1">
            <Users className="h-3 w-3" /> Crew
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          {!selectedVessel ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Ship className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Selecione um navio para ver os indicadores World-Class</p>
                <p className="text-sm mt-2">Ou veja a aba <strong>Crew</strong> para compliance de toda a frota</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComplianceScoreRealTime vesselId={selectedVessel} module="ISM" />
                <MaintenanceKPIs vesselId={selectedVessel} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CIIRatingDashboard vesselId={selectedVessel} vesselName={vessel?.name} />
                <TCEBenchmark vesselType={vessel?.vessel_type ?? "General"} ourTce={tce} />
              </div>
            </>
          )}
        </TabsContent>

        {/* VOYAGE P&L */}
        <TabsContent value="voyage" className="space-y-4">
          <TCEBenchmark vesselType={vessel?.vessel_type ?? "General"} ourTce={tce} />
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Voyage P&L detalhado disponível em <a href="/voyage-pnl" className="text-primary underline">/voyage-pnl</a></p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MAINTENANCE */}
        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceKPIs vesselId={selectedVessel || undefined} />
        </TabsContent>

        {/* COMPLIANCE */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComplianceScoreRealTime vesselId={selectedVessel || undefined} module="ISM" />
            <ComplianceScoreRealTime vesselId={selectedVessel || undefined} module="MLC" />
            <ComplianceScoreRealTime vesselId={selectedVessel || undefined} module="ISPS" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComplianceScoreRealTime vesselId={selectedVessel || undefined} module="DP" />
            <ComplianceScoreRealTime vesselId={selectedVessel || undefined} module="PEOTRAM" />
          </div>
        </TabsContent>

        {/* ESG */}
        <TabsContent value="esg" className="space-y-4">
          {selectedVessel ? (
            <CIIRatingDashboard vesselId={selectedVessel} vesselName={vessel?.name} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Selecione um navio para calcular CII Rating
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CREW - Full Fleet STCW Dashboard */}
        <TabsContent value="crew" className="space-y-4">
          <FleetSTCWDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
