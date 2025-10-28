// @ts-nocheck
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AuditSubmissionFormProps {
  open: boolean;
  onClose: () => void;
}

export function AuditSubmissionForm({ open, onClose }: AuditSubmissionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    audit_type: "internal",
    audit_scope: "",
    audit_date: new Date().toISOString().split("T")[0],
    status: "planned",
    auditors: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate audit number
      const auditNumber = `AUD-${Date.now().toString().slice(-8)}`;

      // Parse auditors
      const auditorsArray = formData.auditors
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0)
        .map(name => ({ name, role: "auditor" }));

      const { error } = await supabase
        .from("sgso_audits")
        .insert({
          audit_number: auditNumber,
          audit_type: formData.audit_type,
          audit_scope: formData.audit_scope,
          audit_date: formData.audit_date,
          status: formData.status,
          auditors: auditorsArray,
          findings: [],
          non_conformities: [],
          observations: [],
          recommendations: []
        });

      if (error) throw error;

      // Log in audit_logs
      await supabase.from("audit_logs").insert({
        action: "audit_created",
        entity_type: "sgso_audit",
        entity_id: auditNumber,
        details: { audit_type: formData.audit_type, scope: formData.audit_scope },
        user_id: user.id
      });

      toast({
        title: "Audit Created",
        description: `Audit ${auditNumber} has been successfully created.`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit New Audit</DialogTitle>
          <DialogDescription>
            Create a new SGSO audit submission for review and approval
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="audit_type">Audit Type</Label>
            <Select 
              value={formData.audit_type}
              onValueChange={(value) => setFormData({...formData, audit_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="anp">ANP</SelectItem>
                <SelectItem value="antaq">ANTAQ</SelectItem>
                <SelectItem value="classification_society">Classification Society</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="audit_scope">Audit Scope *</Label>
            <Textarea
              id="audit_scope"
              value={formData.audit_scope}
              onChange={(e) => setFormData({...formData, audit_scope: e.target.value})}
              placeholder="Describe the scope of this audit..."
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="audit_date">Audit Date</Label>
            <Input
              id="audit_date"
              type="date"
              value={formData.audit_date}
              onChange={(e) => setFormData({...formData, audit_date: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="auditors">Auditors (comma-separated)</Label>
            <Input
              id="auditors"
              value={formData.auditors}
              onChange={(e) => setFormData({...formData, auditors: e.target.value})}
              placeholder="John Doe, Jane Smith, ..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any additional information..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Audit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
