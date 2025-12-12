/**
import { useState } from "react";;
 * PATCH 394 - Complete Incident Workflow
 * Full lifecycle management: Report → Investigation → Resolution → Closure
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertOctagon, FileText, Search, CheckCircle, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

interface IncidentWorkflowProps {
  incident: unknown: unknown: unknown;
  onUpdate: () => void;
}

export const IncidentWorkflow: React.FC<IncidentWorkflowProps> = ({ incident, onUpdate }) => {
  const [status, setStatus] = useState(incident.status);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const statusFlow = [
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "under_analysis", label: "Under Analysis", color: "bg-blue-500" },
    { value: "resolved", label: "Resolved", color: "bg-green-500" },
    { value: "closed", label: "Closed", color: "bg-gray-500" },
  ];

  const updateIncidentStatus = async () => {
    try {
      const { error } = await supabase
        .from("incident_reports" as unknown)
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", incident.id);

      if (error) throw error;

      // Log workflow step (optional table)
      try {
        await supabase.from("incident_workflow_logs" as unknown).insert({
          incident_id: incident.id,
          action: `Status changed to ${status}`,
          notes,
          performed_at: new Date().toISOString(),
        });
      } catch (logError) {
      }

      toast({
        title: "Status Updated",
        description: `Incident status changed to ${status}`,
      });

      onUpdate();
    } catch (error) {
      console.error("Error updating incident:", error);
      console.error("Error updating incident:", error);
      toast({
        title: "Error",
        description: "Failed to update incident status",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${incident.id}-${Date.now()}.${fileExt}`;
      const filePath = `incident-evidence/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("incident-reports")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file reference to database (optional table)
      try {
        await supabase.from("incident_attachments" as unknown).insert({
          incident_id: incident.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          uploaded_at: new Date().toISOString(),
        });
      } catch (dbError) {
      }

      toast({
        title: "File Uploaded",
        description: "Evidence file uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload evidence file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text("Incident Report", 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Incident #: ${incident.incident_number}`, 14, 35);
      doc.text(`Title: ${incident.title}`, 14, 45);
      doc.text(`Severity: ${incident.severity}`, 14, 55);
      doc.text(`Status: ${incident.status}`, 14, 65);
      doc.text(`Date: ${new Date(incident.incident_date).toLocaleString()}`, 14, 75);
      
      doc.setFontSize(10);
      const description = doc.splitTextToSize(incident.description || "No description", 180);
      doc.text("Description:", 14, 90);
      doc.text(description, 14, 100);
      
      doc.save(`incident-${incident.incident_number}.pdf`);
      
      toast({
        title: "PDF Exported",
        description: "Incident report downloaded successfully",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5" />
            Incident Workflow
          </CardTitle>
          <CardDescription>Manage incident lifecycle and documentation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Flow Visualization */}
          <div className="flex items-center justify-between">
            {statusFlow.map((s, idx) => (
              <div key={s.value} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      status === s.value || statusFlow.findIndex((f) => f.value === status) > idx
                        ? s.color
                        : "bg-muted"
                    } text-white`}
                  >
                    {status === s.value ? (
                      <AlertOctagon className="h-5 w-5" />
                    ) : statusFlow.findIndex((f) => f.value === status) > idx ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-xs">{idx + 1}</span>
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center">{s.label}</span>
                </div>
                {idx < statusFlow.length - 1 && (
                  <div
                    className={`h-0.5 w-16 mx-2 ${
                      statusFlow.findIndex((f) => f.value === status) > idx
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Status Update */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Update Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusFlow.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add workflow notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={updateIncidentStatus} className="w-full">
              Update Incident Status
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <label className="flex-1">
              <Button
                variant="outline"
                className="w-full"
                disabled={uploading}
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Evidence"}
                </span>
              </Button>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </label>
            <Button variant="outline" onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
