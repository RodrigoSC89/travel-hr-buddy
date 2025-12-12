import { useEffect, useState } from "react";;

/**
 * PATCH 491 - Consolidated Incident Reports Module
 * Consolidates incident-reports/ and incidents/ into one unified system
 * Features: Detection, Documentation, Closure workflows + Full CRUD
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertOctagon, 
  Clock, 
  CheckCircle, 
  TrendingDown,
  FileText,
  Search,
  Upload,
  Download,
  Plus,
  AlertCircle,
  Eye,
  Edit
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateIncidentDialog } from "./components/CreateIncidentDialog";
import { IncidentDetailDialog } from "./components/IncidentDetailDialog";

interface Incident {
  id: string;
  incident_number: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  status: "pending" | "under_analysis" | "resolved" | "closed";
  incident_date: string;
  impact_level: string;
  description?: string;
  reported_by?: string;
  assigned_to?: string;
  incident_location?: string;
  root_cause?: string;
  immediate_actions?: string;
  created_at?: string;
  updated_at?: string;
}

const IncidentReports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .order("incident_date", { ascending: false });

      if (error) throw error;

      setIncidents(data || []);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast({
        title: "Error",
        description: "Failed to load incidents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "bg-red-500";
    case "high": return "bg-orange-500";
    case "medium": return "bg-yellow-500";
    case "low": return "bg-green-500";
    default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "closed": return "text-gray-600";
    case "resolved": return "text-green-600";
    case "under_analysis": return "text-blue-600";
    case "pending": return "text-yellow-600";
    default: return "text-gray-600";
    }
  };

  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "pending" || i.status === "under_analysis").length,
    resolved: incidents.filter((i) => i.status === "resolved" || i.status === "closed").length,
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertOctagon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Incident Reports</h1>
            <p className="text-muted-foreground">Complete incident management system</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Incident
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertOctagon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Under investigation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}% resolution
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-12%</div>
            <p className="text-xs text-muted-foreground">Reduction vs last year</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detection"><Search className="mr-2 h-4 w-4" />Detection</TabsTrigger>
          <TabsTrigger value="documentation"><FileText className="mr-2 h-4 w-4" />Documentation</TabsTrigger>
          <TabsTrigger value="closure"><CheckCircle className="mr-2 h-4 w-4" />Closure</TabsTrigger>
          <TabsTrigger value="all">All Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Latest reported incidents and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.slice(0, 10).map(incident => (
                  <div 
                    key={incident.id} 
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-2 h-12 rounded ${getSeverityColor(incident.severity)}`} />
                      <div className="flex-1">
                        <div className="font-medium">{incident.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline">{incident.category}</Badge>
                          <span>•</span>
                          <span>{new Date(incident.incident_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{incident.incident_number}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(incident.status)} variant="outline">
                        {incident.status.replace("_", " ")}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detection Tab - Open incidents requiring attention */}
        <TabsContent value="detection" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Detection</CardTitle>
              <CardDescription>Open incidents requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.filter(i => i.status === "pending" || i.status === "under_analysis").length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No open incidents detected</p>
                ) : (
                  incidents.filter(i => i.status === "pending" || i.status === "under_analysis").map(incident => (
                    <Card key={incident.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedIncident(incident)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="font-semibold">{incident.title}</span>
                            <Badge variant="outline">{incident.incident_number}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{incident.description}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {incident.incident_location || "Location N/A"} • {new Date(incident.incident_date).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={incident.severity === "critical" ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"}>
                            {incident.severity}
                          </Badge>
                          <Button size="sm" variant="outline"><Eye className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab - All incidents for documentation */}
        <TabsContent value="documentation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Documentation</CardTitle>
              <CardDescription>Document and export incident reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.map(incident => (
                  <Card key={incident.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4" />
                          <span className="font-semibold">{incident.title}</span>
                          <Badge>{incident.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{incident.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          Status: {incident.status.replace("_", " ")} • {new Date(incident.incident_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedIncident(incident)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Closure Tab - Resolved and closed incidents */}
        <TabsContent value="closure" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Closure</CardTitle>
              <CardDescription>Resolved and closed incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.filter(i => i.status === "resolved" || i.status === "closed").length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No closed incidents</p>
                ) : (
                  incidents.filter(i => i.status === "resolved" || i.status === "closed").map(incident => (
                    <Card key={incident.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedIncident(incident)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-semibold">{incident.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{incident.description}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Closed: {new Date(incident.updated_at || incident.incident_date).toLocaleDateString()}
                            {incident.root_cause && ` • Root cause: ${incident.root_cause.substring(0, 50)}...`}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          {incident.status}
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Incidents Tab */}
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Incidents</CardTitle>
                  <CardDescription>View and manage all incident reports</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Search className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.map(incident => (
                  <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedIncident(incident)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-1.5 h-16 rounded ${getSeverityColor(incident.severity)}`} />
                      <div className="flex-1">
                        <div className="font-medium text-lg">{incident.title}</div>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <Badge>{incident.category}</Badge>
                          <Badge variant="outline">{incident.severity}</Badge>
                          <span className="text-muted-foreground">
                            Impact: {incident.impact_level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status.replace("_", " ")}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(incident.incident_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateIncidentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchIncidents}
      />

      {selectedIncident && (
        <IncidentDetailDialog
          incident={selectedIncident}
          open={!!selectedIncident}
          onOpenChange={(open) => !open && setSelectedIncident(null)}
        />
      )}
    </div>
  );
};

export default IncidentReports;
