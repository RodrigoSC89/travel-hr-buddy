import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2pdf from "html2pdf.js";
import {
  AuditSimulation,
  AUDIT_TYPE_OPTIONS,
  getSeverityColor,
  formatAuditType,
} from "@/types/external-audit";

export function AuditSimulator() {
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedAuditType, setSelectedAuditType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditSimulation | null>(null);
  const { toast } = useToast();

  const [vessels, setVessels] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch vessels on component mount
  useEffect(() => {
    const fetchVessels = async () => {
      const { data, error } = await supabase.from("vessels").select("id, name").order("name");
      if (!error && data) {
        setVessels(data);
      }
    };
    fetchVessels();
  }, []);

  const handleRunSimulation = async () => {
    if (!selectedVessel || !selectedAuditType) {
      toast({
        title: "Missing Information",
        description: "Please select both a vessel and audit type",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("audit-simulate", {
        body: {
          vesselId: selectedVessel,
          auditType: selectedAuditType,
        },
      });

      if (error) throw error;

      setAuditResult(data.data);
      toast({
        title: "Audit Simulation Complete",
        description: "AI-powered audit simulation completed successfully",
      });
    } catch (error) {
      console.error("Error running audit simulation:", error);
      toast({
        title: "Simulation Failed",
        description: error instanceof Error ? error.message : "Failed to run audit simulation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
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

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Audit Simulation</CardTitle>
          <CardDescription>
            Generate comprehensive audit reports in seconds using GPT-4 analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Vessel</label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose vessel..." />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Audit Type</label>
              <Select value={selectedAuditType} onValueChange={setSelectedAuditType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose audit type..." />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleRunSimulation}
            disabled={isLoading || !selectedVessel || !selectedAuditType}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running AI Simulation...
              </>
            ) : (
              "Run Audit Simulation"
            )}
          </Button>
        </CardContent>
      </Card>

      {auditResult && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Audit Report</CardTitle>
              <CardDescription>
                {formatAuditType(auditResult.audit_type)} - Score: {auditResult.overall_score}/100
              </CardDescription>
            </div>
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div id="audit-report" className="space-y-6">
              {/* Overall Score */}
              <div className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-center">
                  <div className="text-5xl font-bold text-indigo-600">
                    {auditResult.overall_score}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
                </div>
              </div>

              {/* Conformities */}
              {auditResult.conformities && auditResult.conformities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                    Conformities ({auditResult.conformities.length})
                  </h3>
                  <div className="space-y-2">
                    {auditResult.conformities.map((item, index) => (
                      <Card key={index} className="border-green-200 bg-green-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              {item.clause}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm">{item.description}</p>
                              {item.evidence && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Evidence: {item.evidence}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Non-Conformities */}
              {auditResult.non_conformities && auditResult.non_conformities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
                    Non-Conformities ({auditResult.non_conformities.length})
                  </h3>
                  <div className="space-y-2">
                    {auditResult.non_conformities.map((item, index) => (
                      <Card key={index} className="border-red-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <Badge
                              variant="outline"
                              className={getSeverityColor(item.severity)}
                            >
                              {item.clause}
                            </Badge>
                            <div className="flex-1 space-y-1">
                              <Badge className={getSeverityColor(item.severity)}>
                                {item.severity.toUpperCase()}
                              </Badge>
                              <p className="text-sm">{item.description}</p>
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

              {/* Technical Report */}
              {auditResult.technical_report && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Technical Report</h3>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm whitespace-pre-wrap">{auditResult.technical_report}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Plan */}
              {auditResult.action_plan && auditResult.action_plan.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Action Plan</h3>
                  <div className="space-y-2">
                    {auditResult.action_plan
                      .sort((a, b) => a.priority - b.priority)
                      .map((action, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="shrink-0">
                                P{action.priority}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{action.item}</p>
                                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                  <span>Deadline: {action.deadline}</span>
                                  {action.responsible && (
                                    <span>Responsible: {action.responsible}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
