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

interface CreateActionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedAuditId?: string;
}

export function CreateActionPlanDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  preSelectedAuditId 
}: CreateActionPlanDialogProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    action_type: 'corrective',
    priority: 'medium',
    status: 'pending',
    audit_id: preSelectedAuditId || '',
    responsible_user_id: '',
    due_date: '',
  });

  useEffect(() => {
    if (open) {
      loadUsers();
      loadAudits();
      if (preSelectedAuditId) {
        setFormData(prev => ({ ...prev, audit_id: preSelectedAuditId }));
      }
    }
  }, [open, preSelectedAuditId]);

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

  const loadAudits = async () => {
    try {
      const { data, error } = await supabase
        .from('sgso_audits')
        .select('id, audit_title')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error('Error loading audits:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sgso_actions')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.from('access_logs').insert([{
        user_id: user.id,
        action: 'create_sgso_action',
        resource_type: 'sgso_action',
        resource_id: data.id,
        details: { title: formData.title }
      }]);

      toast({
        title: 'Success',
        description: 'Action plan created successfully',
      });

      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error('Error creating action plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create action plan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      action_type: 'corrective',
      priority: 'medium',
      status: 'pending',
      audit_id: preSelectedAuditId || '',
      responsible_user_id: '',
      due_date: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Action Plan</DialogTitle>
          <DialogDescription>
            Create a new action plan with responsible person and deadline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter action plan title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter action plan description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action_type">Action Type</Label>
              <Select
                value={formData.action_type}
                onValueChange={(value) => setFormData({ ...formData, action_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
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

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit_id">Related Audit</Label>
            <Select
              value={formData.audit_id}
              onValueChange={(value) => setFormData({ ...formData, audit_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select audit" />
              </SelectTrigger>
              <SelectContent>
                {audits.map((audit) => (
                  <SelectItem key={audit.id} value={audit.id}>
                    {audit.audit_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible_user_id">Responsible Person *</Label>
            <Select
              value={formData.responsible_user_id}
              onValueChange={(value) => setFormData({ ...formData, responsible_user_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select responsible person" />
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Action Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
