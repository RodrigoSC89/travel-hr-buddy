/**
 * Advanced Cargo Operations - vs Veson IMOS / Danaos
 * STS operations, cargo heating, tank cleaning, and cargo claims
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Package, Ship, Thermometer, Droplets, AlertTriangle, Clock,
  FileWarning, Shield, ArrowLeftRight, Activity, CheckCircle, Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function AdvancedCargoOperations() {
  const { data: vessels } = useQuery({
    queryKey: ["vessels-cargo-ops"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name, vessel_type").limit(20);
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-purple-400" />
            Advanced Cargo Operations
          </h1>
          <p className="text-muted-foreground">STS transfers, cargo heating, tank cleaning & claims management</p>
        </div>
        <Badge variant="outline" className="border-purple-500/30 text-purple-400">vs Veson IMOS / Danaos</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Package, label: "Active Cargoes", value: "12", color: "text-purple-400" },
          { icon: ArrowLeftRight, label: "STS Planned", value: "3", color: "text-cyan-400" },
          { icon: Thermometer, label: "Cargoes Heating", value: "5", color: "text-orange-400" },
          { icon: FileWarning, label: "Open Claims", value: "2", color: "text-red-400" },
        ].map((kpi, i) => (
          <Card key={i} className="border-border/50 bg-card/80 backdrop-blur">
            <CardContent className="pt-4 text-center">
              <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="sts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sts">STS Operations</TabsTrigger>
          <TabsTrigger value="heating">Cargo Heating</TabsTrigger>
          <TabsTrigger value="tank">Tank Cleaning</TabsTrigger>
          <TabsTrigger value="claims">Cargo Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="sts" className="space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-cyan-400" /> Ship-to-Ship Transfer Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "STS-001", from: "MV Nautilus Star", to: "MV Ocean Pioneer", cargo: "Crude Oil", qty: "45,000 MT", status: "In Progress", progress: 67 },
                { id: "STS-002", from: "MV Deep Horizon", to: "MV Atlantic Grace", cargo: "VLSFO", qty: "12,000 MT", status: "Scheduled", progress: 0 },
                { id: "STS-003", from: "MV Pacific Wave", to: "MV Nautilus Star", cargo: "Naphtha", qty: "28,000 MT", status: "Completed", progress: 100 },
              ].map((sts, i) => (
                <div key={i} className="p-4 rounded-lg bg-background/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{sts.id}</Badge>
                      <span className="text-sm font-medium">{sts.cargo} — {sts.qty}</span>
                    </div>
                    <Badge className={
                      sts.status === "Completed" ? "bg-green-500/20 text-green-400" :
                      sts.status === "In Progress" ? "bg-blue-500/20 text-blue-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }>{sts.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Ship className="h-3 w-3" /> {sts.from} → {sts.to}
                  </div>
                  {sts.progress > 0 && (
                    <div className="space-y-1">
                      <Progress value={sts.progress} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground text-right">{sts.progress}% transferred</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heating" className="space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-400" /> Cargo Heating Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { tank: "1P/1S", cargo: "Fuel Oil", temp: 62, target: 65, rate: 0.5, status: "Heating" },
                { tank: "2P/2S", cargo: "Crude Oil", temp: 48, target: 50, rate: 0.3, status: "Heating" },
                { tank: "3C", cargo: "Bitumen", temp: 155, target: 160, rate: 0.8, status: "Heating" },
                { tank: "4P/4S", cargo: "Palm Oil", temp: 45, target: 45, rate: 0, status: "Maintaining" },
                { tank: "Slop", cargo: "Residues", temp: 38, target: 40, rate: 0.2, status: "Heating" },
              ].map((tank, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-b from-orange-500/20 to-red-500/20 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-orange-400">{tank.temp}°</span>
                    <span className="text-[10px] text-muted-foreground">C</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Tank {tank.tank}</span>
                      <Badge variant="outline" className="text-[10px]">{tank.cargo}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target: {tank.target}°C • Rate: +{tank.rate}°C/hr
                    </p>
                    <Progress value={(tank.temp / tank.target) * 100} className="h-1.5 mt-1" />
                  </div>
                  <Badge className={
                    tank.status === "Maintaining" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                  }>{tank.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tank" className="space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-400" /> Tank Cleaning Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { tank: "1P", prevCargo: "Crude Oil", nextCargo: "Jet Fuel", method: "Butterworth + Chemical Wash", duration: "18h", status: "In Progress" },
                { tank: "1S", prevCargo: "Crude Oil", nextCargo: "Jet Fuel", method: "Butterworth + Chemical Wash", duration: "18h", status: "Pending" },
                { tank: "2P", prevCargo: "VLSFO", nextCargo: "Clean Product", method: "COW + Hot Wash", duration: "24h", status: "Completed" },
                { tank: "3C", prevCargo: "Chemicals", nextCargo: "Vegetable Oil", method: "Wall Wash + Certification", duration: "36h", status: "Scheduled" },
              ].map((tc, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                  <Droplets className={`h-5 w-5 ${
                    tc.status === "Completed" ? "text-green-400" : tc.status === "In Progress" ? "text-blue-400" : "text-muted-foreground"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tank {tc.tank}: {tc.prevCargo} → {tc.nextCargo}</p>
                    <p className="text-xs text-muted-foreground">{tc.method} • Est. {tc.duration}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{tc.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileWarning className="h-4 w-4 text-red-400" /> Cargo Claims & Disputes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { ref: "CLM-2026-001", cargo: "Crude Oil", type: "Shortage", amount: "$125,000", bl_qty: "95,000 MT", outturn: "94,720 MT", status: "Under Investigation" },
                { ref: "CLM-2026-002", cargo: "Chemicals", type: "Contamination", amount: "$85,000", bl_qty: "12,000 MT", outturn: "12,000 MT", status: "P&I Notified" },
              ].map((claim, i) => (
                <div key={i} className="p-4 rounded-lg bg-background/50 space-y-2 border border-red-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs text-red-400">{claim.ref}</Badge>
                      <span className="text-sm font-medium">{claim.type} — {claim.cargo}</span>
                    </div>
                    <span className="text-sm font-bold text-red-400">{claim.amount}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>B/L Qty: {claim.bl_qty}</span>
                    <span>Outturn: {claim.outturn}</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">{claim.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
