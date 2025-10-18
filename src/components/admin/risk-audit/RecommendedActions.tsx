import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Action {
  id: string;
  source: "risk" | "audit";
  source_id: string;
  vessel_name: string;
  priority: "High" | "Medium" | "Low";
  description: string;
  assigned_to: string | null;
  completed: boolean;
}

export function RecommendedActions() {
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load actions from risks
      const { data: risks, error: risksError } = await supabase
        .from("tactical_risks")
        .select(`
          id,
          vessel_id,
          suggested_actions,
          risk_level,
          assigned_to,
          status,
          vessel:vessels(name)
        `)
        .eq("status", "active");

      if (risksError) throw risksError;

      // Load actions from audit predictions
      const { data: audits, error: auditsError } = await supabase
        .from("audit_predictions")
        .select(`
          id,
          vessel_id,
          recommendations,
          probability,
          status,
          vessel:vessels(name)
        `)
        .eq("status", "active");

      if (auditsError) throw auditsError;

      // Load users for assignment
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Consolidate actions
      const consolidatedActions: Action[] = [];

      // Add risk actions
      risks?.forEach((risk) => {
        if (risk.suggested_actions) {
          consolidatedActions.push({
            id: `risk-${risk.id}`,
            source: "risk",
            source_id: risk.id,
            vessel_name: risk.vessel?.name || "Unknown",
            priority: risk.risk_level === "Critical" || risk.risk_level === "High" ? "High" : 
                     risk.risk_level === "Medium" ? "Medium" : "Low",
            description: risk.suggested_actions,
            assigned_to: risk.assigned_to,
            completed: false,
          });
        }
      });

      // Add audit recommendations
      audits?.forEach((audit) => {
        audit.recommendations?.forEach((rec: string, index: number) => {
          consolidatedActions.push({
            id: `audit-${audit.id}-${index}`,
            source: "audit",
            source_id: audit.id,
            vessel_name: audit.vessel?.name || "Unknown",
            priority: audit.probability === "Baixa" ? "High" : 
                     audit.probability === "Média" ? "Medium" : "Low",
            description: rec,
            assigned_to: null,
            completed: false,
          });
        });
      });

      // Sort by priority
      consolidatedActions.sort((a, b) => {
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setActions(consolidatedActions);
    } catch (error) {
      console.error("Error loading actions:", error);
      toast.error("Erro ao carregar ações");
    } finally {
      setLoading(false);
    }
  }

  async function assignAction(action: Action, userId: string) {
    try {
      if (action.source === "risk") {
        const { error } = await supabase
          .from("tactical_risks")
          .update({ assigned_to: userId })
          .eq("id", action.source_id);

        if (error) throw error;
      }

      toast.success("Ação atribuída com sucesso");
      await loadData();
    } catch (error) {
      console.error("Error assigning action:", error);
      toast.error("Erro ao atribuir ação");
    }
  }

  async function toggleActionComplete(action: Action) {
    try {
      if (action.source === "risk") {
        const newStatus = action.completed ? "active" : "resolved";
        const { error } = await supabase
          .from("tactical_risks")
          .update({ status: newStatus })
          .eq("id", action.source_id);

        if (error) throw error;
      }

      toast.success(action.completed ? "Ação reaberta" : "Ação concluída");
      await loadData();
    } catch (error) {
      console.error("Error toggling action:", error);
      toast.error("Erro ao atualizar ação");
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "default";
      case "Low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === "High" ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <CheckCircle2 className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ações Recomendadas</CardTitle>
          <CardDescription>
            Ações consolidadas de riscos táticos e previsões de auditoria
          </CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : actions.length === 0 ? (
        <Alert>
          <AlertDescription>
            Nenhuma ação recomendada no momento. Gere previsões de risco ou auditoria para receber recomendações.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <Card key={action.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={action.completed}
                    onCheckedChange={() => toggleActionComplete(action)}
                    disabled={action.source === "audit"}
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getPriorityColor(action.priority)}>
                        {getPriorityIcon(action.priority)}
                        <span className="ml-1">{action.priority}</span>
                      </Badge>
                      <Badge variant="outline">{action.vessel_name}</Badge>
                      <Badge variant="outline">
                        {action.source === "risk" ? "Risco" : "Auditoria"}
                      </Badge>
                    </div>
                    
                    <p className={`text-sm ${action.completed ? "line-through text-muted-foreground" : ""}`}>
                      {action.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-muted-foreground">Atribuir a:</span>
                      <Select
                        value={action.assigned_to || ""}
                        onValueChange={(value) => assignAction(action, value)}
                        disabled={action.source === "audit"}
                      >
                        <SelectTrigger className="w-[200px] h-8 text-xs">
                          <SelectValue placeholder="Selecionar usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
