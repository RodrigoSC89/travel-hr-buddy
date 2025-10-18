// ETAPA 32: External Audit System Main Page
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AuditSimulator } from "@/components/external-audit/AuditSimulator";
import { PerformanceDashboard } from "@/components/external-audit/PerformanceDashboard";
import { EvidenceManager } from "@/components/external-audit/EvidenceManager";
import { supabase } from "@/integrations/supabase/client";
import { FileCheck2, BarChart3, FolderOpen } from "lucide-react";

interface Vessel {
  id: string;
  name: string;
  type?: string;
}

const AuditSystem: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVesselId, setSelectedVesselId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("simulator");

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
    try {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, type")
        .order("name", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setVessels(data);
        // Auto-select first vessel
        setSelectedVesselId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading vessels:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">External Audit System</h1>
        <p className="text-muted-foreground">
          AI-powered audit simulation, performance monitoring, and evidence management (ETAPA 32)
        </p>
      </div>

      {/* Vessel Selection */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="vessel-select" className="min-w-[100px]">
            Select Vessel:
          </Label>
          <Select value={selectedVesselId} onValueChange={setSelectedVesselId}>
            <SelectTrigger id="vessel-select" className="w-[300px]">
              <SelectValue placeholder="Select a vessel" />
            </SelectTrigger>
            <SelectContent>
              {vessels.map((vessel) => (
                <SelectItem key={vessel.id} value={vessel.id}>
                  {vessel.name} {vessel.type && `(${vessel.type})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Main Content with Tabs */}
      {selectedVesselId ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="simulator" className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Simulator</span>
              <span className="sm:hidden">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="evidence" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Evidence</span>
              <span className="sm:hidden">Files</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulator" className="space-y-4">
            <AuditSimulator vesselId={selectedVesselId} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceDashboard vesselId={selectedVesselId} />
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <EvidenceManager vesselId={selectedVesselId} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {vessels.length === 0
                ? "No vessels available. Please create a vessel first."
                : "Please select a vessel to continue."}
            </p>
          </div>
        </Card>
      )}

      {/* Feature Overview */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4">System Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium">AI Audit Simulation</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Simulate technical audits from Petrobras, IBAMA, IMO, ISO, and IMCA using GPT-4. Generates
              conformities, non-conformities, scores, reports, and action plans in 30 seconds.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <h4 className="font-medium">Performance Dashboard</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time vessel performance metrics including compliance %, MTTR, training completion, and incident
              tracking. Visualized with radar and bar charts.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-purple-500" />
              <h4 className="font-medium">Evidence Management</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload and manage compliance evidence for ISO, ISM, ISPS, MODU, IBAMA, Petrobras, and IMCA norms.
              Track validation status and identify missing evidence.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuditSystem;
