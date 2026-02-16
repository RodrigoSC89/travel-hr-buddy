/**
 * PATCH 210.0 - Cognitive Dashboard
 * Visualizes AI engine evolution, decisions, and predictions
 * Refactored: tab content extracted to cognitive/ sub-components
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Settings, Activity, Filter, RefreshCw } from "lucide-react";
import { predictiveEngine, ModuleRiskScore } from "@/ai/predictiveEngine";
import { tacticalAI, TacticalDecision } from "@/ai/tacticalAI";
import { adaptiveMetricsEngine } from "@/ai/adaptiveMetrics";
import { evoAIConnector, EvolutionReport } from "@/ai/evoAIConnector";
import { logger } from "@/lib/logger";
import { TimeRange, filterByTimeRange } from "./cognitive/types";
import { PredictionsTab } from "./cognitive/PredictionsTab";
import { DecisionsTab } from "./cognitive/DecisionsTab";
import { AdjustmentsTab } from "./cognitive/AdjustmentsTab";
import { EvolutionTab } from "./cognitive/EvolutionTab";

export const CognitiveDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("predictions");
  const [predictions, setPredictions] = useState<ModuleRiskScore[]>([]);
  const [decisions, setDecisions] = useState<TacticalDecision[]>([]);
  const [parameters, setParameters] = useState<unknown>(null);
  const [evolutionReport, setEvolutionReport] = useState<EvolutionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<TimeRange>("24h");

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => { if (isMounted) await loadDashboardData(); };
    loadData();
    const interval = setInterval(() => { if (isMounted) loadData(); }, 30000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const recentPredictions = await predictiveEngine.getRecentPredictions(50);
      setPredictions(recentPredictions as unknown as typeof predictions);
      const decisionHistory = await tacticalAI.getDecisionHistory(undefined, 50);
      setDecisions(decisionHistory);
      const params = adaptiveMetricsEngine.getAllParameters();
      setParameters(params);
      const report = await evoAIConnector.getLatestReport();
      setEvolutionReport(report);
      setLoading(false);
    } catch (error) {
      logger.error("[CognitiveDashboard] Failed to load data:", error);
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter(p => {
    const pred = p as unknown as { module_name?: string; moduleName?: string; predicted_at?: string; predictedAt?: string };
    const moduleName = pred.module_name || pred.moduleName;
    const predictedAt = pred.predicted_at || pred.predictedAt;
    if (filterModule !== "all" && moduleName !== filterModule) return false;
    return filterByTimeRange(predictedAt || "", filterTimeRange);
  });

  const filteredDecisions = decisions.filter(d => {
    if (filterModule !== "all" && d.moduleName !== filterModule) return false;
    return filterByTimeRange(d.timestamp, filterTimeRange);
  });

  const uniqueModules = Array.from(new Set([
    ...predictions.map(p => {
      const pred = p as unknown as { module_name?: string; moduleName?: string };
      return pred.module_name || pred.moduleName || "";
    }),
    ...decisions.map(d => d.moduleName)
  ]));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Cognitive Dashboard</h1>
            <p className="text-muted-foreground">AI Intelligence & Evolution Monitor</p>
          </div>
        </div>
        <Button onClick={loadDashboardData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Module</label>
            <select className="w-full p-2 border rounded-md" value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
              <option value="all">All Modules</option>
              {uniqueModules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <select className="w-full p-2 border rounded-md" value={filterTimeRange} onChange={(e) => setFilterTimeRange(e.target.value as TimeRange)}>
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions"><TrendingUp className="mr-2 h-4 w-4" />Predictions</TabsTrigger>
          <TabsTrigger value="decisions"><Activity className="mr-2 h-4 w-4" />Tactical Decisions</TabsTrigger>
          <TabsTrigger value="adjustments"><Settings className="mr-2 h-4 w-4" />Self-Adjustments</TabsTrigger>
          <TabsTrigger value="evolution"><Brain className="mr-2 h-4 w-4" />Evolution Score</TabsTrigger>
        </TabsList>
        <TabsContent value="predictions" className="space-y-4">
          <PredictionsTab predictions={filteredPredictions} loading={loading} />
        </TabsContent>
        <TabsContent value="decisions" className="space-y-4">
          <DecisionsTab decisions={filteredDecisions} loading={loading} />
        </TabsContent>
        <TabsContent value="adjustments" className="space-y-4">
          <AdjustmentsTab parameters={parameters} loading={loading} />
        </TabsContent>
        <TabsContent value="evolution" className="space-y-4">
          <EvolutionTab evolutionReport={evolutionReport} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
