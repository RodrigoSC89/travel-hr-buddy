// ETAPA 32.1: AI-Powered Audit Simulation Component
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText, Download, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AuditType, AuditSimulation, AuditSimulationResponse } from "@/types/external-audit";
import html2pdf from "html2pdf.js";

interface AuditSimulatorProps {
  vesselId: string;
}

const AUDIT_TYPES: { value: AuditType; label: string }[] = [
  { value: "Petrobras-PEO-DP", label: "Petrobras (PEO-DP)" },
  { value: "IBAMA-SGSO", label: "IBAMA (SGSO)" },
  { value: "IMO-ISM", label: "IMO (ISM Code)" },
  { value: "IMO-MODU", label: "IMO (MODU Code)" },
  { value: "ISO-9001", label: "ISO 9001 (Quality)" },
  { value: "ISO-14001", label: "ISO 14001 (Environment)" },
  { value: "ISO-45001", label: "ISO 45001 (Safety)" },
  { value: "IMCA", label: "IMCA (M220)" },
];

export const AuditSimulator: React.FC<AuditSimulatorProps> = ({ vesselId }) => {
  const [selectedAuditType, setSelectedAuditType] = useState<AuditType | "">("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditSimulationResponse | null>(null);
  const [recentAudits, setRecentAudits] = useState<AuditSimulation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load recent audits
  React.useEffect(() => {
    loadRecentAudits();
  }, [vesselId]);

  const loadRecentAudits = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("audit_simulations")
        .select("*")
        .eq("vessel_id", vesselId)
        .order("audit_date", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentAudits(data || []);
    } catch (error) {
      console.error("Error loading audit history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const runAuditSimulation = async () => {
    if (!selectedAuditType) {
      toast.error("Please select an audit type");
      return;
    }

    setIsSimulating(true);
    setAuditResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("audit-simulate", {
        body: {
          vesselId,
          auditType: selectedAuditType,
        },
      });

      if (error) throw error;

      setAuditResult(data as AuditSimulationResponse);
      toast.success("Audit simulation completed successfully");
      loadRecentAudits(); // Refresh history
    } catch (error) {
      console.error("Error running audit simulation:", error);
      toast.error("Failed to run audit simulation");
    } finally {
      setIsSimulating(false);
    }
  };

  const exportToPDF = async () => {
    if (!auditResult) return;

    const element = document.getElementById("audit-report");
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `audit-${selectedAuditType}-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().set(opt).from(element).save();
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "major":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "minor":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "major":
        return "default";
      case "minor":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Control */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Audit Simulation</CardTitle>
          <CardDescription>
            Simulate technical audits from major certification bodies using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedAuditType} onValueChange={(value) => setSelectedAuditType(value as AuditType)}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select audit type" />
              </SelectTrigger>
              <SelectContent>
                {AUDIT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={runAuditSimulation} disabled={isSimulating || !selectedAuditType}>
              {isSimulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              ⏱️ Audit simulations typically complete in 30-45 seconds. The AI will analyze vessel data and generate
              a comprehensive audit report with conformities, non-conformities, scores, and action plans.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Audit Results */}
      {auditResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Audit Report</CardTitle>
                <CardDescription>{selectedAuditType} Simulation Results</CardDescription>
              </div>
              <Button onClick={exportToPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="audit-report" className="space-y-6">
              {/* Scores Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Scores by Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(auditResult.result.scoresByNorm).map(([norm, score]) => (
                    <Card key={norm}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{score}</div>
                          <div className="text-sm text-muted-foreground">{norm}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Technical Report */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Technical Report</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {auditResult.result.technicalReport}
                </p>
              </div>

              {/* Conformities */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Conformities ({auditResult.result.conformities.length})
                </h3>
                <div className="space-y-2">
                  {auditResult.result.conformities.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="shrink-0">
                            {item.clause}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm">{item.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Non-Conformities */}
              {auditResult.result.nonConformities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Non-Conformities ({auditResult.result.nonConformities.length})
                  </h3>
                  <div className="space-y-2">
                    {auditResult.result.nonConformities.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="shrink-0">
                                {item.clause}
                              </Badge>
                              <div className="flex items-center gap-2">
                                {getSeverityIcon(item.severity)}
                                <Badge variant={getSeverityColor(item.severity) as any}>
                                  {item.severity.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm">{item.description}</p>
                            <div className="pl-4 border-l-2 border-blue-500">
                              <p className="text-sm text-muted-foreground">
                                <strong>Recommendation:</strong> {item.recommendation}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Plan */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Prioritized Action Plan</h3>
                <div className="space-y-2">
                  {auditResult.result.actionPlan
                    .sort((a, b) => a.priority - b.priority)
                    .map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline">P{item.priority}</Badge>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{item.action}</p>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>Deadline: {item.deadline}</span>
                                <span>Responsible: {item.responsible}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Audits History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audit History</CardTitle>
          <CardDescription>Previous audit simulations for this vessel</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : recentAudits.length > 0 ? (
            <div className="space-y-2">
              {recentAudits.map((audit) => (
                <Card key={audit.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{audit.audit_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(audit.audit_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={audit.status === "completed" ? "default" : "secondary"}>
                          {audit.status}
                        </Badge>
                        {audit.scores_by_norm && (
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {Math.round(
                                Object.values(audit.scores_by_norm as Record<string, number>).reduce(
                                  (a, b) => a + b,
                                  0
                                ) / Object.values(audit.scores_by_norm as Record<string, number>).length
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">Avg Score</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No audit history available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
