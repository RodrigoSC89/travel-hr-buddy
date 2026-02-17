import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Shield, Activity, Download, ClipboardCheck, TrendingUp, BookOpen, Upload } from "lucide-react";
import { CreatePlanDialog } from "./components/CreatePlanDialog";
import { PlansList } from "./components/PlansList";
import { ActionsList } from "./components/ActionsList";
import { VersionHistory } from "./components/VersionHistory";
import { SGSOAuditTrail } from "./components/SGSOAuditTrail";
import { SGSOMaturityCurve } from "./components/SGSOMaturityCurve";
import { SGSOKnowledgeBase } from "./components/SGSOKnowledgeBase";
import { SGSOEvidenceManager } from "./components/SGSOEvidenceManager";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export default function SGSOSystem() {
  const [activeTab, setActiveTab] = useState("plans");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SGSO plan has dynamic shape from Supabase
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalActions: 0,
    pendingActions: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: plans } = await supabase.from("sgso_plans").select("id, status");
      const { data: actions } = await supabase.from("sgso_actions").select("id, status");

      setStats({
        totalPlans: plans?.length || 0,
        activePlans: plans?.filter(p => p.status === "active").length || 0,
        totalActions: actions?.length || 0,
        pendingActions: actions?.filter(a => a.status === "pending").length || 0,
      });
    } catch (error) {
      logger.error("Error loading stats:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SGSO - Sistema de Gestão de Segurança Operacional</h1>
          <p className="text-muted-foreground mt-1">Conforme Resolução ANP nº 46/2016</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
            <Shield className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ações Pendentes</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingActions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="plans"><FileText className="h-4 w-4 mr-1" />Planos</TabsTrigger>
          <TabsTrigger value="actions"><Activity className="h-4 w-4 mr-1" />Ações</TabsTrigger>
          <TabsTrigger value="audit"><ClipboardCheck className="h-4 w-4 mr-1" />Auditoria</TabsTrigger>
          <TabsTrigger value="maturity"><TrendingUp className="h-4 w-4 mr-1" />Maturidade</TabsTrigger>
          <TabsTrigger value="evidence"><Upload className="h-4 w-4 mr-1" />Evidências</TabsTrigger>
          <TabsTrigger value="knowledge"><BookOpen className="h-4 w-4 mr-1" />Base Legal</TabsTrigger>
          <TabsTrigger value="history"><FileText className="h-4 w-4 mr-1" />Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <PlansList onSelectPlan={setSelectedPlan} onRefresh={loadStats} />
        </TabsContent>
        <TabsContent value="actions" className="space-y-4">
          <ActionsList selectedPlanId={selectedPlan?.id} onRefresh={loadStats} />
        </TabsContent>
        <TabsContent value="audit" className="space-y-4">
          <SGSOAuditTrail />
        </TabsContent>
        <TabsContent value="maturity" className="space-y-4">
          <SGSOMaturityCurve />
        </TabsContent>
        <TabsContent value="evidence" className="space-y-4">
          <SGSOEvidenceManager />
        </TabsContent>
        <TabsContent value="knowledge" className="space-y-4">
          <SGSOKnowledgeBase />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <VersionHistory selectedPlanId={selectedPlan?.id} />
        </TabsContent>
      </Tabs>

      <CreatePlanDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={loadStats} />
    </div>
  );
}