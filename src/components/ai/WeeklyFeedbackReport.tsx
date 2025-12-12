/**
import { useEffect, useState } from "react";;
 * PATCH 201.0 - Weekly Feedback Report Component
 * Displays AI cognitive feedback reports and insights
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { getWeeklyFeedbackReport, getFeedbackInsights, type WeeklyFeedbackReport, type FeedbackInsight } from "@/ai/feedback-core";
import { logger } from "@/lib/logger";

interface WeeklyFeedbackReportProps {
  vesselId?: string;
  className?: string;
}

export const WeeklyFeedbackReportComponent: React.FC<WeeklyFeedbackReportProps> = ({
  vesselId,
  className,
}) => {
  const [report, setReport] = useState<WeeklyFeedbackReport | null>(null);
  const [insights, setInsights] = useState<FeedbackInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReportData();
  }, [vesselId]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [reportData, insightsData] = await Promise.all([
        getWeeklyFeedbackReport(vesselId),
        getFeedbackInsights(undefined, 7),
      ]);

      setReport(reportData);
      setInsights(insightsData);
    } catch (err) {
      logger.error("Failed to load feedback report:", err);
      setError("Failed to load feedback report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.5) return "text-yellow-600";
    return "text-red-600";
  });

  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" | "outline" => {
    if (confidence >= 0.8) return "default";
    if (confidence >= 0.5) return "secondary";
    return "destructive";
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Weekly AI Feedback Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !report) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Weekly AI Feedback Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "No data available for the selected period."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Weekly AI Feedback Report
        </CardTitle>
        <CardDescription>
          AI performance and operator interaction analysis for the past 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.total_decisions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Acceptance Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="text-2xl font-bold">
                      {(report.acceptance_rate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <Progress value={report.acceptance_rate * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Rejection Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div className="text-2xl font-bold">
                      {(report.rejection_rate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <Progress value={report.rejection_rate * 100} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Top Patterns */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Top Patterns</h3>
              {report.top_patterns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No patterns detected yet.</p>
              ) : (
                <div className="space-y-2">
                  {report.top_patterns.slice(0, 5).map((pattern, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getConfidenceBadgeVariant(pattern.confidence)}>
                                {pattern.pattern_type}
                              </Badge>
                              <span className="text-sm font-medium">{pattern.module}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{pattern.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {pattern.frequency} times
                            </div>
                            <div className={`text-xs ${getConfidenceColor(pattern.confidence)}`}>
                              {(pattern.confidence * 100).toFixed(0)}% confidence
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Key Insights</h3>
              {insights.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No insights available</AlertTitle>
                  <AlertDescription>
                    More data is needed to generate meaningful insights.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <Alert key={idx} className="relative">
                      <div className="flex items-start gap-3">
                        {insight.category === "success_pattern" ? (
                          <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                        ) : insight.category === "rejection_pattern" ? (
                          <TrendingDown className="h-4 w-4 text-red-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-2">
                          <AlertTitle className="flex items-center justify-between">
                            <span>{insight.insight}</span>
                            <Badge variant={getConfidenceBadgeVariant(insight.confidence)} className="ml-2">
                              {(insight.confidence * 100).toFixed(0)}%
                            </Badge>
                          </AlertTitle>
                          <AlertDescription>
                            <div className="text-sm mb-2">
                              Based on {insight.evidence_count} occurrences
                            </div>
                            <div className="text-sm font-medium text-foreground">
                              💡 Recommendation: {insight.recommendation}
                            </div>
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Module Performance</h3>
              {Object.keys(report.module_performance).length === 0 ? (
                <p className="text-sm text-muted-foreground">No module data available.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(report.module_performance)
                    .sort((a, b) => b[1].success_rate - a[1].success_rate)
                    .map(([module, perf]) => (
                      <Card key={module}>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{module}</h4>
                              <Badge variant={perf.success_rate >= 0.7 ? "default" : perf.success_rate >= 0.4 ? "secondary" : "destructive"}>
                                {(perf.success_rate * 100).toFixed(1)}% success
                              </Badge>
                            </div>
                            <Progress value={perf.success_rate * 100} />
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="text-muted-foreground">Total</div>
                                <div className="font-medium">{perf.total}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Accepted</div>
                                <div className="font-medium text-green-600">{perf.accepted}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Rejected</div>
                                <div className="font-medium text-red-600">{perf.rejected}</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WeeklyFeedbackReportComponent;
