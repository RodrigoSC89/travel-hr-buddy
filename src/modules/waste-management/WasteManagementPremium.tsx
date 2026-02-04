/**
 * Waste Management Premium - v2.0
 * Gestão MARPOL completa com Record Books digitais
 */

import React, { useState } from "react";
import { 
  Recycle, LayoutDashboard, Droplets, Trash2, FileText, 
  AlertTriangle, Ship, Calendar, CheckCircle2, TrendingDown,
  Plus, Download, Signature
} from "lucide-react";
import { PremiumModuleShell } from "@/components/ui/premium-module-kit";
import type { ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { TanksManagement } from "./components/TanksManagement";
import { GarbageRegistry } from "./components/GarbageRegistry";
import { RecordBooks } from "./components/RecordBooks";
import { WasteReports } from "./components/WasteReports";

// Tank visualization component
function TankVisualization({ tank }: { tank: any }) {
  const fillPercent = (tank.currentLevel / tank.capacity) * 100;
  const fillColor = tank.status === "critical" ? "bg-destructive" : 
                    tank.status === "warning" ? "bg-warning" : "bg-success";
  
  return (
    <div className="relative w-full h-32 border-2 rounded-lg overflow-hidden bg-muted/30">
      <div 
        className={`absolute bottom-0 w-full transition-all duration-1000 ${fillColor}`}
        style={{ height: `${fillPercent}%` }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="font-bold text-lg">{Math.round(fillPercent)}%</span>
        <span className="text-xs text-muted-foreground">{tank.name}</span>
        <span className="text-xs">{tank.currentLevel}/{tank.capacity} {tank.unit}</span>
      </div>
    </div>
  );
}

// Dashboard Content
function DashboardContent() {
  const tanks = [
    { id: "1", name: "Óleo Usado", type: "oily", capacity: 5000, currentLevel: 3200, unit: "L", status: "warning" },
    { id: "2", name: "Esgoto", type: "sewage", capacity: 8000, currentLevel: 2100, unit: "L", status: "ok" },
    { id: "3", name: "Água de Porão", type: "bilge", capacity: 3000, currentLevel: 2800, unit: "L", status: "critical" },
    { id: "4", name: "Resíduos Sólidos", type: "garbage", capacity: 500, currentLevel: 180, unit: "kg", status: "ok" },
  ];

  const recentDischarges = [
    { id: "1", date: "2024-01-14", type: "Resíduos Sólidos", quantity: "120 kg", location: "Porto de Macaé", cert: "CERT-2024-001" },
    { id: "2", date: "2024-01-12", type: "Esgoto Sanitário", quantity: "4.500 L", location: "Porto de Macaé", cert: "CERT-2024-002" },
    { id: "3", date: "2024-01-10", type: "Óleo Usado", quantity: "2.000 L", location: "Porto de Macaé", cert: "CERT-2024-003" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">MARPOL</p>
                <p className="text-2xl font-bold text-success">100%</p>
                <p className="text-xs">Conformidade</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Descartes</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs">Este mês</p>
              </div>
              <Recycle className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Atenção</p>
                <p className="text-2xl font-bold text-warning">1</p>
                <p className="text-xs">&gt;60% cap.</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Crítico</p>
                <p className="text-2xl font-bold text-destructive">1</p>
                <p className="text-xs">Urgente</p>
              </div>
              <Droplets className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Redução CO₂</p>
                <p className="text-2xl font-bold text-emerald-600">12%</p>
                <p className="text-xs">vs. anterior</p>
              </div>
              <TrendingDown className="h-8 w-8 text-emerald-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tank Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Visualização dos Tanques
          </CardTitle>
          <CardDescription>Níveis atuais em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tanks.map((tank) => (
              <TankVisualization key={tank.id} tank={tank} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions and Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Abrindo registro ORB")}>
              <FileText className="h-4 w-4" />
              Novo Registro no Oil Record Book (ORB)
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Abrindo registro GRB")}>
              <Trash2 className="h-4 w-4" />
              Novo Registro no Garbage Record Book (GRB)
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Iniciando descarte")}>
              <Recycle className="h-4 w-4" />
              Registrar Descarte em Porto
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Abrindo assinatura")}>
              <Signature className="h-4 w-4" />
              Assinatura Digital do Comandante
            </Button>
          </CardContent>
        </Card>

        {/* Recent Discharges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Últimos Descartes Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDischarges.map((discharge) => (
                <div key={discharge.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{discharge.type}</p>
                    <p className="text-sm text-muted-foreground">{discharge.date} - {discharge.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{discharge.quantity}</p>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-success" />
                      {discharge.cert}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MARPOL Annexes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Conformidade MARPOL por Anexo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { annex: "Anexo I", title: "Óleo", status: "compliant" },
              { annex: "Anexo II", title: "NLS", status: "na" },
              { annex: "Anexo IV", title: "Esgoto", status: "compliant" },
              { annex: "Anexo V", title: "Lixo", status: "compliant" },
              { annex: "Anexo VI", title: "Ar", status: "compliant" },
            ].map((item) => (
              <div key={item.annex} className="p-4 border rounded-lg text-center">
                <Badge variant={item.status === "compliant" ? "default" : item.status === "na" ? "secondary" : "destructive"}>
                  {item.annex}
                </Badge>
                <p className="text-sm font-medium mt-2">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.status === "compliant" ? "✓ Conforme" : item.status === "na" ? "N/A" : "⚠ Verificar"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WasteManagementPremium() {
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleExport = () => {
    toast.success("Relatório MARPOL exportado");
  };

  const tabs: ModuleTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      content: <DashboardContent />
    },
    {
      id: "tanks",
      label: "Tanques",
      icon: Droplets,
      badge: 1,
      content: <TanksManagement />
    },
    {
      id: "garbage",
      label: "Resíduos",
      icon: Trash2,
      content: <GarbageRegistry />
    },
    {
      id: "records",
      label: "Record Books",
      icon: FileText,
      content: <RecordBooks />
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: FileText,
      content: <WasteReports />
    }
  ];

  const actions = (
    <>
      <Button variant="outline" size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        ORB/GRB
      </Button>
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Novo Registro
      </Button>
    </>
  );

  return (
    <PremiumModuleShell
      title="Gestão de Resíduos"
      subtitle="Conformidade MARPOL, Oil Record Book e Garbage Record Book"
      icon={Recycle}
      iconGradient="from-emerald-500 to-teal-600"
      tabs={tabs}
      defaultTab="dashboard"
      actions={actions}
      onRefresh={handleRefresh}
      onExport={handleExport}
      showAIBadge={true}
      aiStatus="active"
      alerts={1}
    />
  );
}
