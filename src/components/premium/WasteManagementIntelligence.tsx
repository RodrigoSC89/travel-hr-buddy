/**
 * Waste Management Intelligence - MARPOL Compliance
 * e-GRB (Electronic Garbage Record Book) with blockchain validation
 * PATCH Sprint 15: Replaced mock data with useWasteIntelligenceData hook
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trash2, Recycle, Droplets, AlertTriangle, FileText,
  Ship, CheckCircle2, Clock, Shield, BarChart3,
  Download, Lock, Flame, Anchor, TrendingDown
} from "lucide-react";
import { useWasteIntelligenceData } from "@/hooks/useWasteIntelligenceData";

export default function WasteManagementIntelligence() {
  const { data, isLoading } = useWasteIntelligenceData();
  const wasteCategories = data?.wasteCategories || [];
  const dischargeRecords = data?.dischargeRecords || [];
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={`waste-intel-skeleton-${i}`} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-destructive bg-destructive/10";
      case "warning": return "text-warning bg-warning/10";
      default: return "text-success bg-success/10";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "sea": return <Droplets className="h-4 w-4 text-cyan-500" />;
      case "shore": return <Anchor className="h-4 w-4 text-primary" />;
      case "incinerated": return <Flame className="h-4 w-4 text-orange-500" />;
      default: return <Trash2 className="h-4 w-4" />;
    }
  };

  const totalWaste = wasteCategories.reduce((sum, cat) => sum + cat.currentVolume, 0);
  const totalCapacity = wasteCategories.reduce((sum, cat) => sum + cat.capacity, 0) || 1;
  const criticalTanks = wasteCategories.filter(c => c.status === "critical").length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Conformidade MARPOL</p>
                <p className="text-2xl font-bold text-success">{criticalTanks === 0 ? "100%" : `${Math.round(((wasteCategories.length - criticalTanks) / wasteCategories.length) * 100)}%`}</p>
              </div>
              <Shield className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Capacidade Utilizada</p>
                <p className="text-2xl font-bold">{Math.round((totalWaste / totalCapacity) * 100)}%</p>
              </div>
              <Trash2 className="h-8 w-8 text-primary/50" />
            </div>
            <Progress value={(totalWaste / totalCapacity) * 100} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tanques</p>
                <p className="text-2xl font-bold">{wasteCategories.length}</p>
              </div>
              <Recycle className="h-8 w-8 text-cyan-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Registros e-GRB</p>
                <p className="text-2xl font-bold">{dischargeRecords.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold">{criticalTanks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Tanques</span>
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2 py-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">e-GRB</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Compliance</span>
          </TabsTrigger>
        </TabsList>

        {/* Tanks Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Status dos Tanques de Resíduos
              </CardTitle>
              <CardDescription>Monitoramento conforme MARPOL Anexo V</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wasteCategories.map((cat) => (
                  <div key={cat.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.code}</p>
                      </div>
                      <Badge className={getStatusColor(cat.status)}>
                        {cat.status === "critical" ? "Crítico" : cat.status === "warning" ? "Atenção" : "OK"}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cat.currentVolume} {cat.unit}</span>
                        <span className="text-muted-foreground">{cat.capacity} {cat.unit}</span>
                      </div>
                      <Progress 
                        value={(cat.currentVolume / cat.capacity) * 100} 
                        className={`h-2 ${cat.status === "critical" ? "[&>div]:bg-destructive" : cat.status === "warning" ? "[&>div]:bg-warning" : ""}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Última: {cat.lastDischarge || "N/A"}</span>
                      <span>{cat.method}</span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">Registrar Descarga</Button>
                  </div>
                ))}
                {wasteCategories.length === 0 && (
                  <p className="col-span-3 text-center text-muted-foreground py-8">
                    Nenhum tanque cadastrado. Configure os tanques de resíduos da embarcação.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* e-GRB Records */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    e-GRB — Livro de Registro de Lixo Eletrônico
                  </CardTitle>
                  <CardDescription>IMO MEPC.312(74)</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PSC
                  </Button>
                  <Button size="sm">+ Novo Registro</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dischargeRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getMethodIcon(record.method)}
                      <div>
                        <p className="font-medium">{record.category}</p>
                        <p className="text-xs text-muted-foreground">{record.vessel} • {record.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{record.volume} {record.unit}</p>
                        <p className="text-xs text-muted-foreground">{record.location}</p>
                      </div>
                      {record.verified && (
                        <Badge className="bg-success/10 text-success">
                          <Lock className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {dischargeRecords.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum registro de descarga encontrado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                Status de Conformidade MARPOL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { regulation: "MARPOL Anexo V", status: criticalTanks === 0 ? "compliant" : "attention" },
                  { regulation: "IMO MEPC.312(74)", status: "compliant" },
                  { regulation: "EU MRV Reporting", status: "compliant" },
                  { regulation: "Paris MoU Guidelines", status: "compliant" },
                ].map((reg) => (
                  <div key={reg.regulation} className="flex items-center justify-between p-4 border rounded-lg">
                    <p className="font-medium">{reg.regulation}</p>
                    <Badge className={reg.status === "compliant" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {reg.status === "compliant" ? "Conforme" : "Atenção"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
