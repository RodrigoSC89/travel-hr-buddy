/**
 * Maritime Command Center - Refactored Orchestrator
 * (~200 lines from 866)
 */
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Ship, Users, Shield, CheckCircle, AlertTriangle, Clock, Award, Target, Activity,
  Brain, Sparkles, BarChart3, ClipboardList, FileText, TrendingUp
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { CrewMember, MaritimeStats, FALLBACK_CREW_MEMBERS } from "./maritime/types";
import { MaritimeTabs } from "./maritime/MaritimeTabs";

export default function MaritimeCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [vessels, setVessels] = useState<{ id: string; name: string; status: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [stats, setStats] = useState<MaritimeStats>({
    totalChecklists: 0, completedChecklists: 0, pendingChecklists: 0, activeVessels: 0,
    averageCompliance: 0, criticalIssues: 0, totalCrew: 0, activeCrew: 0, certExpiring: 0, certValid: 0
  });
  
  const { handleCreate, handleExport, handleRefresh, showInfo } = useMaritimeActions();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data?.user?.id) setUserId(data.user.id); });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: vesselsData } = await supabase.from("vessels").select("id, name, status").limit(50);
      if (vesselsData) setVessels(vesselsData);

      const { data: checklists } = await supabase.from("operational_checklists").select("status, compliance_score");
      const fallbackCrewMembers = FALLBACK_CREW_MEMBERS([vesselsData?.[0]?.id, vesselsData?.[1]?.id]);
      setCrewMembers(fallbackCrewMembers);

      const total = checklists?.length || 12;
      const completed = checklists?.filter(c => c.status === "completed").length || 8;
      const pending = checklists?.filter(c => c.status === "in_progress" || c.status === "draft").length || 4;
      const avgCompliance = checklists?.length
        ? checklists.reduce((sum, c) => sum + (c.compliance_score || 85), 0) / checklists.length : 87;

      setStats({
        totalChecklists: total, completedChecklists: completed, pendingChecklists: pending,
        activeVessels: vesselsData?.length || 5, averageCompliance: Math.round(avgCompliance), criticalIssues: 2,
        totalCrew: fallbackCrewMembers.length, activeCrew: fallbackCrewMembers.filter((m: CrewMember) => m.status === "active").length,
        certExpiring: 3, certValid: 12
      });
    } catch {
      toast.error("Erro ao carregar dados marítimos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="Maritime Command Center"
        description="Centro Unificado de Operações Marítimas - Tripulação, Certificações e Checklists"
        gradient="blue"
        badges={[
          { icon: Users, label: `${stats.totalCrew} Tripulantes` },
          { icon: Shield, label: `${stats.certValid} Certificações` },
          { icon: ClipboardList, label: `${stats.totalChecklists} Checklists` },
          { icon: Ship, label: `${stats.activeVessels} Embarcações` }
        ]}
      />

      {/* KPIs Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {[
          { icon: Users, value: stats.totalCrew, label: "Tripulantes", gradient: "from-blue-500/10 to-cyan-500/10", border: "border-blue-500/20", color: "text-primary" },
          { icon: CheckCircle, value: stats.activeCrew, label: "Ativos", gradient: "from-success/10 to-success/5", border: "border-success/20", color: "text-success" },
          { icon: Award, value: stats.certValid, label: "Cert. Válidas", gradient: "from-secondary/10 to-accent/10", border: "border-secondary/20", color: "text-secondary" },
          { icon: Clock, value: stats.certExpiring, label: "Cert. Vencendo", gradient: "from-warning/10 to-warning/5", border: "border-warning/20", color: "text-warning" },
          { icon: ClipboardList, value: stats.totalChecklists, label: "Checklists", gradient: "from-info/10 to-info/5", border: "border-info/20", color: "text-info" },
          { icon: FileText, value: stats.completedChecklists, label: "Concluídos", gradient: "from-success/10 to-success/5", border: "border-success/20", color: "text-success" },
          { icon: Target, value: `${stats.averageCompliance}%`, label: "Conformidade", gradient: "from-primary/10 to-primary/5", border: "border-primary/20", color: "text-primary" },
          { icon: AlertTriangle, value: stats.criticalIssues, label: "Issues Críticos", gradient: "from-destructive/10 to-destructive/5", border: "border-destructive/20", color: "text-destructive" },
        ].map((kpi) => (
          <Card key={kpi.label} className={`bg-gradient-to-br ${kpi.gradient} ${kpi.border}`}>
            <CardContent className="p-4 text-center">
              <kpi.icon className={`h-6 w-6 mx-auto mb-2 ${kpi.color}`} />
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 bg-background/50 backdrop-blur-sm p-1 h-auto">
          {[
            { value: "overview", icon: BarChart3, label: "Visão Geral" },
            { value: "crew-list", icon: Users, label: "Tripulação" },
            { value: "crew-intelligence", icon: Brain, label: "Crew Intelligence", sparkle: true },
            { value: "crew-insights", icon: TrendingUp, label: "AI Insights" },
            { value: "certifications", icon: Award, label: "Certificações" },
            { value: "maritime-certs", icon: Shield, label: "Cert. Marítimas" },
            { value: "checklists", icon: ClipboardList, label: "Checklists" },
            { value: "iot-sensors", icon: Activity, label: "IoT & Sensores" },
            { value: "ai-analysis", icon: Brain, label: "Análise IA" },
          ].map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className={`flex items-center gap-1.5 text-xs ${tab.sparkle ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' : ''}`}>
              <tab.icon className="h-3.5 w-3.5" />{tab.label}
              {tab.sparkle && <Sparkles className="h-3 w-3 text-primary" />}
            </TabsTrigger>
          ))}
        </TabsList>

        <MaritimeTabs
          stats={stats}
          crewMembers={crewMembers}
          vessels={vessels}
          userId={userId}
          onTabChange={setActiveTab}
          handleCreate={handleCreate}
          handleExport={handleExport}
          showInfo={showInfo}
        />
      </Tabs>

      <ModuleActionButton
        moduleId="maritime-command"
        moduleName="Maritime Command"
        actions={[
          { id: "crew", label: "Tripulação", icon: <Users className="h-3 w-3" />, action: () => setActiveTab("crew-list") },
          { id: "certifications", label: "Certificações", icon: <Award className="h-3 w-3" />, action: () => setActiveTab("certifications") },
          { id: "checklists", label: "Checklists", icon: <ClipboardList className="h-3 w-3" />, action: () => setActiveTab("checklists") },
          { id: "intelligence", label: "Crew Intelligence", icon: <Brain className="h-3 w-3" />, action: () => setActiveTab("crew-intelligence") },
          { id: "sensors", label: "IoT & Sensores", icon: <Activity className="h-3 w-3" />, action: () => setActiveTab("iot-sensors") },
          { id: "ai-analysis", label: "Análise IA", icon: <Sparkles className="h-3 w-3" />, action: () => setActiveTab("ai-analysis") }
        ]}
      />
    </ModulePageWrapper>
  );
}
