import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Shield, Activity, Download } from "lucide-react";
import { CreatePlanDialog } from "./components/CreatePlanDialog";
import { PlansList } from "./components/PlansList";
import { ActionsList } from "./components/ActionsList";
import { VersionHistory } from "./components/VersionHistory";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SGSOSystem() {
  const [activeTab, setActiveTab] = useState("plans");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
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
      const { data: plans } = await supabase
        .from("sgso_plans")
        .select("id, status");

      const { data: actions } = await supabase
        .from("sgso_actions")
        .select("id, status");

      setStats({
        totalPlans: plans?.length || 0,
        activePlans: plans?.filter(p => p.status === "active").length || 0,
        totalActions: actions?.length || 0,
        pendingActions: actions?.filter(a => a.status === "pending").length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SGSO - Safety Management System</h1>
          <p className="text-muted-foreground mt-1">
            Sistema de Gestão de Segurança e Saúde Operacional
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Safety Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingActions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Safety Plans</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <PlansList 
            onSelectPlan={setSelectedPlan}
            onRefresh={loadStats}
          />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <ActionsList 
            selectedPlanId={selectedPlan?.id}
            onRefresh={loadStats}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <VersionHistory selectedPlanId={selectedPlan?.id} />
        </TabsContent>
      </Tabs>

      <CreatePlanDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadStats}
      />
    </div>
  );
}
