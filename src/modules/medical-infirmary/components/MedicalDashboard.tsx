/**
 * Medical Dashboard - Connected to real Supabase data
 * Gestão de saúde da tripulação com dados reais
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMedicalDashboardData } from "@/hooks/useMedicalDashboardData";
import {
  Heart, Activity, Pill, Stethoscope, Calendar, Clock, AlertTriangle,
  CheckCircle2, User, FileText, Phone, Video, ThermometerSun, Syringe,
  Ambulance, ClipboardList, TrendingUp, Shield, Plus, Search, Download,
  Bell, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "fit": "bg-success", "restricted": "bg-warning",
    "unfit": "bg-destructive", "pending": "bg-info"
  };
  return colors[status] || "bg-muted";
};

export default function MedicalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { crew, records, medications, isLoading, error, refetch, stats } = useMedicalDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Erro ao carregar dados médicos</p>
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulantes Aptos</p>
                <p className="text-3xl font-bold text-success">{stats.fitCount}/{stats.totalCrew}</p>
                <p className="text-xs text-success mt-1">
                  {stats.totalCrew > 0 ? ((stats.fitCount / stats.totalCrew) * 100).toFixed(0) : 0}% da tripulação
                </p>
              </div>
              <div className="p-3 bg-success/20 rounded-xl"><Heart className="h-6 w-6 text-success" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(stats.restrictedCount > 0 && "border-warning/50")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Restrição Médica</p>
                <p className={cn("text-3xl font-bold", stats.restrictedCount > 0 ? "text-warning" : "text-muted-foreground")}>{stats.restrictedCount}</p>
                <p className="text-xs text-warning mt-1">Requer acompanhamento</p>
              </div>
              <div className="p-3 bg-warning/20 rounded-xl"><Activity className="h-6 w-6 text-warning" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(stats.expiringCerts > 0 && "border-warning/50")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cert. Vencendo</p>
                <p className={cn("text-3xl font-bold", stats.expiringCerts > 0 ? "text-warning" : "text-muted-foreground")}>{stats.expiringCerts}</p>
                <p className="text-xs text-muted-foreground mt-1">Próximos 90 dias</p>
              </div>
              <div className="p-3 bg-warning/20 rounded-xl"><FileText className="h-6 w-6 text-warning" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(stats.lowStockMeds > 0 && "border-destructive/50")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className={cn("text-3xl font-bold", stats.lowStockMeds > 0 ? "text-destructive" : "text-muted-foreground")}>{stats.lowStockMeds}</p>
                <p className="text-xs text-muted-foreground mt-1">Medicamentos</p>
              </div>
              <div className={cn("p-3 rounded-xl", stats.lowStockMeds > 0 ? "bg-destructive/20" : "bg-muted")}>
                <Pill className={cn("h-6 w-6", stats.lowStockMeds > 0 ? "text-destructive" : "text-muted-foreground")} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert banner */}
      {(stats.restrictedCount > 0 || stats.expiringCerts > 0) && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-warning" />
              <div className="flex-1">
                <p className="font-medium text-warning">Atenção Requerida</p>
                <p className="text-sm text-muted-foreground">
                  {stats.restrictedCount} tripulante(s) com restrição médica e {stats.expiringCerts} certificação(ões) próximas do vencimento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {crew.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum tripulante cadastrado</h3>
            <p className="text-muted-foreground">Cadastre tripulantes para gerenciar o status médico.</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2"><Activity className="h-4 w-4" />Visão Geral</TabsTrigger>
            <TabsTrigger value="crew" className="gap-2"><User className="h-4 w-4" />Tripulação</TabsTrigger>
            <TabsTrigger value="records" className="gap-2"><ClipboardList className="h-4 w-4" />Prontuários</TabsTrigger>
            <TabsTrigger value="medications" className="gap-2"><Pill className="h-4 w-4" />Medicamentos</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-2" />Atualizar</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />Nova Consulta</Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Status Médico da Tripulação</CardTitle>
                <CardDescription>Resumo por embarcação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...new Set(crew.map(c => c.vessel))].filter(v => v !== "N/A").map((vessel) => {
                    const vesselCrew = crew.filter(c => c.vessel === vessel);
                    const fitPercent = vesselCrew.length ? (vesselCrew.filter(c => c.medicalStatus === "fit").length / vesselCrew.length) * 100 : 0;
                    return (
                      <div key={vessel} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">{vessel}</span>
                          <Badge variant={fitPercent === 100 ? "default" : "secondary"}>{fitPercent.toFixed(0)}% Aptos</Badge>
                        </div>
                        <Progress value={fitPercent} className="h-2" />
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success" />Aptos: {vesselCrew.filter(c => c.medicalStatus === "fit").length}</span>
                          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning" />Restrição: {vesselCrew.filter(c => c.medicalStatus === "restricted").length}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Vencimentos</CardTitle>
                <CardDescription>Certificações médicas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {crew.flatMap(c => c.certifications.filter(cert => cert.status !== "valid").map(cert => ({ crew: c, cert }))).map(({ crew: c, cert }) => (
                    <div key={`${c.name}-${cert.name}`} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-muted-foreground">{cert.name}</p></div>
                      <div className="text-right">
                        <Badge variant={cert.status === "expired" ? "destructive" : "secondary"}>{cert.status === "expired" ? "Vencido" : "Vencendo"}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{cert.expiry}</p>
                      </div>
                    </div>
                  ))}
                  {crew.flatMap(c => c.certifications.filter(cert => cert.status !== "valid")).length === 0 && (
                    <div className="text-center py-4"><CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" /><p className="text-sm text-muted-foreground">Todas certificações em dia</p></div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crew" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Tripulação</CardTitle><CardDescription>Status médico individual</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crew.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar><AvatarFallback>{c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                      <div>
                        <div className="flex items-center gap-2"><span className="font-medium">{c.name}</span><Badge variant="outline">{c.rank}</Badge></div>
                        <p className="text-sm text-muted-foreground">{c.vessel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-sm"><span className="text-muted-foreground">Último Exame:</span><p className="font-medium">{c.lastCheckup}</p></div>
                      <div className="text-sm"><span className="text-muted-foreground">Próximo:</span><p className="font-medium">{c.nextCheckup}</p></div>
                      <Badge className={getStatusColor(c.medicalStatus)}>
                        {c.medicalStatus === "fit" ? "Apto" : c.medicalStatus === "restricted" ? "Restrição" : c.medicalStatus === "unfit" ? "Inapto" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Prontuários Médicos</CardTitle><CardDescription>Histórico de atendimentos</CardDescription></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {records.map((record) => (
                    <div key={record.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{record.type === "consultation" ? "Consulta" : record.type === "emergency" ? "Emergência" : record.type === "telemedicine" ? "Telemedicina" : "Rotina"}</Badge>
                          <span className="font-medium">{record.crewName}</span>
                        </div>
                        <Badge variant={record.status === "open" ? "default" : record.status === "follow-up" ? "secondary" : "outline"}>
                          {record.status === "open" ? "Aberto" : record.status === "follow-up" ? "Acompanhamento" : "Fechado"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Diagnóstico:</span><p>{record.diagnosis}</p></div>
                        <div><span className="text-muted-foreground">Tratamento:</span><p>{record.treatment}</p></div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{record.doctor}</span><span>{record.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Farmácia de Bordo</CardTitle><CardDescription>Estoque de medicamentos (MLC 2006)</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg", med.controlled ? "bg-destructive/20" : "bg-info/20")}>
                        <Pill className={cn("h-4 w-4", med.controlled ? "text-destructive" : "text-info")} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{med.name}</span>
                          {med.controlled && <Badge variant="destructive" className="text-xs">Controlado</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{med.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <span className="text-muted-foreground">Estoque</span>
                        <p className={cn("font-bold", med.quantity <= med.minStock ? "text-destructive" : "text-success")}>{med.quantity}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">Mín.</span>
                        <p className="font-medium">{med.minStock}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">Validade</span>
                        <p className="font-medium">{med.expiry}</p>
                      </div>
                      {med.quantity <= med.minStock && <Badge variant="destructive">Reabastecer</Badge>}
                    </div>
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
