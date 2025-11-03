/**
 * Pre-PSC Form Component
 * Interactive checklist form for Port State Control self-assessments
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { prePSCService, PrePSCInspection, PrePSCChecklistItem } from "@/services/pre-psc.service";
import { getDefaultChecklistTemplate, calculateInspectionScore } from "@/lib/psc-score-calculator";
import { Loader2, Save, Send, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PrePSCFormProps {
  inspectionId?: string;
  onComplete?: (inspectionId: string) => void;
}

export default function PrePSCForm({ inspectionId, onComplete }: PrePSCFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vesselName, setVesselName] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [portCountry, setPortCountry] = useState("");
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [checklistItems, setChecklistItems] = useState<PrePSCChecklistItem[]>([]);
  const [currentInspectionId, setCurrentInspectionId] = useState<string | undefined>(inspectionId);
  const { toast } = useToast();

  useEffect(() => {
    if (currentInspectionId) {
      loadInspection();
    } else {
      initializeChecklist();
    }
  }, [currentInspectionId]);

  const initializeChecklist = () => {
    const template = getDefaultChecklistTemplate();
    setChecklistItems(template as PrePSCChecklistItem[]);
  };

  const loadInspection = async () => {
    if (!currentInspectionId) return;
    
    try {
      setLoading(true);
      const inspection = await prePSCService.getInspection(currentInspectionId);
      const items = await prePSCService.getChecklistItems(currentInspectionId);
      
      setInspectorName(inspection.inspector_name);
      setPortCountry(inspection.port_country || "");
      setInspectionDate(inspection.inspection_date?.split('T')[0] || "");
      setChecklistItems(items);
    } catch (error) {
      console.error("Error loading inspection:", error);
      toast({
        title: "Error",
        description: "Failed to load inspection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: keyof PrePSCChecklistItem, value: any) => {
    const updated = [...checklistItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-update conformity based on status
    if (field === 'status') {
      updated[index].conformity = value === 'compliant';
    }
    
    setChecklistItems(updated);
  };

  const handleSaveInspection = async (submit: boolean = false) => {
    if (!inspectorName.trim()) {
      toast({
        title: "Validation Error",
        description: "Inspector name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      let inspId = currentInspectionId;

      // Create inspection if it doesn't exist
      if (!inspId) {
        const inspection: PrePSCInspection = {
          inspector_name: inspectorName,
          port_country: portCountry,
          inspection_date: inspectionDate,
          status: submit ? 'submitted' : 'draft',
        };

        const created = await prePSCService.createInspection(inspection);
        inspId = created.id!;
        setCurrentInspectionId(inspId);
      } else {
        // Update existing inspection
        await prePSCService.updateInspection(inspId, {
          inspector_name: inspectorName,
          port_country: portCountry,
          inspection_date: inspectionDate,
          status: submit ? 'submitted' : 'in_progress',
        });
      }

      // Save or update checklist items
      const itemsWithInspectionId = checklistItems.map(item => ({
        ...item,
        inspection_id: inspId!,
      }));

      // If items have IDs, update them; otherwise create new
      const itemsToCreate = itemsWithInspectionId.filter(item => !item.id);
      const itemsToUpdate = itemsWithInspectionId.filter(item => item.id);

      if (itemsToCreate.length > 0) {
        await prePSCService.createChecklistItems(itemsToCreate);
      }

      for (const item of itemsToUpdate) {
        if (item.id) {
          await prePSCService.updateChecklistItem(item.id, item);
        }
      }

      // Calculate and update score
      await prePSCService.calculateInspectionScore(inspId);

      toast({
        title: "Success",
        description: submit 
          ? "Inspection submitted successfully" 
          : "Inspection saved successfully",
      });

      if (submit && onComplete) {
        onComplete(inspId);
      }
    } catch (error) {
      console.error("Error saving inspection:", error);
      toast({
        title: "Error",
        description: "Failed to save inspection",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCompletionProgress = () => {
    const answered = checklistItems.filter(
      item => item.status && item.status !== 'pending'
    ).length;
    return Math.round((answered / checklistItems.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'non_compliant':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'requires_action':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'not_applicable':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4" />;
      case 'non_compliant':
        return <XCircle className="h-4 w-4" />;
      case 'requires_action':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Group items by category
  const groupedItems = checklistItems.reduce((acc, item, index) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ item, index });
    return acc;
  }, {} as Record<string, Array<{ item: PrePSCChecklistItem; index: number }>>);

  const progress = getCompletionProgress();

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-PSC Inspection Form</CardTitle>
          <CardDescription>
            Complete the checklist based on IMO Resolution A.1185(33) and DNV PSC Quick Guide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inspectorName">Inspector Name *</Label>
              <Input
                id="inspectorName"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Enter inspector name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portCountry">Port/Country</Label>
              <Input
                id="portCountry"
                value={portCountry}
                onChange={(e) => setPortCountry(e.target.value)}
                placeholder="e.g., Singapore"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspectionDate">Inspection Date</Label>
              <Input
                id="inspectionDate"
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items by Category */}
      {Object.entries(groupedItems).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
            <CardDescription>
              {items.length} item(s) - {items.filter(({ item }) => item.status === 'compliant').length} compliant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map(({ item, index }) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.question}</p>
                    {item.reference_regulation && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Reference: {item.reference_regulation}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(item.status || 'pending')}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(item.status || 'pending')}
                      {item.status || 'Pending'}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={item.status || 'pending'}
                      onValueChange={(value) => handleItemChange(index, 'status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="compliant">Compliant</SelectItem>
                        <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                        <SelectItem value="requires_action">Requires Action</SelectItem>
                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {item.status === 'non_compliant' || item.status === 'requires_action' ? (
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={item.action_priority || 'medium'}
                        onValueChange={(value) => handleItemChange(index, 'action_priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label>Inspector Comments</Label>
                  <Textarea
                    value={item.inspector_comments || ""}
                    onChange={(e) => handleItemChange(index, 'inspector_comments', e.target.value)}
                    placeholder="Add notes, observations, or corrective actions..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => handleSaveInspection(false)}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
            <Button
              onClick={() => handleSaveInspection(true)}
              disabled={saving || progress < 100}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Inspection
                </>
              )}
            </Button>
          </div>
          {progress < 100 && (
            <p className="text-sm text-muted-foreground mt-2 text-right">
              Complete all items to submit the inspection
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
