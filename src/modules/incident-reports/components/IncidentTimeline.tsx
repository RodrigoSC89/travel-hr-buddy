/**
import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
 * PATCH 546 - Incident Timeline Generator
 * Visual timeline of incidents with month-based grouping and severity sorting
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Download,
  AlertTriangle,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  module: string;
  created_at: string;
  resolved_at?: string;
}

interface IncidentTimelineProps {
  moduleFilter?: string;
  dateFrom?: string;
  dateTo?: string;
}

const severityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const severityOrder = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  moduleFilter: initialModuleFilter,
  dateFrom: initialDateFrom,
  dateTo: initialDateTo,
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState(initialModuleFilter || "");
  const [dateFrom, setDateFrom] = useState(initialDateFrom || "");
  const [dateTo, setDateTo] = useState(initialDateTo || "");
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incidents, moduleFilter, dateFrom, dateTo]);

  const loadIncidents = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from incident_reports table
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load incidents");
        setIsLoading(false);
        return;
      }

      const formattedIncidents: Incident[] = (data || []).map((item: unknown) => ({
        id: item.id,
        title: item.title || item.incident_type || "Untitled Incident",
        description: item.description || "",
        severity: item.severity || "medium",
        status: item.status || "open",
        module: item.module || item.location || "Unknown",
        created_at: item.created_at,
        resolved_at: item.resolved_at,
      }));

      setIncidents(formattedIncidents);

      // Extract unique modules
      const modules = Array.from(new Set(formattedIncidents.map((i) => i.module)))
        .filter(Boolean)
        .sort();
      setAvailableModules(modules);
    } catch (error) {
      console.error("Error loading incidents:", error);
      console.error("Error loading incidents:", error);
      toast.error("Failed to load incidents");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...incidents];

    // Filter by module
    if (moduleFilter) {
      filtered = filtered.filter((i) => i.module === moduleFilter);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(
        (i) => new Date(i.created_at) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        (i) => new Date(i.created_at) <= new Date(dateTo)
      );
    }

    // Sort by severity (highest first) then by date (newest first)
    filtered.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

    setFilteredIncidents(filtered);
  };

  const groupByMonth = (incidents: Incident[]) => {
    const groups: { [key: string]: Incident[] } = {};

    incidents.forEach((incident) => {
      const date = new Date(incident.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(incident);
  };

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const exportToPNG = async () => {
    if (!timelineRef.current) return;

    try {
      toast.info("Generating image...");
      const canvas = await html2canvas(timelineRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `incident-timeline-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Timeline exported successfully!");
    } catch (error) {
      console.error("Error exporting timeline:", error);
      console.error("Error exporting timeline:", error);
      toast.error("Failed to export timeline");
    }
  };

  const clearFilters = () => {
    setModuleFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const groupedIncidents = groupByMonth(filteredIncidents);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading incidents...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Incident Timeline
              </CardTitle>
              <CardDescription>
                Visual timeline of incidents grouped by month and sorted by severity
              </CardDescription>
            </div>
            <Button onClick={exportToPNG} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Module Filter</Label>
              <Select value={moduleFilter || "all"} onValueChange={(value) => setModuleFilter(value === "all" ? "" : value}>
                <SelectTrigger>
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modules</SelectItem>
                  {availableModules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={clearFilters} variant="ghost" className="w-full">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card ref={timelineRef}>
        <CardContent className="p-6">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No incidents found matching the filters
            </div>
          ) : (
            <div className="space-y-8">
              {groupedIncidents.map(([monthKey, monthIncidents]) => (
                <div key={monthKey} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {formatMonthYear(monthKey)}
                    </h3>
                    <Badge variant="secondary">{monthIncidents.length} incidents</Badge>
                  </div>

                  <div className="space-y-3">
                    {monthIncidents.map((incident, index) => (
                      <div
                        key={incident.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              severityColors[incident.severity]
                            }`}
                          />
                          {index < monthIncidents.length - 1 && (
                            <div className="w-0.5 h-full min-h-[40px] bg-border mt-2" />
                          )}
                        </div>

                        {/* Incident details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-medium">{incident.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {incident.description}
                              </p>
                            </div>
                            <Badge
                              variant={incident.status === "resolved" ? "default" : "destructive"}
                            >
                              {incident.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(incident.created_at).toLocaleString()}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {incident.module}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs text-white ${
                                severityColors[incident.severity]
                              }`}
                            >
                              {incident.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{filteredIncidents.length}</p>
              <p className="text-xs text-muted-foreground">Total Incidents</p>
            </div>
            {Object.entries(severityOrder).map(([severity]) => (
              <div key={severity}>
                <p className="text-2xl font-bold">
                  {filteredIncidents.filter((i) => i.severity === severity).length}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{severity}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
