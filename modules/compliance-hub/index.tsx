/**
 * Compliance Hub - Main Component
 * PATCH 92.0 - Unified compliance management system
 * 
 * Consolidated from:
 * - compliance-hub (basic)
 * - audit-center (audits & checklists)
 * - checklists (smart checklists)
 * - risk-management (risk dashboard)
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, FileText, CheckSquare, AlertTriangle, Upload, Brain, 
  Download, Plus, TrendingUp, AlertCircle, CheckCircle, Clock,
  FileCheck, Search, Filter, Calendar
} from "lucide-react";
import { Logger } from "@/lib/utils/logger";
import { toast } from "sonner";

// Components (to be created separately)
import { DocumentationSection } from "./components/DocumentationSection";
import { ChecklistsSection } from "./components/ChecklistsSection";
import { AuditsSection } from "./components/AuditsSection";
import { RisksSection } from "./components/RisksSection";
import { ComplianceMetrics } from "./components/ComplianceMetrics";

// Services
import { getComplianceInsights } from "./services/ai-service";
import { ComplianceMetrics as MetricsType } from "./types";

const ComplianceHub = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [metrics, setMetrics] = useState<MetricsType | null>(null);
  const [aiInsights, setAIInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Logger.module("compliance-hub", "Initializing Compliance Hub PATCH 92.0");
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      // In real implementation, fetch from Supabase
      const mockMetrics: MetricsType = {
        overall_score: 94.7,
        audits_completed: 45,
        audits_pending: 3,
        checklists_active: 12,
        checklists_completed: 156,
        risks_active: 8,
        risks_critical: 2,
        documents_total: 234,
        documents_expiring_soon: 5,
        last_updated: new Date().toISOString()
      };

      setMetrics(mockMetrics);
      Logger.info("Compliance metrics loaded", { metrics: mockMetrics });

      // Get AI insights
      const insights = await getComplianceInsights({
        overall_score: mockMetrics.overall_score,
        audits_pending: mockMetrics.audits_pending,
        risks_critical: mockMetrics.risks_critical,
        documents_expiring_soon: mockMetrics.documents_expiring_soon
      });

      if (insights) {
        setAIInsights(insights);
      }

    } catch (error) {
      Logger.error("Failed to load compliance metrics", error, "compliance-hub");
      toast.error("Failed to load compliance data");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    loadMetrics();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading compliance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Compliance Hub</h1>
            <p className="text-sm text-muted-foreground">
              Central compliance management with AI-powered insights
            </p>
          </div>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* AI Insights Banner */}
      {aiInsights && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  AI Compliance Insights
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {aiInsights}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Overview */}
      {metrics && <ComplianceMetrics metrics={metrics} />}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documentation">
            <FileText className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="checklists">
            <CheckSquare className="h-4 w-4 mr-2" />
            Checklists
          </TabsTrigger>
          <TabsTrigger value="audits">
            <FileCheck className="h-4 w-4 mr-2" />
            Audits
          </TabsTrigger>
          <TabsTrigger value="risks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risks
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab("documentation")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Compliance Document
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab("checklists")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Checklist
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab("audits")}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Start New Audit
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab("risks")}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report New Risk
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="flex-1">ISM Audit completed</span>
                    <span className="text-muted-foreground">2h ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Upload className="h-4 w-4 text-blue-600" />
                    <span className="flex-1">New policy document uploaded</span>
                    <span className="text-muted-foreground">5h ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="flex-1">Risk assessment updated</span>
                    <span className="text-muted-foreground">1d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Module Information</CardTitle>
              <CardDescription>
                Compliance Hub consolidates audit management, checklist systems, risk assessment, 
                and regulatory documentation into a single, AI-powered platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• AI-powered document analysis</li>
                    <li>• Dynamic FMEA, ISM, ISPS checklists</li>
                    <li>• Automated audit logging per operation</li>
                    <li>• Real-time risk monitoring with AI insights</li>
                    <li>• Automatic PDF report generation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Regulatory Standards</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• IMCA M 204 Guidelines</li>
                    <li>• ISM Code Compliance</li>
                    <li>• ISPS Security Standards</li>
                    <li>• FMEA Risk Analysis</li>
                    <li>• NORMAM Regulations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation">
          <DocumentationSection />
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists">
          <ChecklistsSection />
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits">
          <AuditsSection />
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks">
          <RisksSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceHub;
