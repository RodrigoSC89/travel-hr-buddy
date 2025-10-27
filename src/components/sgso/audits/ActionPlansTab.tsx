import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CreateActionPlanDialog } from './CreateActionPlanDialog';

interface ActionPlansTabProps {
  selectedAuditId?: string;
  onRefresh: () => void;
}

export function ActionPlansTab({ selectedAuditId, onRefresh }: ActionPlansTabProps) {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadActions();
  }, [selectedAuditId]);

  const loadActions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('sgso_actions')
        .select(`
          *,
          responsible:profiles!responsible_user_id(full_name, email),
          audit:sgso_audits(audit_title)
        `)
        .order('created_at', { ascending: false });

      if (selectedAuditId) {
        query = query.eq('audit_id', selectedAuditId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Error loading actions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load action plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const handleActionCreated = () => {
    loadActions();
    onRefresh();
    setShowCreateDialog(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading action plans...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Action Plans</CardTitle>
              <CardDescription>
                {selectedAuditId
                  ? 'Action plans for selected audit'
                  : 'All action plans across audits'}
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Action Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {actions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No action plans found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsible</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">{action.title}</TableCell>
                      <TableCell className="capitalize">{action.action_type}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeColor(action.priority)}>
                          {action.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeColor(action.status)}>
                          {action.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {action.responsible?.full_name || action.responsible?.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {action.due_date ? format(new Date(action.due_date), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{action.audit?.audit_title || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateActionPlanDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleActionCreated}
        preSelectedAuditId={selectedAuditId}
      />
    </>
  );
}
