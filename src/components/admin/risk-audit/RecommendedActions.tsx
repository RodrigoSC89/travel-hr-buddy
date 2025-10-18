import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, User, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Action {
  id: string;
  type: "risk" | "audit";
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  assigned_to: string | null;
  status: string;
  vessel_name?: string;
  system?: string;
  audit_type?: string;
}

interface User {
  id: string;
  email: string;
}

export function RecommendedActions() {
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users for assignment
      const { data: usersData } = await supabase.auth.admin.listUsers();
      if (usersData) {
        setUsers(usersData.users.map(u => ({ id: u.id, email: u.email || "Unknown" })));
      }

      // Load tactical risks as actions
      const { data: risks } = await supabase
        .from("tactical_risks")
        .select(`
          id,
          system,
          description,
          suggested_action,
          risk_level,
          assigned_to,
          status,
          vessels (name)
        `)
        .eq("status", "active")
        .order("risk_score", { ascending: false });

      // Load audit predictions as actions
      const { data: predictions } = await supabase
        .from("audit_predictions")
        .select(`
          id,
          audit_type,
          recommendations,
          probability,
          vessels (name)
        `)
        .eq("status", "active");

      const allActions: Action[] = [];

      // Convert risks to actions
      if (risks) {
        risks.forEach((risk: any) => {
          allActions.push({
            id: risk.id,
            type: "risk",
            title: `${risk.system} - Risk Mitigation`,
            description: risk.suggested_action || risk.description,
            priority: risk.risk_level === "Critical" ? "High" : risk.risk_level === "High" ? "High" : risk.risk_level === "Medium" ? "Medium" : "Low",
            assigned_to: risk.assigned_to,
            status: risk.status,
            vessel_name: risk.vessels?.name,
            system: risk.system,
          });
        });
      }

      // Convert predictions to actions
      if (predictions) {
        predictions.forEach((pred: any) => {
          if (pred.recommendations && Array.isArray(pred.recommendations)) {
            pred.recommendations.forEach((rec: string, idx: number) => {
              allActions.push({
                id: `${pred.id}-${idx}`,
                type: "audit",
                title: `${pred.audit_type} Audit Recommendation`,
                description: rec,
                priority: pred.probability === "Baixa" ? "High" : pred.probability === "Média" ? "Medium" : "Low",
                assigned_to: null,
                status: "pending",
                vessel_name: pred.vessels?.name,
                audit_type: pred.audit_type,
              });
            });
          }
        });
      }

      // Sort by priority
      allActions.sort((a, b) => {
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setActions(allActions);
    } catch (error: any) {
      console.error("Error loading actions:", error);
      toast.error("Failed to load actions");
    } finally {
      setLoading(false);
    }
  };

  const assignAction = async (actionId: string, userId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action || action.type !== "risk") return;

    try {
      const { error } = await supabase
        .from("tactical_risks")
        .update({ assigned_to: userId })
        .eq("id", actionId);

      if (error) throw error;

      toast.success("Action assigned successfully");
      await loadData();
    } catch (error: any) {
      console.error("Error assigning action:", error);
      toast.error("Failed to assign action");
    }
  };

  const markComplete = async (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action || action.type !== "risk") return;

    try {
      const { error } = await supabase
        .from("tactical_risks")
        .update({ status: "resolved" })
        .eq("id", actionId);

      if (error) throw error;

      toast.success("Action marked as complete");
      await loadData();
    } catch (error: any) {
      console.error("Error marking complete:", error);
      toast.error("Failed to mark action as complete");
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ações Recomendadas</h2>
        <p className="text-sm text-muted-foreground">
          Consolidação de ações de riscos e auditorias
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{actions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alta Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-3xl font-bold text-red-600">
                {actions.filter(a => a.priority === "High").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Não Atribuídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {actions.filter(a => !a.assigned_to).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ações</CardTitle>
          <CardDescription>
            Atribua e acompanhe as ações recomendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actions.map((action) => (
              <div 
                key={action.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{action.title}</span>
                    <Badge variant={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                    {action.vessel_name && (
                      <Badge variant="outline">{action.vessel_name}</Badge>
                    )}
                    {action.system && (
                      <Badge variant="secondary">{action.system}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  
                  {action.type === "risk" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select
                        value={action.assigned_to || ""}
                        onValueChange={(value) => assignAction(action.id, value)}
                      >
                        <SelectTrigger className="w-[250px]">
                          <SelectValue placeholder="Atribuir a...">
                            {action.assigned_to 
                              ? users.find(u => u.id === action.assigned_to)?.email || "Unknown"
                              : "Atribuir a..."
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {action.assigned_to && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markComplete(action.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Marcar como Concluída
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {actions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma ação pendente
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
