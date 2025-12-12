import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  Plus,
  Eye
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AuditSubmissionForm } from "@/components/sgso/AuditSubmissionForm";
import { AuditsList } from "@/components/sgso/AuditsList";
import { FindingsManager } from "@/components/sgso/FindingsManager";

export default function SGSOWorkflow() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    total_audits: 0,
    pending_audits: 0,
    approved_audits: 0,
    rejected_audits: 0,
    total_findings: 0,
    open_findings: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Get audit statistics
      const { data: audits, error: auditsError } = await supabase
        .from("sgso_audits")
        .select("status");

      if (auditsError) throw auditsError;

      const auditStats = {
        total_audits: audits?.length || 0,
        pending_audits: audits?.filter(a => a.status === "planned" || a.status === "in_progress").length || 0,
        approved_audits: audits?.filter(a => a.status === "completed" || a.status === "closed").length || 0,
        rejected_audits: 0
      });

      // Get findings statistics
      const { data: findings, error: findingsError } = await supabase
        .from("non_conformities")
        .select("status");

      if (findingsError) throw findingsError;

      const findingsStats = {
        total_findings: findings?.length || 0,
        open_findings: findings?.filter(f => f.status === "open" || f.status === "investigating").length || 0
      };

      setStats({ ...auditStats, ...findingsStats });
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error loading stats",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">SGSO Workflow Engine</h1>
          <p className="text-muted-foreground">
            Complete audit workflow: submission, approval, and non-conformity tracking
          </p>
        </div>
        <Button onClick={handleSetShowSubmissionForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Audit Submission
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_audits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_audits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved_audits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected_audits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Total Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_findings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              Open Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.open_findings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Workflow Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Workflow Status Overview
          </CardTitle>
          <CardDescription>Current state of audit approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Approval Rate</span>
                <span className="font-medium">
                  {stats.total_audits > 0 
                    ? Math.round((stats.approved_audits / stats.total_audits) * 100) 
                    : 0}%
                </span>
              </div>
              <Progress 
                value={stats.total_audits > 0 ? (stats.approved_audits / stats.total_audits) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending_audits}</div>
                <div className="text-xs text-muted-foreground">Awaiting Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.approved_audits}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected_audits}</div>
                <div className="text-xs text-muted-foreground">Rejected</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="audits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audits">
            <FileText className="h-4 w-4 mr-2" />
            Audits
          </TabsTrigger>
          <TabsTrigger value="findings">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Findings & Non-Conformities
          </TabsTrigger>
          <TabsTrigger value="actions">
            <Activity className="h-4 w-4 mr-2" />
            Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-4">
          <AuditsList onRefresh={loadDashboardStats} />
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <FindingsManager />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Action Plans</CardTitle>
              <CardDescription>Corrective and preventive actions from audits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Action plans will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Audit Submission Form Dialog */}
      {showSubmissionForm && (
        <AuditSubmissionForm 
          open={showSubmissionForm}
          onClose={() => {
            setShowSubmissionForm(false);
            loadDashboardStats();
          }}
        />
      )}
    </div>
  );
}
