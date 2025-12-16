import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Ship,
  MapPin,
  Target,
} from "lucide-react";
import type {
  DPClass,
  IMCAAuditInput,
  IMCAAuditReport,
  OperationalData,
} from "@/types/imca-audit";
import {
  validateAuditInput,
  getRiskLevelColor,
  getPriorityColor,
  IMCA_STANDARDS,
} from "@/types/imca-audit";
import { generateIMCAAudit, saveAudit, downloadAuditMarkdown } from "@/services/imca-audit-service";

export function IMCAAuditGenerator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<IMCAAuditReport | null>(null);

  // Form state
  const [vesselName, setVesselName] = useState("");
  const [dpClass, setDpClass] = useState<DPClass | "">("");
  const [location, setLocation] = useState("");
  const [auditObjective, setAuditObjective] = useState("");
  const [operationalData, setOperationalData] = useState<OperationalData>({});

  const handleGenerate = async () => {
    const input: IMCAAuditInput = {
      vesselName,
      dpClass: dpClass as DPClass,
      location,
      auditObjective,
      operationalData: Object.keys(operationalData).length > 0 ? operationalData : undefined,
    };

    const validation = validateAuditInput(input);
    if (!validation.valid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generateIMCAAudit(input);
      setReport(result);
      
      // Save to database
      await saveAudit(result);
      
      setActiveTab("results");
      toast({
        title: "Audit Generated",
        description: "IMCA audit report generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate audit report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (report) {
      downloadAuditMarkdown(report);
      toast({
        title: "Export Complete",
        description: "Audit report downloaded as Markdown",
      });
    }
  };

  const handleReset = () => {
    setVesselName("");
    setDpClass("");
    setLocation("");
    setAuditObjective("");
    setOperationalData({});
    setReport(null);
    setActiveTab("basic");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-6 w-6" />
            IMCA DP Technical Audit Generator
          </CardTitle>
          <CardDescription>
            AI-powered audit system following IMCA, IMO, and MTS international standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Data</TabsTrigger>
              <TabsTrigger value="operational">Operational Data</TabsTrigger>
              <TabsTrigger value="results" disabled={!report}>
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vesselName">Vessel Name *</Label>
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="vesselName"
                      placeholder="e.g., DP Construction Vessel Delta"
                      value={vesselName}
                      onChange={(e) => setVesselName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dpClass">DP Class *</Label>
                  <Select value={dpClass} onValueChange={(value) => setDpClass(value as DPClass)}>
                    <SelectTrigger id="dpClass">
                      <SelectValue placeholder="Select DP Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DP1">DP1</SelectItem>
                      <SelectItem value="DP2">DP2</SelectItem>
                      <SelectItem value="DP3">DP3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="e.g., Santos Basin, Brazil"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="objective">Audit Objective *</Label>
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-muted-foreground mt-2" />
                    <Textarea
                      id="objective"
                      placeholder="e.g., Post-incident technical evaluation"
                      value={auditObjective}
                      onChange={(e) => setAuditObjective(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    * Required fields. Complete operational data tab for more detailed analysis.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="operational" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="incidentDetails">Incident Details (Optional)</Label>
                  <Textarea
                    id="incidentDetails"
                    placeholder="Describe any incidents or issues..."
                    value={operationalData.incidentDetails || ""}
                    onChange={(e) =>
                      setOperationalData({ ...operationalData, incidentDetails: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="environmental">Environmental Conditions (Optional)</Label>
                  <Textarea
                    id="environmental"
                    placeholder="Weather, sea state, visibility..."
                    value={operationalData.environmentalConditions || ""}
                    onChange={(e) =>
                      setOperationalData({
                        ...operationalData,
                        environmentalConditions: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="systemStatus">System Status (Optional)</Label>
                  <Textarea
                    id="systemStatus"
                    placeholder="Current status of DP systems..."
                    value={operationalData.systemStatus || ""}
                    onChange={(e) =>
                      setOperationalData({ ...operationalData, systemStatus: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="crew">Crew Qualifications (Optional)</Label>
                  <Textarea
                    id="crew"
                    placeholder="DPO certifications, training status..."
                    value={operationalData.crewQualifications || ""}
                    onChange={(e) =>
                      setOperationalData({
                        ...operationalData,
                        crewQualifications: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maintenance">Maintenance History (Optional)</Label>
                  <Textarea
                    id="maintenance"
                    placeholder="Recent maintenance activities..."
                    value={operationalData.maintenanceHistory || ""}
                    onChange={(e) =>
                      setOperationalData({
                        ...operationalData,
                        maintenanceHistory: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4 pt-4">
              {report && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{report.vesselName}</h3>
                      <p className="text-muted-foreground">
                        {report.dpClass} • {report.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {report.overallScore}/100
                      </div>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Standards Applied</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.standards.map((std) => (
                        <Badge key={std.code} variant="secondary">
                          {std.code}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Module Evaluations</h4>
                    <div className="space-y-3">
                      {report.moduleEvaluations.map((module, idx) => (
                        <Card key={idx}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{module.moduleName}</CardTitle>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{module.score}/100</span>
                                {module.complianceStatus === "Compliant" && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                                {module.complianceStatus !== "Compliant" && (
                                  <AlertCircle className="h-4 w-4 text-amber-600" />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <Badge variant={
                              module.complianceStatus === "Compliant"
                                ? "default"
                                : module.complianceStatus === "Partial"
                                  ? "secondary"
                                  : "destructive"
                            }>
                              {module.complianceStatus}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {report.nonConformities.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3">Non-Conformities</h4>
                        <div className="space-y-3">
                          {report.nonConformities.map((nc) => (
                            <Alert key={nc.id}>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">{nc.module}</span>
                                    <Badge
                                      className={getRiskLevelColor(nc.riskLevel)}
                                      variant="outline"
                                    >
                                      {nc.riskLevel}
                                    </Badge>
                                  </div>
                                  <p className="text-sm">{nc.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Standard: {nc.standard}
                                  </p>
                                </div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {report.actionPlan.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3">Action Plan</h4>
                        <div className="space-y-3">
                          {report.actionPlan.map((action) => (
                            <Card key={action.id}>
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className={getPriorityColor(action.priority)}>
                                        {action.priority}
                                      </Badge>
                                    </div>
                                    <p className="text-sm mb-2">{action.description}</p>
                                    <div className="text-xs text-muted-foreground">
                                      <p>Responsible: {action.responsibleParty}</p>
                                      <p>Deadline: {action.deadline.toLocaleDateString("pt-BR")}</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6">
            {activeTab !== "results" && (
              <Button onClick={handleGenerate} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Audit
                  </>
                )}
              </Button>
            )}
            {activeTab === "results" && report && (
              <>
                <Button onClick={handleExport} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export Markdown
                </Button>
                <Button onClick={handleReset} variant="secondary" className="flex-1">
                  New Audit
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
