import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { AlertCircle, CheckCircle, XCircle, RefreshCw, TrendingUp, AlertTriangle, FileText, Database, Zap } from "lucide-react";
import { systemValidator, SystemValidationReport } from "@/utils/system-validator";
import { codeAnalyzer, AnalysisReport, CodeIssue, Recommendation } from "@/utils/code-analyzer";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PerformanceAnalysis() {
  const [loading, setLoading] = useState(false);
  const [validationReport, setValidationReport] = useState<SystemValidationReport | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const [validation, analysis] = await Promise.all([
        systemValidator.validateSystem(),
        codeAnalyzer.analyzeCode(),
      ]);
      
      setValidationReport(validation);
      setAnalysisReport(analysis);
      setLastRun(new Date());
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "failed":
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper>
        <ModuleHeader
          icon={TrendingUp}
          title="Performance Analysis"
          description="System validation, performance monitoring, and code quality analysis"
        />

        <div className="mb-6 flex items-center justify-between">
          <div>
            {lastRun && (
              <p className="text-sm text-muted-foreground">
                Last analysis: {lastRun.toLocaleString()}
              </p>
            )}
          </div>
          <Button onClick={runAnalysis} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Running Analysis..." : "Run Analysis"}
          </Button>
        </div>

        {/* Overall Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {validationReport && getStatusIcon(validationReport.overallStatus)}
                <div className="text-2xl font-bold capitalize">
                  {validationReport?.overallStatus || "Loading..."}
                </div>
              </div>
              {validationReport && (
                <p className="text-xs text-muted-foreground mt-1">
                  {validationReport.summary.passed} passed, {validationReport.summary.failed} failed
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Code Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analysisReport?.summary.totalIssues || 0}
              </div>
              {analysisReport && (
                <p className="text-xs text-muted-foreground mt-1">
                  {analysisReport.summary.highPriority} high priority
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Load</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analysisReport?.metrics.pageLoadTime
                  ? `${Math.round(analysisReport.metrics.pageLoadTime)}ms`
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Initial load time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analysisReport?.metrics.memoryUsage
                  ? `${Math.round(analysisReport.metrics.memoryUsage)}MB`
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                JS heap size
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="validation" className="space-y-4">
          <TabsList>
            <TabsTrigger value="validation">System Validation</TabsTrigger>
            <TabsTrigger value="issues">Code Issues</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          </TabsList>

          {/* System Validation Tab */}
          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Validation Results</CardTitle>
                <CardDescription>
                  Connectivity and functional validation checks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {validationReport && (
                  <div className="space-y-4">
                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Health Score</span>
                        <span>
                          {Math.round((validationReport.summary.passed / validationReport.summary.total) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(validationReport.summary.passed / validationReport.summary.total) * 100} 
                      />
                    </div>

                    {/* Results by category */}
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {validationReport.results.map((result, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                            {getStatusIcon(result.status)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{result.name}</h4>
                                <Badge variant={getSeverityColor(result.status) as any}>
                                  {result.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {result.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            <div className="grid gap-4">
              {/* High Priority Issues */}
              {analysisReport && analysisReport.summary.highPriority > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span>High Priority Issues ({analysisReport.summary.highPriority})</span>
                    </CardTitle>
                    <CardDescription>Critical issues that need immediate attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {analysisReport.issues
                          .filter(issue => issue.severity === "high")
                          .map((issue, index) => (
                            <IssueCard key={index} issue={issue} />
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Medium Priority Issues */}
              {analysisReport && analysisReport.summary.mediumPriority > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span>Medium Priority Issues ({analysisReport.summary.mediumPriority})</span>
                    </CardTitle>
                    <CardDescription>Issues that should be addressed soon</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {analysisReport.issues
                          .filter(issue => issue.severity === "medium")
                          .map((issue, index) => (
                            <IssueCard key={index} issue={issue} />
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Low Priority Issues */}
              {analysisReport && analysisReport.summary.lowPriority > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                      <span>Low Priority Issues ({analysisReport.summary.lowPriority})</span>
                    </CardTitle>
                    <CardDescription>Minor improvements and optimizations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {analysisReport.issues
                          .filter(issue => issue.severity === "low")
                          .map((issue, index) => (
                            <IssueCard key={index} issue={issue} />
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {analysisReport?.recommendations.map((rec, index) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Performance Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Current system performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisReport && (
                    <div className="space-y-4">
                      <MetricRow
                        label="Page Load Time"
                        value={analysisReport.metrics.pageLoadTime ? `${Math.round(analysisReport.metrics.pageLoadTime)}ms` : "N/A"}
                        good={!analysisReport.metrics.pageLoadTime || analysisReport.metrics.pageLoadTime < 2000}
                      />
                      <MetricRow
                        label="Render Time"
                        value={analysisReport.metrics.renderTime ? `${Math.round(analysisReport.metrics.renderTime)}ms` : "N/A"}
                        good={!analysisReport.metrics.renderTime || analysisReport.metrics.renderTime < 1000}
                      />
                      <MetricRow
                        label="Memory Usage"
                        value={analysisReport.metrics.memoryUsage ? `${Math.round(analysisReport.metrics.memoryUsage)}MB` : "N/A"}
                        good={!analysisReport.metrics.memoryUsage || analysisReport.metrics.memoryUsage < 100}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary Statistics</CardTitle>
                  <CardDescription>Overview of analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>System Health</span>
                        <span className="font-semibold">
                          {validationReport ? `${Math.round((validationReport.summary.passed / validationReport.summary.total) * 100)}%` : "N/A"}
                        </span>
                      </div>
                      <Progress value={validationReport ? (validationReport.summary.passed / validationReport.summary.total) * 100 : 0} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold">{validationReport?.summary.passed || 0}</div>
                        <div className="text-xs text-muted-foreground">Passed Checks</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold">{validationReport?.summary.failed || 0}</div>
                        <div className="text-xs text-muted-foreground">Failed Checks</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold">{analysisReport?.summary.totalIssues || 0}</div>
                        <div className="text-xs text-muted-foreground">Code Issues</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold">{analysisReport?.recommendations.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Recommendations</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}

// Helper Components
function IssueCard({ issue }: { issue: CodeIssue }) {
  return (
    <div className="p-3 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant={getSeverityColorForBadge(issue.severity)}>
          {issue.severity.toUpperCase()}
        </Badge>
        <span className="text-xs text-muted-foreground">{issue.category}</span>
      </div>
      <div>
        <p className="font-semibold text-sm">{issue.file}{issue.line ? `:${issue.line}` : ""}</p>
        <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
      </div>
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Suggestion</AlertTitle>
        <AlertDescription>{issue.suggestion}</AlertDescription>
      </Alert>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          <div className="flex space-x-2">
            <Badge variant={getPriorityColorForBadge(recommendation.priority)}>
              {recommendation.priority.toUpperCase()} PRIORITY
            </Badge>
            <Badge variant="outline">
              {recommendation.effort.toUpperCase()} EFFORT
            </Badge>
          </div>
        </div>
        <CardDescription>{recommendation.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{recommendation.description}</p>
        <div className="bg-muted p-3 rounded">
          <p className="text-sm font-semibold mb-1">Expected Impact:</p>
          <p className="text-sm text-muted-foreground">{recommendation.impact}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="font-semibold">{value}</span>
        {good ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        )}
      </div>
    </div>
  );
}

function getSeverityColorForBadge(severity: string): "destructive" | "default" | "secondary" | "outline" {
  switch (severity) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
}

function getPriorityColorForBadge(priority: string): "destructive" | "default" | "secondary" | "outline" {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
}
