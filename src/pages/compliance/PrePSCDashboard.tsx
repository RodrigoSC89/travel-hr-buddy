/**
 * Pre-PSC Dashboard Page
 * Main dashboard for Port State Control self-assessments
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Shield, AlertTriangle, CheckCircle, Download, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { prePSCService } from "@/services/pre-psc.service";
import PrePSCForm from "@/modules/compliance/pre-psc/PrePSCForm";

export default function PrePSCDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewInspection, setShowNewInspection] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalInspections: 0,
    draftInspections: 0,
    completedInspections: 0,
    submittedInspections: 0,
    averageScore: 0,
    criticalItems: 0,
    nonCompliantItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(false);
      const statsData = await prePSCService.getInspectionStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
      toast({
        title: "Error",
        description: "Failed to load inspection statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewInspection = () => {
    setSelectedInspection(null);
    setShowNewInspection(true);
    setActiveTab("form");
  };

  const handleInspectionComplete = (inspectionId: string) => {
    setShowNewInspection(false);
    setActiveTab("overview");
    loadStats();
    toast({
      title: "Success",
      description: "Inspection completed successfully",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pre-Port State Control (Pre-PSC)</h1>
          <p className="text-muted-foreground mt-1">
            Self-assessment inspections based on IMO Resolution A.1185(33)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewInspection}>
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInspections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.draftInspections} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Compliance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Readiness Status</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.criticalItems === 0 ? "Ready" : "Not Ready"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              For PSC inspection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="form">
            {showNewInspection ? "New Inspection" : "Inspection Form"}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pre-PSC Self-Assessment</CardTitle>
              <CardDescription>
                Prepare your vessel for Port State Control inspections with our comprehensive checklist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <h3>What is Pre-PSC?</h3>
                <p>
                  The Pre-Port State Control module allows vessels to perform self-assessments before official
                  PSC inspections. Based on IMO Resolution A.1185(33) and DNV PSC Quick Guide, this tool helps
                  identify potential deficiencies and ensures readiness for inspections.
                </p>

                <h3>Key Features</h3>
                <ul>
                  <li>Comprehensive checklist covering all major PSC areas</li>
                  <li>AI-powered risk assessment and recommendations</li>
                  <li>Real-time compliance scoring</li>
                  <li>Evidence upload capability (photos/documents)</li>
                  <li>PDF report generation with digital signatures</li>
                  <li>Historical comparison of inspections</li>
                </ul>

                <h3>Inspection Categories</h3>
                <ul>
                  <li>Certificates & Documentation</li>
                  <li>Fire Safety</li>
                  <li>Life Saving Appliances</li>
                  <li>Navigation Equipment</li>
                  <li>MARPOL Compliance</li>
                  <li>ISM Code</li>
                  <li>Radio Communications</li>
                  <li>MLC 2006</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleNewInspection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Inspection
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Guidelines
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          {showNewInspection || selectedInspection ? (
            <PrePSCForm
              inspectionId={selectedInspection || undefined}
              onComplete={handleInspectionComplete}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No inspection selected. Start a new inspection to begin.
                </p>
                <Button onClick={handleNewInspection} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Inspection
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
              <CardDescription>
                View and compare previous PSC inspections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No inspection history available yet. Complete your first inspection to see history here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
