import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ClipboardList, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  Ship
} from 'lucide-react';
import { useLsaFfa } from './useLsaFfa';
import type { 
  InspectionType, 
  InspectionFrequency, 
  ChecklistItem, 
  IssueFound,
  Vessel 
} from './types';

interface LSAFFAFormProps {
  vesselId: string;
  vessel?: Vessel;
  onSubmitSuccess?: () => void;
}

export const LSAFFAForm: React.FC<LSAFFAFormProps> = ({
  vesselId,
  vessel,
  onSubmitSuccess,
}) => {
  const { templates, loading, createInspection } = useLsaFfa(vesselId);
  
  const [formData, setFormData] = useState({
    inspector: '',
    type: 'LSA' as InspectionType,
    frequency: 'weekly' as InspectionFrequency,
  });
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [issues, setIssues] = useState<IssueFound[]>([]);
  const [newIssue, setNewIssue] = useState<Partial<IssueFound>>({
    equipment: '',
    description: '',
    severity: 'minor',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load template checklist when type or frequency changes
  useEffect(() => {
    const template = templates.find(
      t => t.type === formData.type && t.frequency === formData.frequency
    );
    
    if (template) {
      setChecklist(template.items.map(item => ({ ...item, checked: false })));
    } else {
      setChecklist([]);
    }
  }, [formData.type, formData.frequency, templates]);

  const handleChecklistItemToggle = (itemId: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleChecklistItemNote = (itemId: string, notes: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, notes } : item
      )
    );
  };

  const addIssue = () => {
    if (!newIssue.equipment || !newIssue.description) {
      setError('Please provide equipment name and description for the issue');
      return;
    }

    setIssues(prev => [...prev, newIssue as IssueFound]);
    setNewIssue({
      equipment: '',
      description: '',
      severity: 'minor',
    });
    setError(null);
  };

  const removeIssue = (index: number) => {
    setIssues(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.inspector) {
      setError('Inspector name is required');
      return;
    }

    if (checklist.length === 0) {
      setError('No checklist loaded. Please select type and frequency.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await createInspection({
        vessel_id: vesselId,
        inspector: formData.inspector,
        type: formData.type,
        frequency: formData.frequency,
        checklist,
        issues_found: issues,
      });

      if (result) {
        // Reset form
        setFormData({
          inspector: '',
          type: 'LSA',
          frequency: 'weekly',
        });
        setIssues([]);
        
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }
    } catch (err) {
      console.error('Error submitting inspection:', err);
      setError('Failed to submit inspection. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkedItems = checklist.filter(item => item.checked).length;
  const totalItems = checklist.length;
  const completionPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle>New LSA/FFA Inspection</CardTitle>
          </div>
          <CardDescription>
            Complete the inspection checklist based on SOLAS Chapter III requirements
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Vessel Info */}
          {vessel && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <Ship className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-semibold">{vessel.name}</div>
                <div className="text-sm text-muted-foreground">
                  IMO: {vessel.imo_number || 'N/A'} | Type: {vessel.vessel_type}
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inspector">Inspector Name *</Label>
              <Input
                id="inspector"
                value={formData.inspector}
                onChange={(e) => setFormData(prev => ({ ...prev, inspector: e.target.value }))}
                placeholder="Enter inspector name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Inspection Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as InspectionType }))}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LSA">LSA - Life Saving Appliances</SelectItem>
                  <SelectItem value="FFA">FFA - Fire Fighting Appliances</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as InspectionFrequency }))}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="ad_hoc">Ad-hoc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex items-center gap-2">
                <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                  {completionPercentage}% Complete
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {checkedItems} / {totalItems} items
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      {checklist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inspection Checklist</CardTitle>
            <CardDescription>
              Mark each item as completed and add notes if necessary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklist.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={item.id}
                    checked={item.checked || false}
                    onCheckedChange={() => handleChecklistItemToggle(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {item.item}
                      {item.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {item.checked && (
                      <div className="mt-2">
                        <Textarea
                          value={item.notes || ''}
                          onChange={(e) => handleChecklistItemNote(item.id, e.target.value)}
                          placeholder="Add notes (optional)"
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                  {item.checked && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Issues / Non-Conformities */}
      <Card>
        <CardHeader>
          <CardTitle>Issues & Non-Conformities</CardTitle>
          <CardDescription>
            Report any defects or non-compliant items found during inspection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {issues.map((issue, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="font-semibold">{issue.equipment}</div>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
                <Badge variant={
                  issue.severity === 'critical' ? 'destructive' :
                  issue.severity === 'major' ? 'default' : 'secondary'
                } className="mt-2">
                  {issue.severity}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIssue(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="space-y-3 p-4 border-2 border-dashed rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Equipment</Label>
                <Input
                  value={newIssue.equipment || ''}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, equipment: e.target.value }))}
                  placeholder="e.g., Lifeboat #1"
                />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={newIssue.severity || 'minor'}
                  onValueChange={(value) => setNewIssue(prev => ({ ...prev, severity: value as 'minor' | 'major' | 'critical' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newIssue.description || ''}
                onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue or defect"
                rows={3}
              />
            </div>
            <Button type="button" onClick={addIssue} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Issue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={submitting || loading}
          size="lg"
        >
          {submitting ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Inspection
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
