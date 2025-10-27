import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateAuditDialog({ open, onOpenChange, onSuccess }: CreateAuditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    audit_title: '',
    audit_description: '',
    audit_type: 'internal',
    risk_level: 'medium',
    criticality: 'medium',
    vessel_id: '',
    auditor_id: '',
    scheduled_date: '',
    status: 'pending',
  });

  useEffect(() => {
    if (open) {
      loadUsers();
      loadVessels();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadVessels = async () => {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setVessels(data || []);
    } catch (error) {
      console.error('Error loading vessels:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      const auditData = {
        ...formData,
        organization_id: profile?.organization_id,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('sgso_audits')
        .insert([auditData])
        .select()
        .single();

      if (error) throw error;

      await supabase.from('access_logs').insert([{
        user_id: user.id,
        action: 'create_sgso_audit',
        resource_type: 'sgso_audit',
        resource_id: data.id,
        details: { audit_title: formData.audit_title }
      }]);

      toast({
        title: 'Success',
        description: 'Audit created successfully',
      });

      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error('Error creating audit:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create audit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      audit_title: '',
      audit_description: '',
      audit_type: 'internal',
      risk_level: 'medium',
      criticality: 'medium',
      vessel_id: '',
      auditor_id: '',
      scheduled_date: '',
      status: 'pending',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Audit</DialogTitle>
          <DialogDescription>
            Create a new SGSO audit with risk assessment and responsible assignments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audit_title">Audit Title *</Label>
            <Input
              id="audit_title"
              value={formData.audit_title}
              onChange={(e) => setFormData({ ...formData, audit_title: e.target.value })}
              required
              placeholder="Enter audit title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit_description">Description</Label>
            <Textarea
              id="audit_description"
              value={formData.audit_description}
              onChange={(e) => setFormData({ ...formData, audit_description: e.target.value })}
              placeholder="Enter audit description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audit_type">Audit Type</Label>
              <Select
                value={formData.audit_type}
                onValueChange={(value) => setFormData({ ...formData, audit_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="risk_level">Risk Level</Label>
              <Select
                value={formData.risk_level}
                onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="negligible">Negligible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticality">Criticality</Label>
              <Select
                value={formData.criticality}
                onValueChange={(value) => setFormData({ ...formData, criticality: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vessel_id">Vessel</Label>
              <Select
                value={formData.vessel_id}
                onValueChange={(value) => setFormData({ ...formData, vessel_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vessel" />
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
              <Label htmlFor="auditor_id">Auditor</Label>
              <Select
                value={formData.auditor_id}
                onValueChange={(value) => setFormData({ ...formData, auditor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select auditor" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Scheduled Date</Label>
            <Input
              id="scheduled_date"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Audit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
