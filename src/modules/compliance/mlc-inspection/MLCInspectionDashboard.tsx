import { useEffect, useState, useCallback } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Shield, AlertTriangle, CheckCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mlcInspectionService } from "@/services/mlc-inspection.service";
import { InspectionsList } from "./components/InspectionsList";
import { CreateInspectionDialog } from "./components/CreateInspectionDialog";
import { ChecklistInterface } from "./components/ChecklistInterface";
import { EvidenceUploader } from "./components/EvidenceUploader";
import { InspectorChatbot } from "./components/InspectorChatbot";

export default function MLCInspectionDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalInspections: 0,
    draftInspections: 0,
    submittedInspections: 0,
    averageCompliance: 0,
    totalFindings: 0,
    criticalFindings: 0,
    nonCompliantFindings: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await mlcInspectionService.getInspectionStats();
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

  const handleInspectionCreated = (inspectionId: string) => {
    setShowCreateDialog(false);
    setSelectedInspection(inspectionId);
    setActiveTab("checklist");
    loadStats();
    toast({
      title: "Success",
      description: "Inspection created successfully",
    });
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MLC Inspection Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Maritime Labour Convention 2006 Digital Inspection System
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSetActiveTab}>
            <Shield className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
          <Button onClick={handleSetShowCreateDialog}>
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
            <CardTitle className="text-sm font-medium">Avg. Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCompliance}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all inspections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Findings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalFindings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nonCompliantFindings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {stats.totalFindings} findings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="chatbot">AI Assistant</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <InspectionsList 
            onSelectInspection={(id) => {
              setSelectedInspection(id);
              setActiveTab("checklist");
            }}
            onStatsUpdate={loadStats}
          />
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          {selectedInspection ? (
            <ChecklistInterface 
              inspectionId={selectedInspection}
              onUpdate={loadStats}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select an inspection to view the checklist</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          {selectedInspection ? (
            <EvidenceUploader 
              inspectionId={selectedInspection}
              onUpdate={loadStats}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select an inspection to upload evidence</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-4">
          <InspectorChatbot />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Reports</CardTitle>
              <CardDescription>
                Generate and export MLC inspection reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select an inspection to generate reports</p>
                <p className="text-sm mt-2">Available formats: PDF, DOCX, JSON</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Inspection Dialog */}
      <CreateInspectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onInspectionCreated={handleInspectionCreated}
      />
    </div>
  );
}
