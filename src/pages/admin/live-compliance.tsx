/**
 * ETAPA 33: Live Compliance Module - Admin Dashboard
 * AI-Powered Maritime Compliance Automation Dashboard
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCcw, TrendingUp, AlertTriangle, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  calculateComplianceScore,
  getComplianceStatusExplanation,
  type ComplianceScore,
} from '@/services/compliance-engine';

interface NonConformity {
  id: string;
  source_type: string;
  vessel_name: string;
  description: string;
  detected_at: string;
  severity: string;
  status: string;
  matched_norms: any[];
}

interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  action_type: string;
  priority: string;
  status: string;
  due_date: string;
}

interface TrainingAssignment {
  id: string;
  training_title: string;
  vessel_name: string;
  assigned_to_name: string;
  status: string;
  due_date: string;
}

interface Evidence {
  id: string;
  title: string;
  evidence_type: string;
  norm_reference: string;
  collected_at: string;
}

export default function LiveComplianceDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<ComplianceScore | null>(null);
  const [statusExplanation, setStatusExplanation] = useState('');
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [training, setTraining] = useState<TrainingAssignment[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [tenantId, setTenantId] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get current user's tenant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to view this page',
          variant: 'destructive',
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) {
        toast({
          title: 'Error',
          description: 'Tenant information not found',
          variant: 'destructive',
        });
        return;
      }

      setTenantId(profile.tenant_id);

      // Load compliance score
      const complianceScore = await calculateComplianceScore(profile.tenant_id);
      setScore(complianceScore);

      // Load AI status explanation
      const explanation = await getComplianceStatusExplanation(profile.tenant_id);
      setStatusExplanation(explanation);

      // Load non-conformities
      const { data: ncData } = await supabase
        .from('compliance_non_conformities')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('detected_at', { ascending: false })
        .limit(50);

      setNonConformities(ncData || []);

      // Load corrective actions
      const { data: actionsData } = await supabase
        .from('compliance_corrective_actions')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('due_date', { ascending: true })
        .limit(50);

      setActions(actionsData || []);

      // Load training assignments
      const { data: trainingData } = await supabase
        .from('compliance_training_assignments')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('due_date', { ascending: true })
        .limit(50);

      setTraining(trainingData || []);

      // Load evidence
      const { data: evidenceData } = await supabase
        .from('compliance_evidence')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('collected_at', { ascending: false })
        .limit(50);

      setEvidence(evidenceData || []);

      toast({
        title: 'Success',
        description: 'Dashboard data loaded successfully',
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'pending':
      case 'assigned':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'resolved':
      case 'completed':
        return 'bg-green-500';
      case 'archived':
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 80) return 'text-green-600';
    if (scoreValue >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Compliance Dashboard</h1>
          <p className="text-muted-foreground">AI-Powered Maritime Compliance Automation</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score?.score || 0)}`}>
                {score?.score || 0}
              </div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold">{score?.total_non_conformities || 0}</div>
              <p className="text-sm text-muted-foreground">Total Issues</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-yellow-600">{score?.open_non_conformities || 0}</div>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-green-600">{score?.resolved_non_conformities || 0}</div>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-red-600">{score?.overdue_actions || 0}</div>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Status Explainer */}
      {statusExplanation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              AI Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{statusExplanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="actions">Corrective Actions</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Non-Conformities Timeline</CardTitle>
              <CardDescription>Chronological view of detected compliance issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nonConformities.map((nc) => (
                  <div key={nc.id} className="border-l-4 pl-4 py-2" style={{ borderColor: getSeverityColor(nc.severity).replace('bg-', '') }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(nc.severity)}>{nc.severity}</Badge>
                          <Badge className={getStatusColor(nc.status)}>{nc.status}</Badge>
                          <span className="text-sm text-muted-foreground">{nc.vessel_name || 'N/A'}</span>
                        </div>
                        <p className="text-sm font-medium">{nc.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Detected: {new Date(nc.detected_at).toLocaleString()}
                        </p>
                        {nc.matched_norms && nc.matched_norms.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold">Matched Norms:</p>
                            {nc.matched_norms.map((norm: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="mr-1 mt-1">
                                {norm.norm_type} - {norm.clause}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {nonConformities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No non-conformities found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Corrective Actions</CardTitle>
              <CardDescription>Action plans for resolving non-conformities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actions.map((action) => (
                  <div key={action.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(action.status)}>{action.status}</Badge>
                          <Badge variant="outline">{action.action_type}</Badge>
                          <Badge className={getSeverityColor(action.priority)}>{action.priority}</Badge>
                        </div>
                        <h4 className="font-semibold">{action.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                        {action.due_date && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(action.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {actions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No corrective actions found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Assignments</CardTitle>
              <CardDescription>Reactive training for crew members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {training.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        </div>
                        <h4 className="font-semibold">{item.training_title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Assigned to: {item.assigned_to_name || 'N/A'}
                        </p>
                        {item.due_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(item.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {training.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No training assignments found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Evidence</CardTitle>
              <CardDescription>Documentation and evidence trail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evidence.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{item.evidence_type}</Badge>
                        </div>
                        <h4 className="font-semibold">{item.title}</h4>
                        {item.norm_reference && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Norm: {item.norm_reference}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Collected: {new Date(item.collected_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {evidence.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                    <p>No evidence records found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
