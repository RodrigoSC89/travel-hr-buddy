/**
 * LSA & FFA Inspection Form Component
 * Main form for creating and editing inspections
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Save,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import type {
  LSAFFAInspection,
  InspectionType,
  ChecklistItem,
  InspectionIssue,
  ChecklistItemStatus,
  IssueSeverity,
  LSA_CATEGORIES,
  FFA_CATEGORIES,
} from "@/types/lsa-ffa";
import { calculateInspectionScore } from "@/lib/scoreCalculator";
import { LSAFFAInsightAI } from "./LSAFFAInsightAI";
import { downloadInspectionReport } from "./ReportGenerator";

const LSA_CATEGORIES_CONST = [
  "Lifeboats",
  "Life Rafts",
  "Rescue Boats",
  "Life Jackets",
  "Immersion Suits",
  "Thermal Protective Aids",
  "Visual Signals",
  "Sound Signals",
  "Line-Throwing Appliances",
  "EPIRB",
  "SART",
  "Lifeboat Equipment",
  "Davits and Launching",
] as const;

const FFA_CATEGORIES_CONST = [
  "Portable Fire Extinguishers",
  "Fixed Fire Extinguishers",
  "Fire Hoses and Nozzles",
  "Fire Pumps",
  "Fire Main System",
  "Sprinkler Systems",
  "Fire Detection Systems",
  "Fire Alarm Systems",
  "Emergency Fire Pumps",
  "Fixed Gas Systems",
  "Fixed Foam Systems",
  "Fire Doors and Dampers",
  "Firemen's Outfits",
  "Breathing Apparatus",
  "EEBD",
] as const;

interface LSAFFAFormProps {
  inspection?: LSAFFAInspection;
  vesselId: string;
  vesselName: string;
  onSave: (inspection: Partial<LSAFFAInspection>) => Promise<void>;
  onCancel?: () => void;
}

export function LSAFFAForm({ inspection, vesselId, vesselName, onSave, onCancel }: LSAFFAFormProps) {
  const [inspectionType, setInspectionType] = useState<InspectionType>(inspection?.type || "LSA");
  const [inspector, setInspector] = useState(inspection?.inspector || "");
  const [date, setDate] = useState(inspection?.date || new Date().toISOString().split("T")[0]);
  const [checklist, setChecklist] = useState<Record<string, ChecklistItem>>(
    inspection?.checklist || {}
  );
  const [issues, setIssues] = useState<InspectionIssue[]>(inspection?.issues_found || []);
  const [aiNotes, setAiNotes] = useState(inspection?.ai_notes || "");
  const [saving, setSaving] = useState(false);
  const [signatureRef, setSignatureRef] = useState<SignatureCanvas | null>(null);
  const [activeTab, setActiveTab] = useState("checklist");

  const categories = inspectionType === "LSA" ? LSA_CATEGORIES_CONST : FFA_CATEGORIES_CONST;

  // Initialize checklist if empty
  useEffect(() => {
    if (Object.keys(checklist).length === 0) {
      const initialChecklist: Record<string, ChecklistItem> = {};
      categories.forEach((category, idx) => {
        const id = `item-${idx}`;
        initialChecklist[id] = {
          id,
          category,
          item: `Inspect ${category}`,
          status: "pending",
          notes: "",
          evidence: [],
        };
      });
      setChecklist(initialChecklist);
    }
  }, [inspectionType]);

  const updateChecklistItem = (
    id: string,
    updates: Partial<ChecklistItem>
  ) => {
    setChecklist((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  const addIssue = () => {
    const newIssue: InspectionIssue = {
      id: `issue-${Date.now()}`,
      category: categories[0],
      description: "",
      severity: "minor",
      resolved: false,
    };
    setIssues((prev) => [...prev, newIssue]);
  };

  const updateIssue = (id: string, updates: Partial<InspectionIssue>) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, ...updates } : issue))
    );
  };

  const deleteIssue = (id: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
  };

  const handleSave = async () => {
    if (!inspector.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter inspector name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const scoreData = calculateInspectionScore(checklist, issues);

      const inspectionData: Partial<LSAFFAInspection> = {
        vessel_id: vesselId,
        inspector: inspector.trim(),
        date,
        type: inspectionType,
        checklist,
        issues_found: issues,
        score: scoreData.overallScore,
        ai_notes: aiNotes,
      };

      // Add signature if present
      if (signatureRef && !signatureRef.isEmpty()) {
        inspectionData.signature_data = signatureRef.toDataURL();
      }

      await onSave(inspectionData);
    } catch (error) {
      console.error("Failed to save inspection:", error);
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save inspection",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!inspection) {
      toast({
        title: "Export Error",
        description: "Please save the inspection first",
        variant: "destructive",
      });
      return;
    }

    try {
      await downloadInspectionReport(inspection, vesselName);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast({
        title: "Export Error",
        description: "Failed to export PDF report",
        variant: "destructive",
      });
    }
  };

  const scoreData = calculateInspectionScore(checklist, issues);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>
            {inspection ? "Edit" : "New"} {inspectionType} Inspection
          </CardTitle>
          <CardDescription>Vessel: {vesselName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Inspection Type</Label>
              <Select
                value={inspectionType}
                onValueChange={(value) => setInspectionType(value as InspectionType)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LSA">LSA - Life-Saving Appliances</SelectItem>
                  <SelectItem value="FFA">FFA - Fire-Fighting Appliances</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspector">Inspector Name</Label>
              <Input
                id="inspector"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                placeholder="Enter inspector name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Inspection Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Score Display */}
          <Alert className={scoreData.overallScore >= 75 ? "border-green-500" : "border-orange-500"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {scoreData.overallScore >= 75 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                )}
                <span className="font-semibold">
                  Compliance Score: {scoreData.overallScore}%
                </span>
              </div>
              <Badge variant={scoreData.overallScore >= 75 ? "default" : "destructive"}>
                {scoreData.complianceLevel.toUpperCase()}
              </Badge>
            </div>
            <AlertDescription className="mt-2">
              {scoreData.recommendation}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="issues">Issues ({issues.length})</TabsTrigger>
          <TabsTrigger value="ai">AI Insights</TabsTrigger>
          <TabsTrigger value="signature">Signature</TabsTrigger>
        </TabsList>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Checklist</CardTitle>
              <CardDescription>
                Check each item according to SOLAS requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(checklist).map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{item.category}</h4>
                      <Badge variant={item.status === "pass" ? "default" : "secondary"}>
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <Input
                      value={item.item}
                      onChange={(e) =>
                        updateChecklistItem(item.id, { item: e.target.value })
                      }
                      placeholder="Item description"
                    />

                    <RadioGroup
                      value={item.status}
                      onValueChange={(value) =>
                        updateChecklistItem(item.id, { status: value as ChecklistItemStatus })
                      }
                    >
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pass" id={`${item.id}-pass`} />
                          <Label htmlFor={`${item.id}-pass`}>Pass</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fail" id={`${item.id}-fail`} />
                          <Label htmlFor={`${item.id}-fail`}>Fail</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="na" id={`${item.id}-na`} />
                          <Label htmlFor={`${item.id}-na`}>N/A</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pending" id={`${item.id}-pending`} />
                          <Label htmlFor={`${item.id}-pending`}>Pending</Label>
                        </div>
                      </div>
                    </RadioGroup>

                    <Textarea
                      value={item.notes || ""}
                      onChange={(e) =>
                        updateChecklistItem(item.id, { notes: e.target.value })
                      }
                      placeholder="Notes (optional)"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Issues Found</CardTitle>
                  <CardDescription>
                    Document any deficiencies or non-compliance
                  </CardDescription>
                </div>
                <Button onClick={addIssue} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Issue
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No issues found. Click "Add Issue" to document any deficiencies.
                    </AlertDescription>
                  </Alert>
                ) : (
                  issues.map((issue) => (
                    <div key={issue.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Select
                          value={issue.category}
                          onValueChange={(value) =>
                            updateIssue(issue.id, { category: value })
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                          <Select
                            value={issue.severity}
                            onValueChange={(value) =>
                              updateIssue(issue.id, { severity: value as IssueSeverity })
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="major">Major</SelectItem>
                              <SelectItem value="minor">Minor</SelectItem>
                              <SelectItem value="observation">Observation</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteIssue(issue.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      <Textarea
                        value={issue.description}
                        onChange={(e) =>
                          updateIssue(issue.id, { description: e.target.value })
                        }
                        placeholder="Describe the issue..."
                        rows={2}
                      />

                      <Textarea
                        value={issue.correctiveAction || ""}
                        onChange={(e) =>
                          updateIssue(issue.id, { correctiveAction: e.target.value })
                        }
                        placeholder="Corrective action required..."
                        rows={2}
                      />

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`resolved-${issue.id}`}
                          checked={issue.resolved}
                          onCheckedChange={(checked) =>
                            updateIssue(issue.id, { resolved: !!checked })
                          }
                        />
                        <Label htmlFor={`resolved-${issue.id}`}>Mark as resolved</Label>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai">
          {inspection ? (
            <LSAFFAInsightAI
              inspection={inspection}
              onInsightGenerated={(insight) => {
                setAiNotes(
                  `${insight.summary}\n\nRecommendations:\n${insight.recommendations.join("\n")}\n\nRisk Assessment:\n${insight.riskAssessment}`
                );
              }}
            />
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please save the inspection first to generate AI insights.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Signature Tab */}
        <TabsContent value="signature">
          <Card>
            <CardHeader>
              <CardTitle>Inspector Signature</CardTitle>
              <CardDescription>
                Sign to validate the inspection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-4">
                <SignatureCanvas
                  ref={(ref) => setSignatureRef(ref)}
                  canvasProps={{
                    className: "w-full h-48 border rounded",
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => signatureRef?.clear()}
                  size="sm"
                >
                  Clear Signature
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {inspection && (
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Inspection
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
