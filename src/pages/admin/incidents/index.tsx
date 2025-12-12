/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 454 - Incidents Consolidated
 * Unified incident detection, documentation, and closure system
 * Consolidates: incident-reports/ + incidents/
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, FileText, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { IncidentDetection } from "@/modules/incident-reports/components/IncidentDetection";
import { IncidentDocumentation } from "@/modules/incident-reports/components/IncidentDocumentation";
import { IncidentClosure } from "@/modules/incident-reports/components/IncidentClosure";
import { incidentService } from "@/modules/incident-reports/services/incident-service";
import type { Incident } from "@/modules/incident-reports/types";

const IncidentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("detection");
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await incidentService.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error("Error loading incidents:", error);
      toast.error("Failed to load incidents");
    }
  };

  const handleExportPDF = async (incidentId: string) => {
    try {
      await incidentService.exportIncidentToPDF(incidentId);
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const openIncidents = incidents.filter(i => i.status === "open" || i.status === "investigating");
  const closedIncidents = incidents.filter(i => i.status === "closed");
  const criticalIncidents = incidents.filter(i => i.severity === "critical");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Incident Management</h1>
            <p className="text-sm text-muted-foreground">
              Detection, documentation, and closure system
            </p>
          </div>
        </div>
        <Button onClick={loadIncidents} variant="outline" size="sm">Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Open Incidents</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openIncidents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Critical</span>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalIncidents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Closed</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedIncidents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Total</span>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detection"><Search className="mr-2 h-4 w-4" />Detection</TabsTrigger>
          <TabsTrigger value="documentation"><FileText className="mr-2 h-4 w-4" />Documentation</TabsTrigger>
          <TabsTrigger value="closure"><CheckCircle className="mr-2 h-4 w-4" />Closure</TabsTrigger>
        </TabsList>

        <TabsContent value="detection"><IncidentDetection incidents={openIncidents} onRefresh={loadIncidents} /></TabsContent>
        <TabsContent value="documentation"><IncidentDocumentation incidents={incidents} onRefresh={loadIncidents} onExportPDF={handleExportPDF} /></TabsContent>
        <TabsContent value="closure"><IncidentClosure incidents={incidents} onRefresh={loadIncidents} /></TabsContent>
      </Tabs>
    </div>
  );
};

export default IncidentsPage;
