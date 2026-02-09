/**
 * Waste Management Premium - v3.0
 * Gestão MARPOL completa com dados reais do Supabase
 */

import React from "react";
import { useSearchParams } from "react-router-dom";
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
import { toast } from "sonner";
import { TanksManagement } from "./components/TanksManagement";
import { GarbageRegistry } from "./components/GarbageRegistry";
import { RecordBooks } from "./components/RecordBooks";
import { WasteReports } from "./components/WasteReports";
import { useWasteIntelligenceData } from "@/hooks/useWasteIntelligenceData";

// Tank visualization component
function TankVisualization({ tank }: { tank: { name: string; currentVolume: number; capacity: number; unit: string; status: string } }) {
  const fillPercent = tank.capacity > 0 ? (tank.currentVolume / tank.capacity) * 100 : 0;
  const fillColor = tank.status === "critical" ? "bg-destructive" : 
                    tank.status === "warning" ? "bg-warning" : "bg-success";
  
  return (
    <div className="relative w-full h-32 border-2 rounded-lg overflow-hidden bg-muted/30">
      <div 
        className={`absolute bottom-0 w-full transition-all duration-1000 ${fillColor}`}
        style={{ height: `${Math.min(fillPercent, 100)}%` }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="font-bold text-lg">{Math.round(fillPercent)}%</span>
        <span className="text-xs text-muted-foreground">{tank.name}</span>
        <span className="text-xs">{tank.currentVolume}/{tank.capacity} {tank.unit}</span>
      </div>
    </div>
  );
}

// Dashboard Content - now with real data
function DashboardContent() {
  const { data, isLoading } = useWasteIntelligenceData();
  const [, setSearchParams] = useSearchParams();
  
  const navigateToTab = (tab: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };
  
  const wasteCategories = data?.wasteCategories || [];
  const dischargeRecords = data?.dischargeRecords || [];
  
  const criticalCount = wasteCategories.filter(c => c.status === "critical").length;
  const warningCount = wasteCategories.filter(c => c.status === "warning").length;
  const totalDischarges = dischargeRecords.length;
  const verifiedDischarges = dischargeRecords.filter(r => r.verified).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">MARPOL</p>
                <p className="text-2xl font-bold text-success">
                  {criticalCount === 0 ? "100%" : `${Math.round(((wasteCategories.length - criticalCount) / Math.max(wasteCategories.length, 1)) * 100)}%`}
                </p>
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
                <p className="text-2xl font-bold">{totalDischarges}</p>
                <p className="text-xs">Registrados</p>
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
                <p className="text-2xl font-bold text-warning">{warningCount}</p>
                <p className="text-xs">&gt;75% cap.</p>
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
                <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
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
                <p className="text-xs text-muted-foreground">Verificados</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {totalDischarges > 0 ? `${Math.round((verifiedDischarges / totalDischarges) * 100)}%` : "—"}
                </p>
                <p className="text-xs">Certificados</p>
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
          <CardDescription>Níveis atuais em tempo real (dados do Supabase)</CardDescription>
        </CardHeader>
        <CardContent>
          {wasteCategories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {wasteCategories.slice(0, 8).map((tank) => (
                <TankVisualization key={tank.id} tank={tank} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Droplets className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum tanque cadastrado na tabela waste_tanks.</p>
              <p className="text-xs mt-1">Cadastre tanques para monitoramento em tempo real.</p>
            </div>
          )}
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
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigateToTab("records")}>
              <FileText className="h-4 w-4" />
              Novo Registro no Oil Record Book (ORB)
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigateToTab("garbage")}>
              <Trash2 className="h-4 w-4" />
              Novo Registro no Garbage Record Book (GRB)
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigateToTab("tanks")}>
              <Recycle className="h-4 w-4" />
              Registrar Descarte em Porto
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigateToTab("records")}>
              <Signature className="h-4 w-4" />
              Assinatura Digital do Comandante
            </Button>
          </CardContent>
        </Card>

        {/* Recent Discharges from real data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Últimos Descartes Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dischargeRecords.length > 0 ? dischargeRecords.slice(0, 5).map((discharge) => (
                <div key={discharge.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{discharge.category}</p>
                    <p className="text-sm text-muted-foreground">{discharge.date} - {discharge.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{discharge.volume} {discharge.unit}</p>
                    <Badge variant="outline" className="text-xs">
                      {discharge.verified ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1 text-success" />Verificado</>
                      ) : (
                        <>Pendente</>
                      )}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Nenhum descarte registrado. Cadastre na tabela waste_records.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MARPOL Annexes - compliance based on real tank data */}
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
              { annex: "Anexo I", title: "Óleo", key: "oil" },
              { annex: "Anexo II", title: "NLS", key: "nls" },
              { annex: "Anexo IV", title: "Esgoto", key: "sewage" },
              { annex: "Anexo V", title: "Lixo", key: "garbage" },
              { annex: "Anexo VI", title: "Ar", key: "air" },
            ].map((item) => {
              const relatedTanks = wasteCategories.filter(t => 
                t.name.toLowerCase().includes(item.key) || t.code.toLowerCase().includes(item.key.charAt(0))
              );
              const hasCritical = relatedTanks.some(t => t.status === "critical");
              const hasWarning = relatedTanks.some(t => t.status === "warning");
              const status = item.key === "nls" ? "na" : hasCritical ? "non_compliant" : hasWarning ? "warning" : "compliant";
              
              return (
                <div key={item.annex} className="p-4 border rounded-lg text-center">
                  <Badge variant={status === "compliant" ? "default" : status === "na" ? "secondary" : "destructive"}>
                    {item.annex}
                  </Badge>
                  <p className="text-sm font-medium mt-2">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {status === "compliant" ? "✓ Conforme" : status === "na" ? "N/A" : status === "warning" ? "⚠ Atenção" : "✗ Verificar"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WasteManagementPremium() {
  const { data } = useWasteIntelligenceData();
  const criticalCount = data?.wasteCategories?.filter(c => c.status === "critical").length || 0;

  const handleRefresh = async () => {
    // Real refresh handled by React Query invalidation
  };

  const handleExport = async () => {
    try {
      const { data: wasteRecords } = await (await import("@/integrations/supabase/client")).supabase
        .from('waste_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      const csvRows = [
        "Data;Tipo;Categoria;Volume;Unidade;Embarcação;Status",
        ...(wasteRecords || []).map((r: any) => 
          `${new Date(r.created_at).toLocaleDateString()};${r.waste_type || ''};${r.category || ''};${r.volume || ''};${r.unit || ''};${r.vessel_id || ''};${r.status || ''}`
        )
      ];
      const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marpol-report-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Relatório MARPOL exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar relatório MARPOL");
    }
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
      badge: criticalCount > 0 ? criticalCount : undefined,
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
      <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
        <Download className="h-4 w-4" />
        ORB/GRB
      </Button>
      <Button size="sm" className="gap-2" onClick={() => {
        const params = new URLSearchParams(window.location.search);
        const currentTab = params.get("tab") || "dashboard";
        if (currentTab === "dashboard") {
          toast.info("Navegue para a aba Tanques, Resíduos ou Record Books para criar um registro.");
        } else {
          toast.info("Use o formulário disponível nesta aba para criar um novo registro.");
        }
      }}>
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
      alerts={criticalCount}
    />
  );
}
