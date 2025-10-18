/**
 * ETAPA 33 - Live Compliance Module Dashboard
 * 
 * Admin dashboard for monitoring and managing the automated compliance system
 * 
 * Features:
 * - Score Card: Visual compliance score with breakdown
 * - AI Status Explainer: Intelligent summary of compliance state
 * - Timeline View: Chronological non-conformities
 * - Evidence by Norm: Audit evidence grouped by regulation
 * - Training by Vessel: Training assignment tracking
 * - Corrective Actions: Action plan management
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileCheck,
  GraduationCap,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  calculateComplianceScore,
  getComplianceStatusExplanation,
  type ComplianceScore,
} from "@/services/compliance-engine";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const LiveComplianceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<ComplianceScore | null>(null);
  const [statusExplanation, setStatusExplanation] = useState<string>("");
  const [nonConformities, setNonConformities] = useState<any[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [trainingAssignments, setTrainingAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Calculate compliance score
      const scoreData = await calculateComplianceScore();
      setScore(scoreData);

      // Get AI status explanation
      const explanation = await getComplianceStatusExplanation();
      setStatusExplanation(explanation);

      // Load non-conformities
      const { data: ncData } = await supabase
        .from('compliance_non_conformities')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(50);
      setNonConformities(ncData || []);

      // Load corrective actions
      const { data: caData } = await supabase
        .from('compliance_corrective_actions')
        .select('*, non_conformity:compliance_non_conformities(*)')
        .order('created_at', { ascending: false })
        .limit(50);
      setCorrectiveActions(caData || []);

      // Load evidence
      const { data: evData } = await supabase
        .from('compliance_evidence')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setEvidence(evData || []);

      // Load training assignments
      const { data: taData } = await supabase
        .from('compliance_training_assignments')
        .select('*, training_module:training_modules(*)')
        .order('created_at', { ascending: false })
        .limit(50);
      setTrainingAssignments(taData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: "destructive",
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return <Badge variant={colors[severity as keyof typeof colors] || "default"}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: "destructive",
      in_progress: "default",
      resolved: "default",
      completed: "default",
      overdue: "destructive",
      planned: "secondary",
    };
    const variants: Record<string, any> = {
      open: "destructive",
      in_progress: "default",
      resolved: "secondary",
      completed: "secondary",
      overdue: "destructive",
      planned: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Live Compliance Module
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-Powered Maritime Compliance Automation - ETAPA 33
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="text-sm">
            <Zap className="mr-2 h-4 w-4" />
            {score?.automation_rate.toFixed(1)}% Automated
          </Badge>
          <Button onClick={loadDashboardData} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Score Card */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${getScoreColor(score?.score || 0)}`}>
              {score?.score.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getScoreLabel(score?.score || 0)}
            </p>
            <Progress value={score?.score || 0} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Non-Conformities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{score?.total_non_conformities || 0}</div>
            <div className="flex gap-3 mt-2 text-sm">
              <span className="text-red-600">{score?.open_non_conformities || 0} open</span>
              <span className="text-green-600">{score?.resolved_non_conformities || 0} resolved</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Corrective Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{score?.total_corrective_actions || 0}</div>
            <div className="flex gap-3 mt-2 text-sm">
              <span className="text-green-600">{score?.completed_actions || 0} completed</span>
              <span className="text-red-600">{score?.overdue_actions || 0} overdue</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Automation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {score?.automation_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AI-Powered Processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Status Explainer */}
      {statusExplanation && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              AI Compliance Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{statusExplanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs for detailed views */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">
            <Clock className="mr-2 h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="actions">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="evidence">
            <FileCheck className="mr-2 h-4 w-4" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="training">
            <GraduationCap className="mr-2 h-4 w-4" />
            Training
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Non-Conformity Timeline</CardTitle>
              <CardDescription>
                Chronological view of detected compliance issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Norm</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nonConformities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No non-conformities detected yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    nonConformities.map((nc) => (
                      <TableRow key={nc.id}>
                        <TableCell className="text-sm">
                          {format(new Date(nc.detected_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{nc.source_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{nc.description}</TableCell>
                        <TableCell>
                          {nc.norm_type && (
                            <Badge variant="secondary">
                              {nc.norm_type} {nc.norm_clause}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getSeverityBadge(nc.severity)}</TableCell>
                        <TableCell>{getStatusBadge(nc.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Corrective Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Corrective Action Plans</CardTitle>
              <CardDescription>
                AI-generated and manual action plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Responsible</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Generated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {correctiveActions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No corrective actions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    correctiveActions.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell className="font-medium">{action.action_title}</TableCell>
                        <TableCell>{getSeverityBadge(action.priority)}</TableCell>
                        <TableCell>{action.responsible_role || 'Not assigned'}</TableCell>
                        <TableCell className="text-sm">
                          {action.deadline ? format(new Date(action.deadline), 'MMM dd') : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(action.status)}</TableCell>
                        <TableCell>
                          {action.ai_generated && (
                            <Badge variant="secondary" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Evidence by Norm</CardTitle>
              <CardDescription>
                Evidence grouped by regulation for audit readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Norm Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evidence.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No evidence records yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    evidence.map((ev) => (
                      <TableRow key={ev.id}>
                        <TableCell>
                          <Badge variant="outline">{ev.evidence_type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{ev.title}</TableCell>
                        <TableCell>
                          {ev.norm_type && (
                            <Badge variant="secondary">
                              {ev.norm_type} {ev.norm_clause}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(ev.verification_status)}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(ev.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reactive Training Assignments</CardTitle>
              <CardDescription>
                Training assigned based on non-conformities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Training Module</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Certificate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No training assignments yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    trainingAssignments.map((ta) => (
                      <TableRow key={ta.id}>
                        <TableCell className="font-medium">
                          {ta.training_module?.title || 'Unknown Module'}
                        </TableCell>
                        <TableCell>{getSeverityBadge(ta.priority)}</TableCell>
                        <TableCell className="text-sm">
                          {ta.due_date ? format(new Date(ta.due_date), 'MMM dd') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={ta.progress_percentage || 0} className="w-20" />
                            <span className="text-xs">{ta.progress_percentage || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(ta.status)}</TableCell>
                        <TableCell>
                          {ta.certificate_issued ? (
                            <Badge variant="default">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Issued
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveComplianceDashboard;
