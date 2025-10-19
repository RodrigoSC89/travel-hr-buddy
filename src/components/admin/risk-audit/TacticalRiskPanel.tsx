import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw, User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TacticalRisk {
  id: string;
  vessel_id: string;
  risk_type: string;
  risk_title: string;
  risk_description: string;
  severity: string;
  probability: string;
  impact_score: number;
  forecast_date: string;
  status: string;
  assigned_to: string | null;
  recommended_action: string;
  confidence_score: number;
  predicted_by: string;
  created_at: string;
}

export function TacticalRiskPanel() {
  const [risks, setRisks] = useState<TacticalRisk[]>([]);
  const [loading, setLoading] = useState(false);
  const [forecasting, setForecasting] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [vessels, setVessels] = useState<any[]>([]);

  useEffect(() => {
    loadVessels();
    loadRisks();
  }, [selectedVessel]);

  const loadVessels = async () => {
    const { data } = await supabase
      .from("vessels")
      .select("id, name")
      .eq("status", "active")
      .order("name");
    
    if (data) setVessels(data);
  };

  const loadRisks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("tactical_risks")
        .select("*")
        .gte("forecast_date", new Date().toISOString().split("T")[0])
        .order("forecast_date", { ascending: true })
        .order("severity", { ascending: false });

      if (selectedVessel && selectedVessel !== "all") {
        query = query.eq("vessel_id", selectedVessel);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRisks(data || []);
    } catch (error: unknown) {
      console.error("Error loading risks:", error);
      toast.error("Failed to load tactical risks");
    } finally {
      setLoading(false);
    }
  };

  const runForecast = async () => {
    setForecasting(true);
    try {
      const body = selectedVessel === "all"
        ? { process_all: true }
        : { vessel_id: selectedVessel };

      const response = await fetch("/api/ai/forecast-risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Forecast failed");

      const result = await response.json();
      toast.success(
        `Generated ${result.risks_generated} risks for ${result.vessels_processed} vessel(s)`
      );
      loadRisks();
    } catch (error) {
      console.error("Forecast error:", error);
      toast.error("Failed to run risk forecast");
    } finally {
      setForecasting(false);
    }
  };

  const updateRiskStatus = async (riskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tactical_risks")
        .update({ status: newStatus })
        .eq("id", riskId);

      if (error) throw error;
      toast.success("Risk status updated");
      loadRisks();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update risk status");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "destructive";
    case "high": return "destructive";
    case "medium": return "default";
    case "low": return "secondary";
    default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "pending": return "destructive";
    case "assigned": return "default";
    case "in_progress": return "default";
    case "mitigated": return "secondary";
    case "closed": return "outline";
    default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Tactical Risk Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="vessel">Vessel</Label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger id="vessel">
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

            <Button
              onClick={runForecast}
              disabled={forecasting}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${forecasting ? "animate-spin" : ""}`} />
              {forecasting ? "Forecasting..." : "Run AI Forecast"}
            </Button>

            <Button onClick={loadRisks} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risks Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Forecasted Risks ({risks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading risks...
            </div>
          ) : risks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tactical risks found. Run AI forecast to generate predictions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vessel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.map((risk) => (
                    <TableRow key={risk.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(risk.forecast_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {risk.vessel_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{risk.risk_type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-medium">{risk.risk_title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {risk.risk_description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{risk.probability}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {risk.impact_score}/10
                      </TableCell>
                      <TableCell>
                        <Select
                          value={risk.status}
                          onValueChange={(val) => updateRiskStatus(risk.id, val)}
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
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {(risk.confidence_score * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground max-w-xs truncate">
                          {risk.recommended_action}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
