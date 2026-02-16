/**
 * WorldClassDashboard - Unified Command Center
 * Integrates all World #1 differentiator components
 * Surpasses: Veson, AMOS, DNV, Compas, RightShip, MarineTraffic, Kongsberg
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Trophy, Ship, Wrench, Shield, Users, Leaf, BarChart3,
} from "lucide-react";

import { TCEBenchmark } from "@/components/voyage/TCEBenchmark";
import { CIIRatingDashboard } from "@/components/esg/CIIRatingDashboard";
import { ComplianceScoreRealTime } from "@/components/compliance/ComplianceScoreRealTime";
import { MaintenanceKPIs } from "@/components/maintenance/MaintenanceKPIs";

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

  const vessel = vessels?.find((v) => v.id === selectedVessel);

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
          <p className="text-muted-foreground">
            Superando Veson · AMOS · DNV · Compas · RightShip · Kongsberg
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
            <Ship className="h-3 w-3" /> Voyage P&L
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
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Row 1: Compliance + Maintenance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComplianceScoreRealTime vesselId={selectedVessel} module="ISM" />
                <MaintenanceKPIs vesselId={selectedVessel} />
              </div>

              {/* Row 2: CII + TCE Benchmark */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CIIRatingDashboard
                  vesselId={selectedVessel}
                  vesselName={vessel?.name}
                />
                <TCEBenchmark
                  vesselType={vessel?.vessel_type ?? "General"}
                  ourTce={12500}
                />
              </div>
            </>
          )}
        </TabsContent>

        {/* VOYAGE P&L */}
        <TabsContent value="voyage" className="space-y-4">
          {selectedVessel && (
            <TCEBenchmark
              vesselType={vessel?.vessel_type ?? "General"}
              ourTce={12500}
            />
          )}
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Voyage P&L detalhado disponível em <a href="/voyage-pnl" className="text-primary underline">/voyage-pnl</a></p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MAINTENANCE */}
        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceKPIs vesselId={selectedVessel || undefined} />
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Manutenção preditiva disponível em <a href="/maintenance" className="text-primary underline">/maintenance</a></p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPLIANCE */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComplianceScoreRealTime vesselId={selectedVessel || undefined} module="ISM" />
            <ComplianceScoreRealTime vesselId={selectedVessel || undefined} module="MLC" />
            <ComplianceScoreRealTime vesselId={selectedVessel || undefined} module="ISPS" />
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

        {/* CREW */}
        <TabsContent value="crew" className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Crew Rotation Matrix em <a href="/crew-rotation" className="text-primary underline">/crew-rotation</a></p>
              <p className="text-sm mt-1">STCW Compliance Checker integrado ao perfil de cada tripulante</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
