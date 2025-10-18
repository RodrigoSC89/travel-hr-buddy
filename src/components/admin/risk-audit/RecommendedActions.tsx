import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Action {
  id: string;
  source: "risk" | "audit";
  vessel_name: string;
  system?: string;
  audit_type?: string;
  action: string;
  priority: string;
  assigned_to: string | null;
  status: string;
}

export function RecommendedActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load users for assignment
      const { data: usersData } = await supabase.auth.admin.listUsers();
      setUsers((usersData?.users as { id: string; email?: string }[]) || []);

      // Load tactical risks actions
      const { data: risks } = await supabase
        .from("tactical_risks")
        .select(`
          id,
          vessel_id,
          system,
          suggested_action,
          risk_level,
          assigned_to,
          status,
          vessels (name)
        `)
        .eq("status", "pending")
        .gt("valid_until", new Date().toISOString());

      // Load audit recommendations
      const { data: audits } = await supabase
        .from("audit_predictions")
        .select(`
          id,
          vessel_id,
          audit_type,
          recommendations,
          vessels (name)
        `)
        .gt("valid_until", new Date().toISOString()) as { data: { id: string; vessel_id: string; audit_type: string; recommendations: string[]; vessels?: { name: string } }[] | null };

      // Combine actions
      const combinedActions: Action[] = [];

      // Add risk actions
      if (risks) {
        (risks as { id: string; vessel_id: string; system: string; suggested_action: string; risk_level: string; assigned_to: string | null; status: string; vessels?: { name: string } }[]).forEach((risk) => {
          combinedActions.push({
            id: `risk-${risk.id}`,
            source: "risk",
            vessel_name: risk.vessels?.name || "Unknown",
            system: risk.system,
            action: risk.suggested_action,
            priority: risk.risk_level === "Critical" || risk.risk_level === "High" ? "High" : "Medium",
            assigned_to: risk.assigned_to,
            status: risk.status,
          });
        });
      }

      // Add audit recommendations
      if (audits) {
        audits.forEach((audit) => {
          if (audit.recommendations && Array.isArray(audit.recommendations)) {
            audit.recommendations.forEach((rec: string, index: number) => {
              combinedActions.push({
                id: `audit-${audit.id}-${index}`,
                source: "audit",
                vessel_name: audit.vessels?.name || "Unknown",
                audit_type: audit.audit_type,
                action: rec,
                priority: "Medium",
                assigned_to: null,
                status: "pending",
              });
            });
          }
        });
      }

      // Sort by priority
      combinedActions.sort((a, b) => {
        if (a.priority === "High" && b.priority !== "High") return -1;
        if (a.priority !== "High" && b.priority === "High") return 1;
        return 0;
      });

      setActions(combinedActions);
    } catch (error) {
      console.error("Error loading actions:", error);
      toast.error("Erro ao carregar ações");
    } finally {
      setLoading(false);
    }
  };

  const assignAction = async (actionId: string, userId: string) => {
    try {
      const [source, id] = actionId.split("-");
      
      if (source === "risk") {
        const { error } = await supabase
          .from("tactical_risks")
          .update({ assigned_to: userId })
          .eq("id", id);

        if (error) throw error;
      }

      toast.success("Ação atribuída com sucesso!");
      await loadData();
    } catch (error) {
      console.error("Error assigning action:", error);
      toast.error("Erro ao atribuir ação");
    }
  };

  const markComplete = async (actionId: string) => {
    try {
      const [source, id] = actionId.split("-");
      
      if (source === "risk") {
        const { error } = await supabase
          .from("tactical_risks")
          .update({ status: "resolved", resolved_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw error;
      }

      toast.success("Ação marcada como concluída!");
      await loadData();
    } catch (error) {
      console.error("Error completing action:", error);
      toast.error("Erro ao concluir ação");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "High":
      return "destructive";
    case "Medium":
      return "default";
    default:
      return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ações Recomendadas</CardTitle>
          <CardDescription>
            {actions.length} ação(ões) pendente(s) de riscos táticos e auditorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma ação pendente no momento
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => (
                <Card key={action.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(action.priority) as "default" | "destructive" | "secondary" | null | undefined}>
                            {action.priority}
                          </Badge>
                          <Badge variant="outline">
                            {action.source === "risk" ? `Risco: ${action.system}` : `Auditoria: ${action.audit_type}`}
                          </Badge>
                          <span className="text-sm font-medium">{action.vessel_name}</span>
                        </div>

                        <p className="text-sm">{action.action}</p>

                        <div className="flex items-center gap-2">
                          {action.source === "risk" && (
                            <>
                              <Select
                                value={action.assigned_to || ""}
                                onValueChange={(value) => assignAction(action.id, value)}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Atribuir a...">
                                    {action.assigned_to ? (
                                      <span className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Atribuído
                                      </span>
                                    ) : (
                                      "Atribuir a..."
                                    )}
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

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markComplete(action.id)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Concluir
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
