/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PATCH 114.0 - Smart Alerts with AI Predictive Analysis
 * Smart Alerts - Intelligent operational alerts with anomaly detection
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bell,
  AlertTriangle,
  Info,
  Zap,
  CheckCircle,
  RefreshCw,
  Search,
  Eye,
  Check,
  X,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { runAIContext } from "@/ai/kernel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistance } from "date-fns";

interface SmartAlert {
  id: string;
  source_module: string;
  level: string;
  message: string;
  predicted: boolean;
  confidence_score: number | null;
  impact_estimate: string | null;
  cause_analysis: string | null;
  recommended_actions: unknown[];
  affected_systems: string[];
  acknowledged: boolean;
  resolved: boolean;
  timestamp: string;
  vessel_name?: string;
  imo_code?: string;
  actions_count?: number;
  affected_systems_count?: number;
  hours_since_alert?: number;
}

const SmartAlerts = () => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [showResolved, setShowResolved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInsight, setAiInsight] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadSmartAlerts();
    loadAIInsights();
  }, [showResolved]);

  const loadSmartAlerts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("active_alerts_dashboard" as unknown)
        .select("*");
      
      if (!showResolved) {
        query = query.eq("resolved", false);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch full details for alerts with actions
      const alertsWithDetails = await Promise.all(
        (data || []).map(async (alert: unknown) => {
          const { data: fullAlert } = await supabase
            .from("smart_alerts" as unknown)
            .select("recommended_actions, affected_systems")
            .eq("id", alert.id)
            .single();
          
          return {
            ...alert,
            recommended_actions: (fullAlert as unknown)?.recommended_actions || [],
            affected_systems: (fullAlert as unknown)?.affected_systems || []
          };
        })
      );

      setAlerts(alertsWithDetails as unknown);
    } catch (error) {
      console.error("Error loading smart alerts:", error);
      toast({
        title: "Error",
        description: "Failed to load smart alerts",
        variant: "destructive",
      };
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const criticalAlerts = alerts.filter(a => a.level === "critical" && !a.resolved).length;
      const warningAlerts = alerts.filter(a => a.level === "warning" && !a.resolved).length;
      const predictedIssues = alerts.filter(a => a.predicted && !a.resolved).length;
      
      const response = await runAIContext({
        module: "anomaly-detector",
        action: "detect",
        context: { 
          criticalAlerts,
          warningAlerts,
          predictedIssues,
          totalAlerts: alerts.filter(a => !a.resolved).length
        }
      };
      
      if (response.message) {
        setAiInsight(response.message);
      }
    } catch (error) {
      console.error("Error loading AI insights:", error);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("smart_alerts" as unknown)
        .update({ acknowledged: true } as unknown)
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert acknowledged",
      };

      loadSmartAlerts();
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      };
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("smart_alerts" as unknown)
        .update({ resolved: true, acknowledged: true } as unknown)
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert resolved",
      };

      loadSmartAlerts();
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      };
    }
  };

  const getLevelBadge = (level: string, predicted: boolean) => {
    if (predicted) {
      return <Badge variant="outline" className="flex items-center gap-1 text-purple-600 border-purple-600">
        <Zap className="h-3 w-3" /> Predictive
      </Badge>;
    }

    switch (level) {
    case "critical":
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" /> Critical
      </Badge>;
    case "warning":
      return <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-600">
        <AlertTriangle className="h-3 w-3" /> Warning
      </Badge>;
    case "info":
      return <Badge variant="secondary" className="flex items-center gap-1">
        <Info className="h-3 w-3" /> Info
      </Badge>;
    default:
      return <Badge variant="outline">{level}</Badge>;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesLevel = filterLevel === "all" || alert.level === filterLevel;
    const matchesModule = filterModule === "all" || alert.source_module === filterModule;
    const matchesSearch = searchQuery === "" || 
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.source_module.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLevel && matchesModule && matchesSearch;
  };

  const modules = Array.from(new Set(alerts.map(a => a.source_module)));

  const totalAlerts = alerts.filter(a => !a.resolved).length;
  const criticalCount = alerts.filter(a => a.level === "critical" && !a.resolved).length;
  const warningCount = alerts.filter(a => a.level === "warning" && !a.resolved).length;
  const predictiveCount = alerts.filter(a => a.predicted && !a.resolved).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Smart Alerts</h1>
            <p className="text-muted-foreground">AI-Powered Anomaly Detection</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showResolved ? "default" : "outline"} 
            onClick={handleSetShowResolved}
          >
            {showResolved ? "Hide" : "Show"} Resolved
          </Button>
          <Button onClick={loadSmartAlerts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">Unresolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Require immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <Info className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Predictive</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{predictiveCount}</div>
            <p className="text-xs text-muted-foreground">AI predicted</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsight && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              AI Anomaly Detector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{aiInsight}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={handleChange}
                className="pl-9"
              />
            </div>

            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="predictive">Predictive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alert List</CardTitle>
          <CardDescription>
            {filteredAlerts.length} alerts {filteredAlerts.length !== alerts.length && `(filtered from ${alerts.length})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading smart alerts...
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No alerts found matching your filters
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <Card key={alert.id} className={`hover:bg-accent/50 transition-colors ${alert.resolved ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getLevelBadge(alert.level, alert.predicted)}
                          <Badge variant="outline" className="text-xs">
                            {alert.source_module}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Check className="h-3 w-3" /> Acknowledged
                            </Badge>
                          )}
                          {alert.resolved && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" /> Resolved
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{alert.message}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                          <div>
                            <span className="font-medium">Time:</span>{" "}
                            {formatDistance(new Date(alert.timestamp), new Date(), { addSuffix: true })}
                          </div>
                          {alert.confidence_score && (
                            <div>
                              <span className="font-medium">Confidence:</span> {alert.confidence_score.toFixed(1)}%
                            </div>
                          )}
                          {alert.vessel_name && (
                            <div>
                              <span className="font-medium">Vessel:</span> {alert.vessel_name}
                            </div>
                          )}
                        </div>
                        
                        {/* Impact & Cause Analysis */}
                        {alert.impact_estimate && (
                          <div className="mb-2 p-2 bg-orange-50 dark:bg-orange-950 rounded border border-orange-200 dark:border-orange-800">
                            <p className="text-sm"><span className="font-semibold">Impact:</span> {alert.impact_estimate}</p>
                          </div>
                        )}
                        {alert.cause_analysis && (
                          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-sm"><span className="font-semibold">Cause:</span> {alert.cause_analysis}</p>
                          </div>
                        )}

                        {/* Recommended Actions */}
                        {alert.recommended_actions && alert.recommended_actions.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-semibold mb-2">Recommended Actions:</h4>
                            <div className="space-y-1">
                              {alert.recommended_actions.slice(0, 3).map((action: unknown, idx: number) => (
                                <div key={idx} className="text-sm pl-4 text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  <span className="flex-1">
                                    {action.action}
                                    {action.priority && (
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        {action.priority}
                                      </Badge>
                                    )}
                                  </span>
                                </div>
                              ))}
                              {alert.recommended_actions.length > 3 && (
                                <p className="text-xs text-muted-foreground pl-4">
                                  +{alert.recommended_actions.length - 3} more actions
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {!alert.resolved && (
                        <div className="flex flex-col gap-2 ml-4">
                          {!alert.acknowledged && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlehandleAcknowledge}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Acknowledge
                            </Button>
                          )}
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handlehandleResolve}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default SmartAlerts;
