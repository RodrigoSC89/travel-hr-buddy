import { useEffect, useState, useMemo } from "react";;

/**
 * PATCH 210.0 - Cognitive Dashboard
 * Visualizes AI engine evolution, decisions, and predictions
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  TrendingUp, 
  Settings, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw
} from "lucide-react";
import { predictiveEngine, ModuleRiskScore } from "@/ai/predictiveEngine";
import { tacticalAI, TacticalDecision } from "@/ai/tacticalAI";
import { adaptiveMetricsEngine } from "@/ai/adaptiveMetrics";
import { evoAIConnector, EvolutionReport } from "@/ai/evoAIConnector";
import { logger } from "@/lib/logger";

export const CognitiveDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("predictions");
  const [predictions, setPredictions] = useState<ModuleRiskScore[]>([]);
  const [decisions, setDecisions] = useState<TacticalDecision[]>([]);
  const [parameters, setParameters] = useState<unknown>(null);
  const [evolutionReport, setEvolutionReport] = useState<EvolutionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h");

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await loadDashboardData();
      }
    };
    
    loadData();
    const interval = setInterval(() => {
      if (isMounted) {
        loadData();
      }
    }, 30000); // Refresh every 30s
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load predictions
      const recentPredictions = await predictiveEngine.getRecentPredictions(50);
      setPredictions(recentPredictions as unknown);

      // Load tactical decisions
      const decisionHistory = await tacticalAI.getDecisionHistory(undefined, 50);
      setDecisions(decisionHistory);

      // Load adaptive parameters
      const params = adaptiveMetricsEngine.getAllParameters();
      setParameters(params);

      // Load evolution report
      const report = await evoAIConnector.getLatestReport();
      setEvolutionReport(report);

      setLoading(false);
    } catch (error) {
      logger.error("[CognitiveDashboard] Failed to load data:", error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
    case "critical": return "bg-red-500";
    case "high": return "bg-orange-500";
    case "medium": return "bg-yellow-500";
    case "low": return "bg-green-500";
    default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical": return "destructive";
    case "high": return "default";
    case "medium": return "secondary";
    case "low": return "outline";
    default: return "outline";
    }
  };

  const formatTimestamp = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString();
  };

  const filteredPredictions = predictions.filter(p => {
    if (filterModule !== "all" && p.module_name !== filterModule) return false;
    // Filter by time range
    const predTime = new Date(p.predicted_at).getTime();
    const now = Date.now();
    const ranges = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    return now - predTime <= ranges[filterTimeRange];
  };

  const filteredDecisions = decisions.filter(d => {
    if (filterModule !== "all" && d.moduleName !== filterModule) return false;
    const decTime = d.timestamp.getTime();
    const now = Date.now();
    const ranges = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    return now - decTime <= ranges[filterTimeRange];
  };

  const uniqueModules = Array.from(new Set([
    ...predictions.map(p => p.module_name),
    ...decisions.map(d => d.moduleName)
  ]));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Cognitive Dashboard</h1>
            <p className="text-muted-foreground">AI Intelligence & Evolution Monitor</p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Module</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filterModule}
              onChange={handleChange}
            >
              <option value="all">All Modules</option>
              {uniqueModules.map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filterTimeRange}
              onChange={handleChange}
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">
            <TrendingUp className="mr-2 h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="decisions">
            <Activity className="mr-2 h-4 w-4" />
            Tactical Decisions
          </TabsTrigger>
          <TabsTrigger value="adjustments">
            <Settings className="mr-2 h-4 w-4" />
            Self-Adjustments
          </TabsTrigger>
          <TabsTrigger value="evolution">
            <Brain className="mr-2 h-4 w-4" />
            Evolution Score
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Risk Predictions</CardTitle>
              <CardDescription>
                AI-powered forecasts of potential failures and overloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading predictions...</div>
              ) : filteredPredictions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No predictions available
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPredictions.map((pred, idx) => (
                    <div
                      key={idx}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{pred.module_name}</h3>
                            <Badge className={getRiskColor(pred.risk_level)}>
                              {pred.risk_level}
                            </Badge>
                            <Badge variant="outline">
                              {pred.forecast_event}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Risk Score:</span>
                              <span className="font-medium">{pred.risk_score}/100</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Confidence:</span>
                              <span className="font-medium">
                                {((pred.confidence || 0) * 100).toFixed(0)}%
                              </span>
                            </div>
                            {pred.factors && pred.factors.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm text-muted-foreground">Factors:</span>
                                <ul className="list-disc list-inside text-sm mt-1">
                                  {pred.factors.map((factor, fidx) => (
                                    <li key={fidx}>{factor}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {formatTimestamp(pred.predicted_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tactical Decisions Tab */}
        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tactical AI Decisions</CardTitle>
              <CardDescription>
                Automated operational decisions and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading decisions...</div>
              ) : filteredDecisions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No decisions available
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDecisions.map((decision) => (
                    <div
                      key={decision.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{decision.moduleName}</h3>
                            <Badge variant={getPriorityColor(decision.priority) as unknown}>
                              {decision.priority}
                            </Badge>
                            {decision.executed && (
                              decision.success ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Action:</span>
                              <span className="font-medium">{decision.action}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {decision.reason}
                            </div>
                            {decision.error && (
                              <div className="text-sm text-red-500 mt-2">
                                Error: {decision.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {formatTimestamp(decision.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Self-Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Parameters</CardTitle>
              <CardDescription>
                Self-tuned system parameters and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !parameters ? (
                <div className="text-center py-8">Loading parameters...</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(parameters).map(([key, param]: [string, any]) => {
                    const deltaPercent = ((param.currentValue - param.defaultValue) / param.defaultValue * 100).toFixed(1);
                    const isAdjusted = Math.abs(parseFloat(deltaPercent)) > 5;
                    
                    return (
                      <div key={key} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{key}</h3>
                          {isAdjusted && (
                            <Badge variant="secondary">Adjusted</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current:</span>
                            <span className="ml-2 font-medium">
                              {param.currentValue} {param.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Default:</span>
                            <span className="ml-2">
                              {param.defaultValue} {param.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Delta:</span>
                            <span className={`ml-2 font-medium ${parseFloat(deltaPercent) > 0 ? "text-orange-500" : "text-green-500"}`}>
                              {deltaPercent}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Adjustments:</span>
                            <span className="ml-2">{param.adjustmentCount}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolution Tab */}
        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Evolution</CardTitle>
              <CardDescription>
                AI learning progress and performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !evolutionReport ? (
                <div className="text-center py-8">Loading evolution data...</div>
              ) : (
                <div className="space-y-6">
                  {/* Evolution Score */}
                  <div className="p-6 border rounded-lg bg-primary/5">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Evolution Score</h3>
                      <div className="text-5xl font-bold text-primary mb-2">
                        {evolutionReport.evolutionScore.toFixed(0)}
                      </div>
                      <Badge variant="outline">
                        {evolutionReport.performanceScore.trend}
                      </Badge>
                    </div>
                  </div>

                  {/* Performance Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">
                        {(evolutionReport.performanceScore.overall * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Overall</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">
                        {(evolutionReport.performanceScore.prediction * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Prediction</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">
                        {(evolutionReport.performanceScore.adaptation * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Adaptation</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">
                        {(evolutionReport.performanceScore.tactical * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Tactical</div>
                    </div>
                  </div>

                  {/* Insights */}
                  {evolutionReport.insights && evolutionReport.insights.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Key Insights</h3>
                      <div className="space-y-2">
                        {evolutionReport.insights.map((insight, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{insight.pattern}</span>
                              <Badge variant={
                                insight.impact === "high" ? "destructive" :
                                  insight.impact === "medium" ? "default" : "secondary"
                              }>
                                {insight.impact}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {insight.recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
