import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Circle, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Action {
  id: string;
  source: "risk" | "audit";
  source_id: string;
  vessel_name: string;
  category: string;
  action: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  assigned_to: string | null;
  completed: boolean;
}

interface Profile {
  id: string;
  full_name: string;
}

export function RecommendedActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const { toast } = useToast();

  useEffect(() => {
    loadActions();
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error("Error loading profiles:", error);
    }
  };

  const loadActions = async () => {
    setLoading(true);
    try {
      // Load actions from tactical risks
      const { data: risks, error: risksError } = await supabase
        .from("tactical_risks")
        .select(`
          id,
          vessel_id,
          risk_category,
          risk_level,
          recommended_actions,
          assigned_to,
          status,
          vessels (name)
        `)
        .eq("status", "Active");

      if (risksError) throw risksError;

      // Load actions from audit predictions
      const { data: audits, error: auditsError } = await supabase
        .from("audit_predictions")
        .select(`
          id,
          vessel_id,
          audit_type,
          recommendations,
          status,
          vessels (name)
        `)
        .eq("status", "Active")
        .gt("valid_until", new Date().toISOString());

      if (auditsError) throw auditsError;

      // Transform risks into actions
      const riskActions: Action[] = [];
      risks?.forEach((risk) => {
        risk.recommended_actions?.forEach((action: string) => {
          riskActions.push({
            id: `${risk.id}-${action}`,
            source: "risk",
            source_id: risk.id,
            vessel_name: risk.vessels?.name || "Unknown",
            category: risk.risk_category,
            action: action,
            priority: risk.risk_level as any,
            assigned_to: risk.assigned_to,
            completed: false,
          });
        });
      });

      // Transform audit recommendations into actions
      const auditActions: Action[] = [];
      audits?.forEach((audit) => {
        audit.recommendations?.forEach((rec: string) => {
          auditActions.push({
            id: `${audit.id}-${rec}`,
            source: "audit",
            source_id: audit.id,
            vessel_name: audit.vessels?.name || "Unknown",
            category: audit.audit_type,
            action: rec,
            priority: "Medium",
            assigned_to: null,
            completed: false,
          });
        });
      });

      const allActions = [...riskActions, ...auditActions];
      setActions(allActions);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar ações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignAction = async (actionId: string, userId: string) => {
    try {
      const action = actions.find((a) => a.id === actionId);
      if (!action) return;

      if (action.source === "risk") {
        const { error } = await supabase
          .from("tactical_risks")
          .update({ assigned_to: userId })
          .eq("id", action.source_id);

        if (error) throw error;
      }

      toast({
        title: "Ação atribuída",
        description: "Usuário atribuído com sucesso",
      });

      await loadActions();
    } catch (error: any) {
      toast({
        title: "Erro ao atribuir ação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleComplete = async (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    if (!action) return;

    const updatedActions = actions.map((a) =>
      a.id === actionId ? { ...a, completed: !a.completed } : a
    );
    setActions(updatedActions);

    // In a real implementation, you would update the database here
    toast({
      title: action.completed ? "Ação reaberta" : "Ação concluída",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredActions = actions.filter((action) => {
    if (filterPriority !== "all" && action.priority !== filterPriority)
      return false;
    if (filterStatus === "pending" && action.completed) return false;
    if (filterStatus === "completed" && !action.completed) return false;
    return true;
  });

  const stats = {
    total: actions.length,
    pending: actions.filter((a) => !a.completed).length,
    completed: actions.filter((a) => a.completed).length,
    critical: actions.filter((a) => a.priority === "Critical").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total de Ações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">Concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {stats.critical}
            </div>
            <p className="text-xs text-muted-foreground">Críticas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Critical">Crítica</SelectItem>
                  <SelectItem value="High">Alta</SelectItem>
                  <SelectItem value="Medium">Média</SelectItem>
                  <SelectItem value="Low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Recomendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma ação encontrada com os filtros selecionados
              </p>
            ) : (
              filteredActions.map((action) => (
                <div
                  key={action.id}
                  className={`border rounded-lg p-4 space-y-3 ${
                    action.completed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={action.completed}
                        onCheckedChange={() => toggleComplete(action.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getPriorityColor(action.priority)}>
                            {action.priority}
                          </Badge>
                          <Badge variant="outline">{action.vessel_name}</Badge>
                          <Badge variant="secondary">{action.category}</Badge>
                          <Badge
                            variant="outline"
                            className={action.source === "risk" ? "text-orange-600" : "text-blue-600"}
                          >
                            {action.source === "risk"
                              ? "Risco Tático"
                              : "Auditoria"}
                          </Badge>
                        </div>
                        <p className="text-sm">{action.action}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pl-9">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={action.assigned_to || "unassigned"}
                        onValueChange={(value) =>
                          value !== "unassigned" && assignAction(action.id, value)
                        }
                      >
                        <SelectTrigger className="w-[200px] h-8">
                          <SelectValue placeholder="Atribuir a..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Não atribuído</SelectItem>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.full_name || "Sem nome"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {action.completed ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Concluída
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Circle className="h-4 w-4" />
                        Pendente
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
