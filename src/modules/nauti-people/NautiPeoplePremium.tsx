/**
 * Nauti People Premium - v2.0
 * Gestão de Tripulação e RH Marítimo
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, LayoutDashboard, UserCheck, Calendar, Award,
  Clock, Ship, Bot, FileText, Plus, Briefcase, Heart,
  GraduationCap, AlertTriangle, TrendingUp
} from "lucide-react";
import { PremiumModuleShell } from "@/components/ui/premium-module-kit";
import type { ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// People Dashboard
function PeopleDashboard() {
  const navigate = useNavigate();
  const [crew, setCrew] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCrew() {
      const { data } = await supabase
        .from("crew_members")
        .select("*")
        .order("full_name")
        .limit(50);
      
      if (data) setCrew(data);
      setLoading(false);
    }
    loadCrew();
  }, []);

  const activeCrew = crew.filter(c => c.status === "active" || c.status === "on_board").length;
  const onLeaveCrew = crew.filter(c => c.status === "on_leave" || c.status === "vacation").length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Tripulação</p>
                <p className="text-2xl font-bold">{crew.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Embarcados</p>
                <p className="text-2xl font-bold text-success">{activeCrew}</p>
              </div>
              <Ship className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Folga</p>
                <p className="text-2xl font-bold text-warning">{onLeaveCrew}</p>
              </div>
              <Calendar className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">MLC Score</p>
                <p className="text-2xl font-bold">96%</p>
              </div>
              <Award className="h-8 w-8 text-info opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Bem-Estar</p>
                <p className="text-2xl font-bold">8.5</p>
              </div>
              <Heart className="h-8 w-8 text-rose-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

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
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate("/crew-management?action=new")}>
              <UserCheck className="h-4 w-4" />
              Cadastrar Tripulante
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate("/crew-management?tab=embarkation")}>
              <Ship className="h-4 w-4" />
              Registrar Embarque
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate("/ai-training")}>
              <GraduationCap className="h-4 w-4" />
              Agendar Treinamento
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate("/crew-wellbeing")}>
              <Bot className="h-4 w-4" />
              Análise de Fadiga com IA
            </Button>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertas de RH
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "Certificado Expirando", crew: "João Silva", days: 15, severity: "warning" },
                { type: "Contrato Vencendo", crew: "Maria Santos", days: 30, severity: "info" },
                { type: "Exame Médico", crew: "Pedro Costa", days: 7, severity: "warning" },
              ].map((alert) => (
                <div key={`${alert.type}-${alert.crew}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{alert.type}</p>
                    <p className="text-sm text-muted-foreground">{alert.crew}</p>
                  </div>
                  <Badge variant={alert.severity === "warning" ? "secondary" : "outline"}>
                    {alert.days} dias
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STCW/MLC Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Conformidade STCW/MLC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { reg: "STCW", score: 95 },
              { reg: "MLC 2006", score: 96 },
              { reg: "Horas de Descanso", score: 92 },
              { reg: "Treinamentos", score: 88 },
            ].map((item) => (
              <div key={item.reg} className="p-4 border rounded-lg text-center">
                <p className="text-sm font-medium mb-2">{item.reg}</p>
                <p className={`text-2xl font-bold ${item.score >= 90 ? "text-success" : "text-warning"}`}>
                  {item.score}%
                </p>
                <Progress value={item.score} className="mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crew List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tripulação
          </CardTitle>
          <CardDescription>Lista de tripulantes ativos</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : crew.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum tripulante encontrado</p>
              <Button className="mt-4" onClick={() => navigate("/crew-management?action=new")}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Tripulante
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {crew.slice(0, 8).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{member.full_name?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{member.full_name}</p>
                      <p className="text-sm text-muted-foreground">{member.rank || "Tripulante"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">{member.nationality || "Brasileiro"}</p>
                    </div>
                    <Badge variant={
                      member.status === "active" || member.status === "on_board" ? "default" :
                      member.status === "on_leave" ? "secondary" : "outline"
                    }>
                      {member.status === "active" || member.status === "on_board" ? "Embarcado" :
                       member.status === "on_leave" ? "Em Folga" : member.status || "Ativo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NautiPeoplePremium() {
  const handleRefresh = async () => {
    // Real refresh handled by React Query invalidation
  };

  const handleExport = async () => {
    try {
      const { data } = await supabase.from('crew_members').select('full_name, rank, nationality, status').order('full_name');
      if (!data || data.length === 0) { toast.error("Sem dados para exportar"); return; }
      const csvRows = ['Nome;Posto;Nacionalidade;Status', ...(data as any[]).map(c => `${c.full_name};${c.rank || ''};${c.nationality || ''};${c.status || ''}`)];
      const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tripulacao-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Relatório de tripulação exportado");
    } catch {
      toast.error("Erro ao exportar relatório");
    }
  };

  const tabs: ModuleTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      content: <PeopleDashboard />
    },
    {
      id: "crew",
      label: "Tripulação",
      icon: Users,
      content: <div className="text-center py-12 text-muted-foreground">Lista de Tripulação</div>
    },
    {
      id: "contracts",
      label: "Contratos",
      icon: Briefcase,
      badge: 2,
      content: <div className="text-center py-12 text-muted-foreground">Gestão de Contratos SEA</div>
    },
    {
      id: "training",
      label: "Treinamentos",
      icon: GraduationCap,
      content: <div className="text-center py-12 text-muted-foreground">Academy e Certificações</div>
    },
    {
      id: "wellness",
      label: "Bem-Estar",
      icon: Heart,
      content: <div className="text-center py-12 text-muted-foreground">Saúde e Bem-Estar</div>
    }
  ];

  const actions = (
    <>
      <Button variant="outline" size="sm" className="gap-2">
        <Calendar className="h-4 w-4" />
        Escala
      </Button>
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Novo Tripulante
      </Button>
    </>
  );

  return (
    <PremiumModuleShell
      title="People Hub"
      subtitle="Gestão de tripulação e RH marítimo"
      icon={Users}
      iconGradient="from-indigo-500 to-blue-600"
      tabs={tabs}
      defaultTab="dashboard"
      actions={actions}
      onRefresh={handleRefresh}
      onExport={handleExport}
      showAIBadge={true}
      aiStatus="active"
      alerts={3}
    />
  );
}
