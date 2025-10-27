import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Eye, Edit, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface AuditsListProps {
  onSelectAudit: (audit: any) => void;
  onRefresh: () => void;
}

export function AuditsList({ onSelectAudit, onRefresh }: AuditsListProps) {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sgso_audits')
        .select(`
          *,
          auditor:profiles!auditor_id(full_name, email),
          vessel:vessels(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error('Error loading audits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audit?')) return;

    try {
      const { error } = await supabase
        .from('sgso_audits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Audit deleted successfully',
      });

      loadAudits();
      onRefresh();
    } catch (error) {
      console.error('Error deleting audit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete audit',
        variant: 'destructive',
      });
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
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

  if (loading) {
    return <div className="text-center py-8">Loading audits...</div>;
  }

  if (audits.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No audits found. Create your first audit to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Audits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Auditor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell className="font-medium">{audit.audit_title}</TableCell>
                  <TableCell className="capitalize">{audit.audit_type}</TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeColor(audit.risk_level)}>
                      {audit.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeColor(audit.criticality)}>
                      {audit.criticality}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeColor(audit.status)}>
                      {audit.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{audit.vessel?.name || 'N/A'}</TableCell>
                  <TableCell>{audit.auditor?.full_name || audit.auditor?.email || 'N/A'}</TableCell>
                  <TableCell>
                    {audit.scheduled_date ? format(new Date(audit.scheduled_date), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectAudit(audit)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(audit.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
