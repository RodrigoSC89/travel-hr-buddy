/**
 * ESG & Emissões - Página dedicada
 * Gestão de emissões, pegada de carbono e conformidade ambiental
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Leaf, Cloud, Factory, Ship, TrendingDown, BarChart3,
  AlertTriangle, Target, FileText, Download, Zap
} from "lucide-react";

// Mock data
const emissionsData = {
  totalCO2: 12450,
  targetCO2: 15000,
  reduction: 17,
  fleetAverage: 2.3,
  ciiRating: "B",
};

const vesselEmissions = [
  { name: "MV Atlântico Sul", co2: 3200, sox: 45, nox: 120, cii: "A" },
  { name: "MV Pacífico Norte", co2: 2800, sox: 38, nox: 98, cii: "B" },
  { name: "MV Caribe Star", co2: 3100, sox: 42, nox: 115, cii: "B" },
  { name: "MV Mediterranean", co2: 3350, sox: 48, nox: 130, cii: "C" },
];

const complianceItems = [
  { regulation: "IMO 2020", status: "compliant", deadline: "2025-01-01" },
  { regulation: "MARPOL Annex VI", status: "compliant", deadline: "2025-06-30" },
  { regulation: "EU MRV", status: "pending", deadline: "2025-03-31" },
  { regulation: "CII Rating Target", status: "on_track", deadline: "2025-12-31" },
];

export default function ESGEmissionsPage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getCIIColor = (rating: string) => {
    switch (rating) {
      case "A": return "bg-success";
      case "B": return "bg-success/70";
      case "C": return "bg-warning";
      case "D": return "bg-warning/70";
      case "E": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-success/20 rounded-xl">
            <Leaf className="h-8 w-8 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              ESG & Emissões
              <Badge variant="secondary" className="bg-success/20 text-success">
                IMO 2020
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Monitoramento de emissões e conformidade ambiental da frota
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Total (ton)</p>
                <p className="text-3xl font-bold">{emissionsData.totalCO2.toLocaleString()}</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -{emissionsData.reduction}% vs meta
                </p>
              </div>
              <Cloud className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meta Anual</p>
                <p className="text-3xl font-bold">{emissionsData.targetCO2.toLocaleString()}</p>
                <Progress 
                  value={(emissionsData.totalCO2 / emissionsData.targetCO2) * 100} 
                  className="mt-2 h-2"
                />
              </div>
              <Target className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média da Frota</p>
                <p className="text-3xl font-bold">{emissionsData.fleetAverage}</p>
                <p className="text-xs text-muted-foreground">gCO₂/ton-nm</p>
              </div>
              <Ship className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CII Frota</p>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg ${getCIIColor(emissionsData.ciiRating)} flex items-center justify-center text-primary-foreground font-bold text-xl`}>
                    {emissionsData.ciiRating}
                  </div>
                </div>
              </div>
              <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="vessels">Por Embarcação</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Emissões por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>CO₂ (Dióxido de Carbono)</span>
                    <span className="font-bold">12,450 ton</span>
                  </div>
                  <Progress value={83} />
                  
                  <div className="flex justify-between items-center">
                    <span>SOx (Óxidos de Enxofre)</span>
                    <span className="font-bold">173 ton</span>
                  </div>
                  <Progress value={65} className="bg-warning/20 [&>div]:bg-warning" />
                  
                  <div className="flex justify-between items-center">
                    <span>NOx (Óxidos de Nitrogênio)</span>
                    <span className="font-bold">463 ton</span>
                  </div>
                  <Progress value={72} className="bg-warning/20 [&>div]:bg-warning/80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Eficiência Energética
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">EEXI Compliance</span>
                      <Badge className="bg-success">Conforme</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Todas as embarcações atendem aos requisitos EEXI
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">SEEMP Implementado</span>
                      <Badge className="bg-success">100%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ship Energy Efficiency Management Plan ativo em toda frota
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vessels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emissões por Embarcação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vesselEmissions.map((vessel) => (
                  <div key={vessel.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Ship className="h-5 w-5 text-primary" />
                        <span className="font-medium">{vessel.name}</span>
                      </div>
                      <div className={`w-8 h-8 rounded ${getCIIColor(vessel.cii)} flex items-center justify-center text-primary-foreground font-bold`}>
                        {vessel.cii}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">CO₂:</span>
                        <span className="ml-2 font-medium">{vessel.co2} ton</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">SOx:</span>
                        <span className="ml-2 font-medium">{vessel.sox} ton</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">NOx:</span>
                        <span className="ml-2 font-medium">{vessel.nox} ton</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Status de Compliance Ambiental
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.map((item) => (
                  <div key={item.regulation} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.status === "compliant" ? (
                        <div className="w-3 h-3 bg-success rounded-full" />
                      ) : item.status === "pending" ? (
                        <div className="w-3 h-3 bg-warning rounded-full" />
                      ) : (
                        <div className="w-3 h-3 bg-primary rounded-full" />
                      )}
                      <span className="font-medium">{item.regulation}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Prazo: {new Date(item.deadline).toLocaleDateString("pt-BR")}
                      </span>
                      <Badge variant={item.status === "compliant" ? "default" : "secondary"}>
                        {item.status === "compliant" ? "Conforme" : 
                         item.status === "pending" ? "Pendente" : "Em Andamento"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 justify-start gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Relatório EU MRV</p>
                    <p className="text-xs text-muted-foreground">Monitoramento, Reporte e Verificação</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Relatório IMO DCS</p>
                    <p className="text-xs text-muted-foreground">Data Collection System</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Relatório CII</p>
                    <p className="text-xs text-muted-foreground">Carbon Intensity Indicator</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Relatório SEEMP</p>
                    <p className="text-xs text-muted-foreground">Ship Energy Efficiency Management Plan</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
