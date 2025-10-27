import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateAuditDialog } from '@/components/sgso/audits/CreateAuditDialog';
import { AuditsList } from '@/components/sgso/audits/AuditsList';
import { ActionPlansTab } from '@/components/sgso/audits/ActionPlansTab';

export default function SGSOAudits() {
  const [activeTab, setActiveTab] = useState('audits');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [stats, setStats] = useState({
    totalAudits: 0,
    pendingAudits: 0,
    completedAudits: 0,
    activeActions: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load audits
      const { data: audits, error: auditsError } = await supabase
        .from('sgso_audits')
        .select('id, status');

      if (auditsError) throw auditsError;

      // Load actions
      const { data: actions, error: actionsError } = await supabase
        .from('sgso_actions')
        .select('id, status');

      if (actionsError) throw actionsError;

      setStats({
        totalAudits: audits?.length || 0,
        pendingAudits: audits?.filter(a => a.status === 'pending').length || 0,
        completedAudits: audits?.filter(a => a.status === 'completed').length || 0,
        activeActions: actions?.filter(a => a.status === 'in_progress' || a.status === 'pending').length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit statistics',
        variant: 'destructive',
      });
    }
  };

  const handleAuditCreated = () => {
    loadStats();
    setShowCreateDialog(false);
    toast({
      title: 'Success',
      description: 'Audit created successfully',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SGSO Audits Management</h1>
          <p className="text-muted-foreground mt-1">
            Safety Management System - Audits and Action Plans
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Audit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAudits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAudits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAudits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeActions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="actions">Action Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-4">
          <AuditsList 
            onSelectAudit={setSelectedAudit}
            onRefresh={loadStats}
          />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <ActionPlansTab 
            selectedAuditId={selectedAudit?.id}
            onRefresh={loadStats}
          />
        </TabsContent>
      </Tabs>

      <CreateAuditDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleAuditCreated}
      />
    </div>
  );
}
