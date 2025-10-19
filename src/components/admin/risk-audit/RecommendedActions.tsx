import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TrendingUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActionItem {
  id: string;
  vessel_id: string;
  source: "risk" | "audit";
  action_text: string;
  priority: string;
  status: string;
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

      const riskActions: ActionItem[] = (risks || []).map((risk) => ({
        id: `risk-${risk.id}`,
        vessel_id: risk.vessel_id,
        source: "risk" as const,
        action_text: risk.recommended_action,
        priority: risk.severity,
        status: risk.status || "pending",
        created_at: risk.created_at,
      }));

      let allActions = [...riskActions];

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
    case "high":
      return "destructive";
    case "medium":
      return "default";
    default:
      return "secondary";
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
    default:
      return <XCircle className="h-4 w-4 text-orange-500" />;
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
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

                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(action.created_at).toLocaleDateString()}
                      </div>
                    </div>
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
