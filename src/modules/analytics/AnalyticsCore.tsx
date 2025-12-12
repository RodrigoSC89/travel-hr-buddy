/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 101.0 - Analytics Core Complete
 * Enhanced with data collection, custom dashboards, AI insights, and export functionality
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, TrendingDown, Activity, Download, Brain, Database, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { dataCollector } from "./services/data-collector";
import { aiInsightsService } from "./services/ai-insights";
import { exportService } from "./services/export-service";
import { KPIMetric, AIInsight, DataSource } from "./types";

const AnalyticsCore = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const kpiMetrics = await dataCollector.collectKPIMetrics();
    const sources = dataCollector.getAllSources();
    setMetrics(kpiMetrics);
    setDataSources(sources);
  };

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    toast({
      title: "Generating AI Insights",
      description: "Analyzing KPI data with runAIContext..."
    };

    try {
      const generatedInsights = await aiInsightsService.generateKPIInsights();
      setInsights(generatedInsights);
      toast({
        title: "Insights Generated",
        description: `${generatedInsights.length} AI insights have been generated`
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate insights",
        variant: "destructive"
      };
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleExportPDF = async () => {
    toast({
      title: "Exporting to PDF",
      description: "Generating analytics report..."
    };

    try {
      const consumptionData = await dataCollector.collectConsumptionVsPerformance();
      const downtimeData = await dataCollector.collectDowntimeVsEfficiency();

      await exportService.exportToPDF(
        "Analytics Report",
        [
          { name: "Consumption vs Performance", data: consumptionData },
          { name: "Downtime vs Efficiency", data: downtimeData }
        ],
        metrics
      );

      toast({
        title: "Export Complete",
        description: "PDF report has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not generate PDF report",
        variant: "destructive"
      });
    }
  };

  const handleExportCSV = async () => {
    toast({
      title: "Exporting to CSV",
      description: "Generating CSV file..."
    };

    try {
      await exportService.exportToCSV(
        "KPI Metrics Export",
        metrics,
        ["name", "value", "unit", "trend", "change", "category"]
      );

      toast({
        title: "Export Complete",
        description: "CSV file has been downloaded"
      };
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not generate CSV file",
        variant: "destructive"
      });
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      prediction: "default",
      recommendation: "secondary",
      alert: "destructive"
    };
    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Analytics Core</h1>
            <p className="text-muted-foreground">
              Comprehensive analytics with AI insights and predictive analysis
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Data Sources Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {dataSources.map((source) => (
          <Card key={source.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{source.recordCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {source.isConnected ? "Connected" : "Disconnected"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="dashboards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="kpi">KPI Metrics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consumption vs Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Consumption vs Performance</CardTitle>
                <CardDescription>Comparative analysis over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-muted-foreground">
                      Consumption trending down (-5.2%)<br />
                      Performance improving (+3.1%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Downtime vs Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Downtime vs Efficiency</CardTitle>
                <CardDescription>Weekly operational metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-muted-foreground">
                      Downtime reduced to 2.1h<br />
                      Efficiency at 92%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Real-time metrics from all data sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{metric.name}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{metric.value}</span>
                      <span className="text-muted-foreground">{metric.unit}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={metric.change < 0 ? "default" : "secondary"}>
                        {metric.change > 0 ? "+" : ""}{metric.change}%
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">
                        {metric.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Predictive analytics using runAIContext("kpi-insights")
                </CardDescription>
              </div>
              <Button onClick={handleGenerateInsights} disabled={isLoadingInsights}>
                <Brain className="h-4 w-4 mr-2" />
                {isLoadingInsights ? "Generating..." : "Generate Insights"}
              </Button>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    No AI insights generated yet
                  </p>
                  <Button onClick={handleGenerateInsights} disabled={isLoadingInsights}>
                    Generate Insights
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{insight.title}</h3>
                            {getInsightBadge(insight.type)}
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Confidence: {insight.confidence.toFixed(1)}%</span>
                        <span>{insight.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsCore;
