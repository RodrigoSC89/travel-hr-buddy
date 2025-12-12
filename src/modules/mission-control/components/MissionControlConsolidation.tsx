
/**
 * PATCH 505: Mission Control Consolidation Dashboard
 * Unified dashboard integrating all mission control sub-modules
 * PATCH 653 - Lazy loading for jsPDF
 */

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  FileText, 
  Brain, 
  BarChart3, 
  Download,
  Plus
} from "lucide-react";
// PATCH 549: Lazy import Mission Control components to reduce bundle size
const MissionPlanner = lazy(() => import("../components/MissionPlanner").then(m => ({ default: m.MissionPlanner })));
const MissionLogs = lazy(() => import("../components/MissionLogs").then(m => ({ default: m.MissionLogs })));
const AICommander = lazy(() => import("../components/AICommander").then(m => ({ default: m.AICommander })));
const KPIDashboard = lazy(() => import("../components/KPIDashboard").then(m => ({ default: m.KPIDashboard })));
import { toast } from "sonner";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  return jsPDF;
};

interface MissionStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
}

export const MissionControlConsolidation: React.FC = () => {
  const [stats, setStats] = useState<MissionStats>({
    total: 0,
    active: 0,
    completed: 0,
    failed: 0
  });
  const [activeTab, setActiveTab] = useState("workflows");

  useEffect(() => {
    loadMissionStats();
  }, []);

  const loadMissionStats = async () => {
    // In real implementation, fetch from Supabase
    setStats({
      total: 42,
      active: 5,
      completed: 35,
      failed: 2
    });
  };

  const exportMissionReport = async () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text("Mission Control Report", 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
      
      // Statistics
      doc.setFontSize(14);
      doc.text("Mission Statistics", 20, 45);
      doc.setFontSize(10);
      doc.text(`Total Missions: ${stats.total}`, 20, 55);
      doc.text(`Active: ${stats.active}`, 20, 62);
      doc.text(`Completed: ${stats.completed}`, 20, 69);
      doc.text(`Failed: ${stats.failed}`, 20, 76);
      
      // Success Rate
      const successRate = ((stats.completed / stats.total) * 100).toFixed(1);
      doc.text(`Success Rate: ${successRate}%`, 20, 83);
      
      // Save PDF
      doc.save(`mission-report-${Date.now()}.pdf`);
      toast.success("Relatório exportado com sucesso");
    } catch (error) {
      console.error("Failed to export report:", error);
      toast.error("Falha ao exportar relatório");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            Mission Control Center
          </h1>
          <p className="text-muted-foreground">
            Centro de comando unificado para todas as operações
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportMissionReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Missão
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Missões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Todas as operações</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finalizadas com sucesso</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {((stats.completed / stats.total) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Eficiência operacional</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos de Controle</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="workflows">
                <Target className="h-4 w-4 mr-2" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="logs">
                <FileText className="h-4 w-4 mr-2" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="ai-autonomy">
                <Brain className="h-4 w-4 mr-2" />
                Autonomia AI
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Análise Tática
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="mt-6">
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
                <MissionPlanner />
              </Suspense>
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
                <MissionLogs />
              </Suspense>
            </TabsContent>

            <TabsContent value="ai-autonomy" className="mt-6">
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
                <AICommander />
              </Suspense>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
                <KPIDashboard />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Mission Types */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Missão Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Missão de Reconhecimento</h3>
              <p className="text-sm text-muted-foreground">
                Operações de monitoramento e coleta de dados em áreas designadas
              </p>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Missão de Transporte</h3>
              <p className="text-sm text-muted-foreground">
                Operações logísticas e transporte de recursos entre pontos
              </p>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Missão de Segurança</h3>
              <p className="text-sm text-muted-foreground">
                Operações de patrulha e segurança em zonas críticas
              </p>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
