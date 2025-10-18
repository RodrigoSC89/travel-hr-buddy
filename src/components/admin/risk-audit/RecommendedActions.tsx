"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { CheckSquare, User, Clock, Target } from "lucide-react";

interface Action {
  id: string;
  source: "risk" | "audit";
  source_id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  assigned_to: string | null;
  assigned_to_name: string | null;
  status: "open" | "in_progress" | "completed";
  due_date: string;
}

interface User {
  id: string;
  name: string;
}

export function RecommendedActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load users
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, name")
        .order("name");

      if (userError) throw userError;
      setUsers(userData || []);

      // Load risks and convert to actions
      const { data: riskData, error: riskError } = await supabase
        .from("tactical_risks")
        .select("*, profiles(name)")
        .eq("status", "open")
        .order("severity", { ascending: false });

      if (riskError) throw riskError;

      const riskActions: Action[] = (riskData || []).flatMap((risk: any) =>
        (risk.recommended_actions || []).map((action: string, index: number) => ({
          id: `risk-${risk.id}-${index}`,
          source: "risk" as const,
          source_id: risk.id,
          title: action,
          description: risk.description,
          priority: risk.severity,
          assigned_to: risk.assigned_to,
          assigned_to_name: risk.profiles?.name || null,
          status: risk.status === "open" ? "open" : "completed",
          due_date: risk.forecasted_date,
        }))
      );

      // Load audit predictions and convert to actions
      const { data: auditData, error: auditError } = await supabase
        .from("audit_predictions")
        .select("*")
        .gte("valid_until", new Date().toISOString().split("T")[0])
        .order("predicted_score", { ascending: true });

      if (auditError) throw auditError;

      const auditActions: Action[] = (auditData || []).flatMap((audit: any) =>
        (audit.recommendations || []).map((rec: string, index: number) => ({
          id: `audit-${audit.id}-${index}`,
          source: "audit" as const,
          source_id: audit.id,
          title: rec,
          description: `${audit.audit_type} - Score previsto: ${audit.predicted_score}`,
          priority: audit.readiness_status === "Critical" ? "Critical" : 
                   audit.readiness_status === "Needs_Improvement" ? "High" : "Medium",
          assigned_to: null,
          assigned_to_name: null,
          status: "open",
          due_date: audit.valid_until,
        }))
      );

      setActions([...riskActions, ...auditActions]);
    } catch (error) {
      console.error("Error loading actions:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar ações recomendadas",
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
        const riskId = action.source_id;
        const { error } = await supabase
          .from("tactical_risks")
          .update({ assigned_to: userId, status: "in_progress" })
          .eq("id", riskId);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Ação atribuída com sucesso",
      });

      loadData();
    } catch (error) {
      console.error("Error assigning action:", error);
      toast({
        title: "Erro",
        description: "Falha ao atribuir ação",
        variant: "destructive",
      });
    }
  };

  const markComplete = async (actionId: string) => {
    try {
      const action = actions.find((a) => a.id === actionId);
      if (!action) return;

      if (action.source === "risk") {
        const riskId = action.source_id;
        const { error } = await supabase
          .from("tactical_risks")
          .update({ status: "resolved" })
          .eq("id", riskId);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Ação marcada como concluída",
      });

      loadData();
    } catch (error) {
      console.error("Error marking complete:", error);
      toast({
        title: "Erro",
        description: "Falha ao marcar como concluída",
        variant: "destructive",
      });
    }
  };

  const filteredActions = actions.filter((action) => {
    if (filter === "all") return true;
    if (filter === "unassigned") return !action.assigned_to;
    if (filter === "assigned") return !!action.assigned_to;
    if (filter === "critical") return action.priority === "Critical";
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "destructive";
      case "High":
        return "orange";
      case "Medium":
        return "yellow";
      case "Low":
        return "default";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const stats = {
    total: actions.length,
    unassigned: actions.filter((a) => !a.assigned_to).length,
    critical: actions.filter((a) => a.priority === "Critical").length,
    completed: actions.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="h-6 w-6" />
          Ações Recomendadas
        </h2>
        <p className="text-muted-foreground">Consolidação de ações de riscos e auditorias</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.unassigned}</div>
            <div className="text-sm text-muted-foreground">Não Atribuídas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-muted-foreground">Críticas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Concluídas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Ações</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unassigned">Não Atribuídas</SelectItem>
                <SelectItem value="assigned">Atribuídas</SelectItem>
                <SelectItem value="critical">Críticas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActions.map((action) => (
              <div key={action.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getPriorityColor(action.priority) as any}>
                        {action.priority}
                      </Badge>
                      <Badge variant="outline">
                        {action.source === "risk" ? "Risco" : "Auditoria"}
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-1">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(action.due_date).toLocaleDateString("pt-BR")}
                    </div>
                    {action.assigned_to_name && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {action.assigned_to_name}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!action.assigned_to && (
                      <Select onValueChange={(userId) => assignAction(action.id, userId)}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Atribuir a..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {action.status !== "completed" && (
                      <Button size="sm" onClick={() => markComplete(action.id)}>
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredActions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma ação encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
