/**
import { useEffect, useState, useMemo } from "react";;
 * PATCH 220 - Collective Dashboard
 * Unified dashboard showing decisions, contexts, conflicts, AI suggestions, learning, and performance
 */

import React, { useState, useEffect } from "react";
import { useOptimizedPolling } from "@/hooks/use-optimized-polling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  Network,
  Target,
  Zap,
  Users
} from "lucide-react";
import { distributedDecisionCore, Decision } from "@/ai/distributedDecisionCore";
import { consciousCore, SystemState, SystemObservation } from "@/ai/consciousCore";
import { collectiveLoopEngine, FeedbackSummary, FeedbackEvent } from "@/ai/feedback/collectiveLoop";
import { contextMesh } from "@/core/context/contextMesh";
import { logger } from "@/lib/logger";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ModulePerformance {
  moduleName: string;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
  decisionCount: number;
  successRate: number;
}

interface ConflictData {
  id: string;
  modules: string[];
  severity: string;
  description: string;
  status: "open" | "resolving" | "resolved";
  timestamp: Date;
}

export const CollectiveDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("decisions");
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [observations, setObservations] = useState<SystemObservation[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary | null>(null);
  const [modulePerformance, setModulePerformance] = useState<ModulePerformance[]>([]);
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSystems();
    loadDashboardData();
  }, []);

  const initializeSystems = async () => {
    try {
      await contextMesh.initialize();
      await distributedDecisionCore.initialize();
      await consciousCore.initialize();
      await collectiveLoopEngine.initialize();
      
      consciousCore.startMonitoring();
      collectiveLoopEngine.startProcessing();
      
      logger.info("[CollectiveDashboard] All systems initialized");
    } catch (error) {
      logger.error("[CollectiveDashboard] Failed to initialize systems", error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load system state
      const state = await consciousCore.getSystemState();
      setSystemState(state);

      // Load decisions
      const recentDecisions = await distributedDecisionCore.getDecisionHistory(undefined, 50);
      setDecisions(recentDecisions);

      // Load observations
      const activeObs = consciousCore.getActiveObservations();
      setObservations(activeObs);

      // Load feedback summary
      const summary = await collectiveLoopEngine.getFeedbackSummary(undefined, 7);
      setFeedbackSummary(summary);

      // Calculate module performance
      const performance = calculateModulePerformance(recentDecisions);
      setModulePerformance(performance);

      // Extract conflicts from observations
      const conflictObs = activeObs.filter(o => o.observationType === "conflict");
      const conflictData: ConflictData[] = conflictObs.map(o => ({
        id: o.id || "",
        modules: o.modulesAffected,
        severity: o.severity,
        description: o.description,
        status: o.resolved ? "resolved" : "open",
        timestamp: o.timestamp
      }));
      setConflicts(conflictData);

      setLoading(false);
    } catch (error) {
      logger.error("[CollectiveDashboard] Error loading dashboard data", error);
      setLoading(false);
    }
  };

  const calculateModulePerformance = (decisions: Decision[]): ModulePerformance[] => {
    const moduleMap = new Map<string, {
      successes: number;
      failures: number;
      total: number;
    }>();

    decisions.forEach(d => {
      if (!moduleMap.has(d.moduleName)) {
        moduleMap.set(d.moduleName, { successes: 0, failures: 0, total: 0 });
      }
      const stats = moduleMap.get(d.moduleName)!;
      stats.total++;
      if (d.success) stats.successes++;
      else stats.failures++;
  });

    return Array.from(moduleMap.entries()).map(([moduleName, stats]) => {
      const successRate = stats.total > 0 ? stats.successes / stats.total : 0;
      return {
        moduleName,
        precision: 0.75 + Math.random() * 0.2, // Mock data
        recall: 0.7 + Math.random() * 0.25,
        f1Score: 0.72 + Math.random() * 0.23,
        accuracy: successRate,
        decisionCount: stats.total,
        successRate
      };
    });
  });

  // Optimized polling for dashboard refresh
  useOptimizedPolling({
    id: "collective-dashboard-refresh",
    callback: loadDashboardData,
    interval: 10000,
  });

  const exportPDF = async () => {
    logger.info("[CollectiveDashboard] Exporting PDF report...");
    // In real implementation, this would generate a PDF
    alert("PDF export feature - would generate comprehensive report");
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
    case "healthy": return "text-green-500";
    case "degraded": return "text-yellow-500";
    case "critical": return "text-red-500";
    default: return "text-gray-500";
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, unknown> = {
      info: "default",
      warning: "secondary",
      error: "destructive",
      critical: "destructive"
    };
    return <Badge variant={variants[severity] || "default"}>{severity}</Badge>;
  });

  const getDecisionLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      local: "bg-blue-500",
      escalated: "bg-orange-500",
      delegated: "bg-purple-500",
      collaborative: "bg-green-500"
    };
    return (
      <Badge className={colors[level] || "bg-gray-500"}>
        {level}
      </Badge>
    );
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="h-8 w-8 text-blue-500" />
            Collective Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Unified view of decisions, contexts, conflicts, and AI performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportPDF} variant="default" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemState && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(systemState.overallHealth)}`}>
                {systemState.overallHealth.toUpperCase()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemState.activeModules} / {systemState.totalModules}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {systemState.activeObservations}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {systemState.criticalIssues}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="decisions">
            <Target className="h-4 w-4 mr-2" />
            Decision Timeline
          </TabsTrigger>
          <TabsTrigger value="conflicts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Conflicts
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            AI Performance
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <Users className="h-4 w-4 mr-2" />
            Collective Feedback
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Decision Timeline Tab */}
        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Decision Timeline by Module</CardTitle>
              <CardDescription>
                Recent decisions across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {decisions.map((decision) => (
                    <div key={decision.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{decision.moduleName}</span>
                            {getDecisionLevelBadge(decision.decisionLevel)}
                            <Badge variant={decision.success ? "default" : "destructive"}>
                              {decision.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {decision.decisionType} - {decision.action}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(decision.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {decision.escalationReason && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-2 text-sm">
                          <strong>Escalation:</strong> {decision.escalationReason}
                        </div>
                      )}
                      {decision.errorMessage && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-2 text-sm">
                          <strong>Error:</strong> {decision.errorMessage}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conflict Map & Resolution</CardTitle>
              <CardDescription>
                Active and resolved conflicts between modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(conflict.severity)}
                        <Badge variant={conflict.status === "resolved" ? "default" : "secondary"}>
                          {conflict.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(conflict.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">{conflict.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <strong>Modules affected:</strong>
                        {conflict.modules.map(m => (
                          <Badge key={m} variant="outline">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {conflicts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No active conflicts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Metrics by Module</CardTitle>
              <CardDescription>
                Precision, Recall, and Success Rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={modulePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="moduleName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="precision" fill="#8884d8" name="Precision" />
                    <Bar dataKey="recall" fill="#82ca9d" name="Recall" />
                    <Bar dataKey="accuracy" fill="#ffc658" name="Accuracy" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Module Details */}
                <div className="grid gap-4">
                  {modulePerformance.map((perf) => (
                    <div key={perf.moduleName} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{perf.moduleName}</h4>
                        <Badge>{perf.decisionCount} decisions</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Precision</div>
                          <div className="font-bold">{(perf.precision * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Recall</div>
                          <div className="font-bold">{(perf.recall * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">F1 Score</div>
                          <div className="font-bold">{(perf.f1Score * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Success Rate</div>
                          <div className="font-bold">{(perf.successRate * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collective Feedback Overview</CardTitle>
              <CardDescription>
                Feedback from humans, AI, and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackSummary && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{feedbackSummary.totalEvents}</div>
                      <div className="text-sm text-muted-foreground">Total Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{feedbackSummary.averageRating.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{feedbackSummary.processedCount}</div>
                      <div className="text-sm text-muted-foreground">Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{feedbackSummary.learningAppliedCount}</div>
                      <div className="text-sm text-muted-foreground">Learning Applied</div>
                    </div>
                  </div>

                  {/* Feedback by Type */}
                  <div>
                    <h4 className="font-semibold mb-2">Feedback by Type</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(feedbackSummary.byType).map(([type, count]) => (
                        <div key={type} className="border rounded p-2">
                          <div className="font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground capitalize">{type}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback by Category */}
                  <div>
                    <h4 className="font-semibold mb-2">Feedback by Category</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(feedbackSummary.byCategory).map(([category, count]) => (
                        <div key={category} className="border rounded p-2">
                          <div className="font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground capitalize">{category}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collective Insights & Suggestions</CardTitle>
              <CardDescription>
                AI-generated insights from system analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {observations.slice(0, 5).map((obs) => (
                  <div key={obs.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold capitalize">{obs.observationType}</span>
                        {getSeverityBadge(obs.severity)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(obs.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{obs.description}</p>
                    {obs.suggestedAction && (
                      <div className="bg-white border rounded p-2 text-sm">
                        <strong>Suggested Action:</strong> {obs.suggestedAction}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <strong>Modules:</strong>
                      {obs.modulesAffected.map(m => (
                        <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {observations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-2" />
                    <p>No insights available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
