// @ts-nocheck
/**
 * PATCH 527 - Incident Center (Unified)
 * Consolidates incident-reports/ and all incident-related modules
 * Features: Detection, Documentation, Closure, AI Replay, Filtering, Cross-referenced Logs
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  Search, 
  Play,
  Filter,
  Calendar,
  TrendingUp,
  Database
} from "lucide-react";
import { toast } from "sonner";
import { IncidentDetection } from "@/modules/incident-reports/components/IncidentDetection";
import { IncidentDocumentation } from "@/modules/incident-reports/components/IncidentDocumentation";
import { IncidentClosure } from "@/modules/incident-reports/components/IncidentClosure";
import { IncidentReplay } from "@/modules/incident-reports/components/IncidentReplay";
import { incidentService } from "@/modules/incident-reports/services/incident-service";
import type { Incident } from "@/modules/incident-reports/types";

export const IncidentCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incidents, searchQuery, severityFilter, statusFilter, dateFilter]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await incidentService.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error("Error loading incidents:", error);
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...incidents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (incident) =>
          incident.title?.toLowerCase().includes(query) ||
          incident.description?.toLowerCase().includes(query) ||
          incident.location?.toLowerCase().includes(query)
      );
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((incident) => incident.severity === severityFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((incident) => incident.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
      case "today":
        filterDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      }

      if (dateFilter !== "all") {
        filtered = filtered.filter((incident) => {
          const incidentDate = new Date(incident.created_at || incident.timestamp);
          return incidentDate >= filterDate;
        });
      }
    }

    setFilteredIncidents(filtered);
  };

  const handleExportPDF = async (incidentId: string) => {
    try {
      await incidentService.exportIncidentToPDF(incidentId);
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const handleReplayIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActiveTab("replay");
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500",
    };
    return colors[severity] || "bg-gray-500";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-red-500",
      investigating: "bg-yellow-500",
      resolved: "bg-green-500",
      closed: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  // Calculate statistics
  const openIncidents = filteredIncidents.filter(
    (i) => i.status === "open" || i.status === "investigating"
  );
  const closedIncidents = filteredIncidents.filter((i) => i.status === "closed");
  const criticalIncidents = filteredIncidents.filter((i) => i.severity === "critical");

  if (loading && incidents.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Incident Center</h1>
            <p className="text-sm text-muted-foreground">
              Unified incident management with AI-powered replay and analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">PATCH 527</Badge>
          <Button onClick={loadIncidents} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Open Incidents</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openIncidents.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Critical</span>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalIncidents.length}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Closed</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedIncidents.length}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium">Total Incidents</span>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredIncidents.length}</div>
            <p className="text-xs text-muted-foreground">All records</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || severityFilter !== "all" || statusFilter !== "all" || dateFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSeverityFilter("all");
                setStatusFilter("all");
                setDateFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <FileText className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="detection">
            <Search className="mr-2 h-4 w-4" />
            Detection
          </TabsTrigger>
          <TabsTrigger value="documentation">
            <FileText className="mr-2 h-4 w-4" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="closure">
            <CheckCircle className="mr-2 h-4 w-4" />
            Closure
          </TabsTrigger>
          <TabsTrigger value="replay">
            <Play className="mr-2 h-4 w-4" />
            AI Replay
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredIncidents.slice(0, 10).map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{incident.title}</span>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {incident.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(incident.created_at || incident.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReplayIncident(incident.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Replay
                    </Button>
                  </div>
                ))}
                {filteredIncidents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No incidents found matching your filters
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detection Tab */}
        <TabsContent value="detection">
          <IncidentDetection incidents={filteredIncidents} onRefresh={loadIncidents} />
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation">
          <IncidentDocumentation
            incidents={filteredIncidents}
            onRefresh={loadIncidents}
            onExportPDF={handleExportPDF}
          />
        </TabsContent>

        {/* Closure Tab */}
        <TabsContent value="closure">
          <IncidentClosure incidents={filteredIncidents} onRefresh={loadIncidents} />
        </TabsContent>

        {/* AI Replay Tab */}
        <TabsContent value="replay">
          {selectedIncidentId ? (
            <IncidentReplay
              incidentId={selectedIncidentId}
              onClose={() => setSelectedIncidentId(null)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>AI Incident Replay</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Select an incident from the overview to replay with AI analysis
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncidentCenter;
