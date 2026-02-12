/**
 * MLC Work Hours - Página dedicada
 * Controle de horas de trabalho e descanso conforme MLC 2006
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Clock, Users, AlertTriangle, CheckCircle2, FileText,
  Download, Calendar, Moon, Sun, TrendingUp
} from "lucide-react";

// Mock MLC data
const mlcStats = {
  totalCrew: 156,
  compliant: 148,
  violations: 3,
  warnings: 5,
  complianceRate: 95,
};

const crewHours = [
  { 
    name: "João Silva", 
    rank: "Chief Officer",
    vessel: "MV Atlântico Sul",
    workHours: 68,
    restHours: 100,
    maxWork: 72,
    minRest: 77,
    status: "compliant"
  },
  { 
    name: "Maria Santos", 
    rank: "2nd Engineer",
    vessel: "MV Atlântico Sul",
    workHours: 71,
    restHours: 97,
    maxWork: 72,
    minRest: 77,
    status: "warning"
  },
  { 
    name: "Carlos Oliveira", 
    rank: "AB Seaman",
    vessel: "MV Pacífico Norte",
    workHours: 74,
    restHours: 94,
    maxWork: 72,
    minRest: 77,
    status: "violation"
  },
  { 
    name: "Ana Costa", 
    rank: "Chief Cook",
    vessel: "MV Pacífico Norte",
    workHours: 65,
    restHours: 103,
    maxWork: 72,
    minRest: 77,
    status: "compliant"
  },
];

const recentViolations = [
  { 
    crew: "Carlos Oliveira",
    vessel: "MV Pacífico Norte",
    type: "Exceeded weekly hours",
    date: "2025-01-28",
    hours: 74,
    limit: 72,
    status: "open"
  },
  { 
    crew: "Pedro Lima",
    vessel: "MV Caribe Star",
    type: "Insufficient rest period",
    date: "2025-01-25",
    hours: 5,
    limit: 6,
    status: "resolved"
  },
];

export default function MLCWorkHoursPage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "violation": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "compliant": return "Conforme";
      case "warning": return "Atenção";
      case "violation": return "Violação";
      default: return status;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              MLC Work Hours
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                MLC 2006
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Controle de horas de trabalho e descanso conforme Maritime Labour Convention
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Relatório MLC
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulantes</p>
                <p className="text-3xl font-bold">{mlcStats.totalCrew}</p>
              </div>
              <Users className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformes</p>
                <p className="text-3xl font-bold text-green-500">{mlcStats.compliant}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atenção</p>
                <p className="text-3xl font-bold text-yellow-500">{mlcStats.warnings}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Violações</p>
                <p className="text-3xl font-bold text-red-500">{mlcStats.violations}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-3xl font-bold text-primary">{mlcStats.complianceRate}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MLC Limits Info */}
      <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-transparent">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-background rounded-lg">
              <Sun className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="font-bold">14h</p>
              <p className="text-xs text-muted-foreground">Máx. por dia</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="font-bold">72h</p>
              <p className="text-xs text-muted-foreground">Máx. por semana</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <Moon className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
              <p className="font-bold">10h</p>
              <p className="text-xs text-muted-foreground">Mín. descanso/dia</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="font-bold">77h</p>
              <p className="text-xs text-muted-foreground">Mín. descanso/semana</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="crew">Por Tripulante</TabsTrigger>
          <TabsTrigger value="violations">Violações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Status da Tripulação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crewHours.slice(0, 4).map((crew) => (
                    <div key={crew.name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{crew.name}</p>
                          <p className="text-sm text-muted-foreground">{crew.rank} - {crew.vessel}</p>
                        </div>
                        <Badge className={getStatusColor(crew.status)}>
                          {getStatusText(crew.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Trabalho: {crew.workHours}h / {crew.maxWork}h</p>
                          <Progress 
                            value={(crew.workHours / crew.maxWork) * 100} 
                            className={crew.workHours > crew.maxWork ? "[&>div]:bg-red-500" : ""}
                          />
                        </div>
                        <div>
                          <p className="text-muted-foreground">Descanso: {crew.restHours}h / {crew.minRest}h</p>
                          <Progress 
                            value={(crew.restHours / 168) * 100}
                            className={crew.restHours < crew.minRest ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Violações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentViolations.map((violation) => (
                    <div key={`${violation.crew}-${violation.type}`} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{violation.crew}</p>
                        <Badge variant={violation.status === "open" ? "destructive" : "secondary"}>
                          {violation.status === "open" ? "Aberta" : "Resolvida"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{violation.vessel}</p>
                      <p className="text-sm">{violation.type}</p>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Registrado: {violation.hours}h (Limite: {violation.limit}h)</span>
                        <span>{new Date(violation.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crew" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Horas por Tripulante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tripulante</th>
                      <th className="text-left py-3 px-4">Função</th>
                      <th className="text-left py-3 px-4">Embarcação</th>
                      <th className="text-center py-3 px-4">Trabalho (h)</th>
                      <th className="text-center py-3 px-4">Descanso (h)</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crewHours.map((crew) => (
                      <tr key={crew.name} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{crew.name}</td>
                        <td className="py-3 px-4">{crew.rank}</td>
                        <td className="py-3 px-4">{crew.vessel}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={crew.workHours > crew.maxWork ? "text-destructive font-bold" : ""}>
                            {crew.workHours}
                          </span>
                          /{crew.maxWork}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={crew.restHours < crew.minRest ? "text-red-500 font-bold" : ""}>
                            {crew.restHours}
                          </span>
                          /{crew.minRest}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getStatusColor(crew.status)}>
                            {getStatusText(crew.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Violações MLC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentViolations.map((violation) => (
                  <div key={`hist-${violation.crew}-${violation.type}`} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{violation.crew}</p>
                        <p className="text-sm text-muted-foreground">{violation.vessel}</p>
                      </div>
                      <Badge variant={violation.status === "open" ? "destructive" : "secondary"}>
                        {violation.status === "open" ? "Aberta" : "Resolvida"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tipo</p>
                        <p>{violation.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor / Limite</p>
                        <p>{violation.hours}h / {violation.limit}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data</p>
                        <p>{new Date(violation.date).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    {violation.status === "open" && (
                      <Button size="sm" className="mt-3">Resolver</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios MLC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 justify-start gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Work & Rest Record</p>
                    <p className="text-xs text-muted-foreground">Registro individual de horas</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Fleet Compliance Report</p>
                    <p className="text-xs text-muted-foreground">Visão geral da frota</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Violation Summary</p>
                    <p className="text-xs text-muted-foreground">Resumo de não-conformidades</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">PSC Inspection Pack</p>
                    <p className="text-xs text-muted-foreground">Pacote para inspeção PSC</p>
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
