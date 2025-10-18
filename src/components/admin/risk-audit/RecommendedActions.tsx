import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecommendedActionsProps {
  selectedVessel: string | null;
}

export const RecommendedActions: React.FC<RecommendedActionsProps> = ({
  selectedVessel,
}) => {
  const [actions, setActions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedVessel]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load tactical risks with suggested actions
      const risksQuery = supabase
        .from("tactical_risks")
        .select("*, vessels(name)")
        .eq("status", "active");

      if (selectedVessel) {
        risksQuery.eq("vessel_id", selectedVessel);
      }

      const { data: risksData } = await risksQuery.order("risk_score", {
        ascending: false,
      });

      // Load audit predictions with recommendations
      const predictionsQuery = supabase
        .from("audit_predictions")
        .select("*, vessels(name)")
        .eq("status", "active");

      if (selectedVessel) {
        predictionsQuery.eq("vessel_id", selectedVessel);
      }

      const { data: predictionsData } = await predictionsQuery.order(
        "expected_score",
        { ascending: true }
      );

      // Combine actions
      const combinedActions = [
        ...(risksData || []).map((risk) => ({
          id: risk.id,
          type: "risk",
          vessel_name: risk.vessels?.name,
          vessel_id: risk.vessel_id,
          title: `${risk.system} - ${risk.predicted_risk}`,
          action: risk.suggested_action,
          priority: risk.risk_score >= 80 ? "high" : risk.risk_score >= 60 ? "medium" : "low",
          score: risk.risk_score,
          assigned_to: risk.assigned_to,
          created_at: risk.generated_at,
        })),
        ...(predictionsData || []).flatMap((pred) =>
          (pred.recommendations || []).map((rec: string, idx: number) => ({
            id: `${pred.id}-${idx}`,
            type: "audit",
            vessel_name: pred.vessels?.name,
            vessel_id: pred.vessel_id,
            title: `Auditoria ${pred.audit_type}`,
            action: rec,
            priority: pred.expected_score < 60 ? "high" : pred.expected_score < 75 ? "medium" : "low",
            score: pred.expected_score,
            assigned_to: null,
            created_at: pred.generated_at,
          }))
        ),
      ];

      setActions(combinedActions);

      // Load users for assignment
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      setUsers(usersData || []);
    } catch (error) {
      console.error("Error loading actions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (actionId: string, userId: string) => {
    try {
      const action = actions.find((a) => a.id === actionId);
      if (!action) return;

      if (action.type === "risk") {
        const { error } = await supabase
          .from("tactical_risks")
          .update({ assigned_to: userId })
          .eq("id", actionId);

        if (error) throw error;
      }

      toast({
        title: "Ação atribuída",
        description: "A ação foi atribuída com sucesso.",
      });

      await loadData();
    } catch (error) {
      console.error("Error assigning action:", error);
      toast({
        title: "Erro ao atribuir",
        description: "Não foi possível atribuir a ação.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "destructive";
    if (priority === "medium") return "warning";
    return "default";
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === "high") return "Alta";
    if (priority === "medium") return "Média";
    return "Baixa";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Ações Recomendadas
          </CardTitle>
          <CardDescription>
            Ações sugeridas com botão de atribuição para usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Carregando ações...
            </p>
          ) : actions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma ação recomendada no momento.
            </p>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getPriorityColor(action.priority)}>
                        {getPriorityLabel(action.priority)}
                      </Badge>
                      <Badge variant="outline">{action.vessel_name}</Badge>
                      {action.type === "risk" && (
                        <Badge variant="secondary">Risco</Badge>
                      )}
                      {action.type === "audit" && (
                        <Badge variant="secondary">Auditoria</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold mb-1">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {action.action}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(action.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {action.type === "risk" && (
                      <>
                        <Select
                          value={action.assigned_to || ""}
                          onValueChange={(userId) =>
                            handleAssign(action.id, userId)
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Atribuir a..." />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.full_name || user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {action.assigned_to && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Atribuído
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
