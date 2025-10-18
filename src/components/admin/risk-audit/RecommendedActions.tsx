import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TrendingUp, User, CheckCircle2, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActionItem {
  id: string;
  vessel_id: string;
  source: "risk" | "audit";
  source_id: string;
  action_text: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
}

export function RecommendedActions() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [vessels, setVessels] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadVessels();
    loadActions();
  }, [selectedVessel, filterStatus]);

  const loadVessels = async () => {
    const { data } = await supabase
      .from("vessels")
      .select("id, name")
      .eq("status", "active")
      .order("name");
    
    if (data) setVessels(data);
  };

  const loadActions = async () => {
    setLoading(true);
    try {
      // Get risks with recommended actions
      let risksQuery = supabase
        .from("tactical_risks")
        .select("*")
        .not("recommended_action", "is", null)
        .gte("forecast_date", new Date().toISOString().split("T")[0])
        .order("severity", { ascending: false });

      if (selectedVessel && selectedVessel !== "all") {
        risksQuery = risksQuery.eq("vessel_id", selectedVessel);
      }

      const { data: risks } = await risksQuery;

      // Get audit predictions with recommendations
      let auditsQuery = supabase
        .from("audit_predictions")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedVessel && selectedVessel !== "all") {
        auditsQuery = auditsQuery.eq("vessel_id", selectedVessel);
      }

      const { data: audits } = await auditsQuery;

      // Transform to action items
      const riskActions: ActionItem[] = (risks || []).map((risk) => ({
        id: `risk-${risk.id}`,
        vessel_id: risk.vessel_id,
        source: "risk" as const,
        source_id: risk.id,
        action_text: risk.recommended_action,
        priority: risk.severity,
        status: risk.status || "pending",
        assigned_to: risk.assigned_to,
        due_date: risk.mitigation_deadline,
        created_at: risk.created_at,
      }));

      const auditActions: ActionItem[] = [];
      (audits || []).forEach((audit) => {
        if (audit.recommendations && Array.isArray(audit.recommendations)) {
          audit.recommendations.forEach((rec: string, idx: number) => {
            auditActions.push({
              id: `audit-${audit.id}-${idx}`,
              vessel_id: audit.vessel_id,
              source: "audit" as const,
              source_id: audit.id,
              action_text: rec,
              priority: audit.readiness_level === "low" ? "high" : "medium",
              status: "pending",
              assigned_to: null,
              due_date: null,
              created_at: audit.created_at,
            });
          });
        }
      });

      let allActions = [...riskActions, ...auditActions];

      // Apply status filter
      if (filterStatus !== "all") {
        allActions = allActions.filter(a => a.status === filterStatus);
      }

      setActions(allActions);
    } catch (error: any) {
      console.error("Error loading actions:", error);
      toast.error("Failed to load recommended actions");
    } finally {
      setLoading(false);
    }
  };

  const updateActionStatus = async (actionId: string, newStatus: string) => {
    try {
      const action = actions.find(a => a.id === actionId);
      if (!action) return;

      if (action.source === "risk") {
        const { error } = await supabase
          .from("tactical_risks")
          .update({ status: newStatus })
          .eq("id", action.source_id);

        if (error) throw error;
      }

      toast.success("Action status updated");
      loadActions();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update action status");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "closed":
      case "mitigated":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
      case "assigned":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const actionStats = {
    total: actions.length,
    pending: actions.filter(a => a.status === "pending").length,
    inProgress: actions.filter(a => a.status === "in_progress" || a.status === "assigned").length,
    completed: actions.filter(a => a.status === "closed" || a.status === "mitigated").length,
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {actionStats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {actionStats.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {actionStats.completed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="action-vessel">Vessel</Label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger id="action-vessel">
                  <SelectValue placeholder="Select vessel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  {vessels.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="action-status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="action-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="mitigated">Mitigated</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading actions...
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recommended actions found.
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(action.status)}
                        <Badge variant={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                        <Badge variant="outline">{action.source}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {action.vessel_id}
                        </span>
                      </div>

                      <p className="text-sm">{action.action_text}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {action.assigned_to && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {action.assigned_to}
                          </span>
                        )}
                        {action.due_date && (
                          <span>Due: {new Date(action.due_date).toLocaleDateString()}</span>
                        )}
                        <span>
                          Created: {new Date(action.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {action.source === "risk" && (
                      <Select
                        value={action.status}
                        onValueChange={(val) => updateActionStatus(action.id, val)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="mitigated">Mitigated</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
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
}
