import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Plus, Sparkles } from "lucide-react";
import { mlcInspectionService, MLCFinding } from "@/services/mlc-inspection.service";
import { useToast } from "@/hooks/use-toast";

interface ChecklistInterfaceProps {
  inspectionId: string;
  onUpdate: () => void;
}

const MLC_CHECKLIST_ITEMS = [
  { title: "Title 1", regulation: "1.1", category: "Minimum Age", description: "Is the minimum age requirement (16 years) met?" },
  { title: "Title 1", regulation: "1.2", category: "Medical Certification", description: "Are all seafarers medically fit with valid certificates?" },
  { title: "Title 1", regulation: "1.3", category: "Training and Qualifications", description: "Do seafarers have required training and qualifications?" },
  { title: "Title 2", regulation: "2.1", category: "Seafarers' Employment Agreements", description: "Are employment agreements properly documented and signed?" },
  { title: "Title 2", regulation: "2.2", category: "Wages", description: "Are wages paid in accordance with agreements?" },
  { title: "Title 2", regulation: "2.3", category: "Hours of Work/Rest", description: "Are hours of work and rest properly recorded and compliant?" },
  { title: "Title 3", regulation: "3.1", category: "Accommodation", description: "Does accommodation meet minimum standards?" },
  { title: "Title 3", regulation: "3.2", category: "Food and Catering", description: "Is food quality and catering adequate?" },
  { title: "Title 4", regulation: "4.1", category: "Medical Care On Board", description: "Are medical facilities and personnel adequate?" },
  { title: "Title 4", regulation: "4.2", category: "Shipowners' Liability", description: "Is insurance coverage for injury/death in place?" },
  { title: "Title 5", regulation: "5.1", category: "Flag State Compliance", description: "Does the vessel comply with flag state requirements?" },
];

export const ChecklistInterface = memo(function({ inspectionId, onUpdate }: ChecklistInterfaceProps) {
  const [findings, setFindings] = useState<MLCFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFindings();
  }, [inspectionId]);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const data = await mlcInspectionService.getFindings(inspectionId);
      setFindings(data);
    } catch (error) {
      console.error("Error loading findings:", error);
      toast({
        title: "Error",
        description: "Failed to load findings",
        variant: "destructive",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleAddFinding = async (item: typeof MLC_CHECKLIST_ITEMS[0], compliance: boolean, severity?: string, corrective_action?: string) => {
    try {
      await mlcInspectionService.createFinding({
        inspection_id: inspectionId,
        mlc_title: item.title,
        mlc_regulation: item.regulation,
        category: item.category,
        description: item.description,
        compliance,
        severity: severity as unknown,
        corrective_action,
        evidence_attached: false,
      };
      
      await loadFindings();
      onUpdate();
      
      toast({
        title: "Success",
        description: "Finding added successfully",
      };
    } catch (error) {
      console.error("Error adding finding:", error);
      toast({
        title: "Error",
        description: "Failed to add finding",
        variant: "destructive",
      };
    }
  };

  const getFindingForItem = (regulation: string) => {
    return findings.find(f => f.mlc_regulation === regulation);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>MLC 2006 Inspection Checklist</CardTitle>
          <CardDescription>
            Complete the checklist based on MLC 2006 requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {MLC_CHECKLIST_ITEMS.map((item, index) => {
            const existingFinding = getFindingForItem(item.regulation);
            const isExpanded = expandedItem === index;
            
            return (
              <Card key={index} className="border-l-4" style={{ borderLeftColor: existingFinding ? (existingFinding.compliance ? "#22c55e" : "#ef4444") : "#6b7280" }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.regulation}</Badge>
                        <CardTitle className="text-base">{item.category}</CardTitle>
                        {existingFinding && (
                          existingFinding.compliance ? 
                            <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <CardDescription className="mt-1">{item.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSetExpandedItem}
                    >
                      {isExpanded ? "Collapse" : "Inspect"}
                    </Button>
                  </div>
                </CardHeader>
                
                {isExpanded && !existingFinding && (
                  <CardContent className="pt-0 space-y-4">
                    <InspectionForm
                      item={item}
                      onSubmit={(compliance, severity, corrective_action) => {
                        handleAddFinding(item, compliance, severity, corrective_action);
                        setExpandedItem(null);
                      }}
                      onCancel={() => setExpandedItem(null}
                    />
                  </CardContent>
                )}

                {existingFinding && (
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      {!existingFinding.compliance && existingFinding.severity && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Severity:</span>
                          <Badge variant={existingFinding.severity === "critical" ? "destructive" : "secondary"}>
                            {existingFinding.severity}
                          </Badge>
                        </div>
                      )}
                      {existingFinding.corrective_action && (
                        <div>
                          <span className="font-medium">Corrective Action:</span>
                          <p className="text-muted-foreground mt-1">{existingFinding.corrective_action}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function InspectionForm({ item, onSubmit, onCancel }: {
  item: typeof MLC_CHECKLIST_ITEMS[0];
  onSubmit: (compliance: boolean, severity?: string, corrective_action?: string) => void;
  onCancel: () => void;
}) {
  const [compliance, setCompliance] = useState(true);
  const [severity, setSeverity] = useState<string>("minor");
  const [correctiveAction, setCorrectiveAction] = useState("");

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`compliance-${item.regulation}`}
          checked={compliance}
          onCheckedChange={(checked) => setCompliance(checked as boolean}
        />
        <Label htmlFor={`compliance-${item.regulation}`} className="text-sm font-medium">
          Item is compliant
        </Label>
      </div>

      {!compliance && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`severity-${item.regulation}`}>Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="observation">Observation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`action-${item.regulation}`}>Corrective Action Required</Label>
            <Textarea
              id={`action-${item.regulation}`}
              placeholder="Describe the corrective action needed..."
              value={correctiveAction}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => handleonSubmit}
        >
          Save Finding
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
