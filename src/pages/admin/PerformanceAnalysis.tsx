/**
 * Performance Analysis Dashboard
 * Comprehensive system validation and performance monitoring
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Code,
  Database,
  Gauge,
  Lightbulb,
  Loader2,
  Server,
  Shield,
  TrendingUp,
  Zap,
  XCircle
} from "lucide-react";
import { runSystemValidation, type SystemValidationReport } from "@/utils/system-validator";
import { runCodeAnalysis, getPerformanceMetrics, type CodeAnalysisReport } from "@/utils/code-analyzer";
import { useToast } from "@/hooks/use-toast";

const PerformanceAnalysis: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validationReport, setValidationReport] = useState<SystemValidationReport | null>(null);
  const [analysisReport, setAnalysisReport] = useState<CodeAnalysisReport | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<ReturnType<typeof getPerformanceMetrics> | null>(null);
  const { toast } = useToast();

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Run system validation
      const validation = await runSystemValidation();
      setValidationReport(validation);
      
      // Run code analysis
      const analysis = runCodeAnalysis();
      setAnalysisReport(analysis);
      
      // Get performance metrics
      const metrics = getPerformanceMetrics();
      setPerformanceMetrics(metrics);
      
      toast({
        title: "Analysis Complete",
        description: "System validation and performance analysis completed successfully",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "error":
      case "critical":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
      case "degraded":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Gauge className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-4xl font-bold text-blue-900 mb-2">
            Performance Analysis Dashboard
          </CardTitle>
          <CardDescription className="text-blue-700 text-lg">
            System Validation & Code Quality Monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing System...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-5 w-5" />
                Run Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {validationReport && analysisReport && performanceMetrics && (
        <Tabs defaultValue="validation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="validation">
              <Shield className="w-4 h-4 mr-2" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="issues">
              <Code className="w-4 h-4 mr-2" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Lightbulb className="w-4 h-4 mr-2" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          {/* System Validation Tab */}
          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-6 h-6" />
                  System Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className={getStatusColor(validationReport.overallStatus)}>
                    <CardContent className="pt-6 text-center">
                      {getStatusIcon(validationReport.overallStatus)}
                      <div className="mt-2 font-semibold">Overall Status</div>
                      <div className="text-2xl font-bold mt-1">
                        {validationReport.overallStatus.toUpperCase()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6 text-center">
                      <Gauge className="w-5 h-5 text-blue-600 mx-auto" />
                      <div className="mt-2 font-semibold text-blue-900">Health Score</div>
                      <div className="text-2xl font-bold text-blue-900 mt-1">
                        {validationReport.healthScore}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6 text-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      <div className="mt-2 font-semibold text-green-900">Passed</div>
                      <div className="text-2xl font-bold text-green-900 mt-1">
                        {validationReport.summary.passed}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6 text-center">
                      <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                      <div className="mt-2 font-semibold text-red-900">Errors</div>
                      <div className="text-2xl font-bold text-red-900 mt-1">
                        {validationReport.summary.errors}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg mb-3">Validation Results</h3>
                  <ScrollArea className="h-[400px] pr-4">
                    {validationReport.results.map((result, index) => (
                      <Card key={index} className="mb-3">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              {getStatusIcon(result.status)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{result.category}</span>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="text-muted-foreground">{result.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {result.message}
                                </p>
                                {result.duration && (
                                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {result.duration}ms
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={getStatusColor(result.status)}>
                              {result.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-6 h-6" />
                  Code Quality Issues
                </CardTitle>
                <CardDescription>
                  Found {analysisReport.summary.totalIssues} issues across the codebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6 text-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
                      <div className="mt-2 font-semibold text-red-900">High Severity</div>
                      <div className="text-2xl font-bold text-red-900 mt-1">
                        {analysisReport.summary.highSeverity}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6 text-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mx-auto" />
                      <div className="mt-2 font-semibold text-yellow-900">Medium Severity</div>
                      <div className="text-2xl font-bold text-yellow-900 mt-1">
                        {analysisReport.summary.mediumSeverity}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6 text-center">
                      <Activity className="w-5 h-5 text-blue-600 mx-auto" />
                      <div className="mt-2 font-semibold text-blue-900">Low Severity</div>
                      <div className="text-2xl font-bold text-blue-900 mt-1">
                        {analysisReport.summary.lowSeverity}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {analysisReport.issues.slice(0, 50).map((issue, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                                <Badge variant="outline">{issue.type}</Badge>
                              </div>
                              <p className="font-medium">{issue.message}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {issue.file}
                                {issue.line && `:${issue.line}`}
                              </p>
                              {issue.suggestion && (
                                <Alert className="mt-3 bg-blue-50 border-blue-200">
                                  <Lightbulb className="h-4 w-4 text-blue-600" />
                                  <AlertDescription className="text-blue-900">
                                    {issue.suggestion}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6" />
                  Performance Recommendations
                </CardTitle>
                <CardDescription>
                  Prioritized action items to improve system performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {analysisReport.recommendations.map((rec) => (
                      <Card key={rec.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getPriorityIcon(rec.priority)}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg">{rec.title}</h4>
                                <Badge variant="outline">{rec.priority} priority</Badge>
                                <Badge variant="secondary">{rec.effort} effort</Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{rec.description}</p>
                              <Alert className="bg-green-50 border-green-200">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-900">Expected Impact</AlertTitle>
                                <AlertDescription className="text-green-800">
                                  {rec.impact}
                                </AlertDescription>
                              </Alert>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Current system performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Page Load Time</span>
                        <Badge>{performanceMetrics.pageLoadTime}ms</Badge>
                      </div>
                      <Progress value={Math.min((performanceMetrics.pageLoadTime / 3000) * 100, 100)} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Time to Interactive</span>
                        <Badge>{performanceMetrics.timeToInteractive}ms</Badge>
                      </div>
                      <Progress value={Math.min((performanceMetrics.timeToInteractive / 5000) * 100, 100)} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">First Contentful Paint</span>
                        <Badge>{performanceMetrics.firstContentfulPaint}ms</Badge>
                      </div>
                      <Progress value={Math.min((performanceMetrics.firstContentfulPaint / 2000) * 100, 100)} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Memory Usage</span>
                        <Badge>{performanceMetrics.memoryUsage}MB</Badge>
                      </div>
                      <Progress value={(performanceMetrics.memoryUsage / 200) * 100} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">API Response Time</span>
                        <Badge>{performanceMetrics.apiResponseTime}ms</Badge>
                      </div>
                      <Progress value={(performanceMetrics.apiResponseTime / 1000) * 100} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Bundle Size</span>
                        <Badge>{performanceMetrics.bundleSize}KB</Badge>
                      </div>
                      <Progress value={(performanceMetrics.bundleSize / 2000) * 100} />
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6 bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      Code Quality Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Console Logs</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {analysisReport.metrics.consoleLogCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Any Types</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {analysisReport.metrics.anyTypeCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Empty Catches</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {analysisReport.metrics.emptyCatchCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Heavy Operations</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {analysisReport.metrics.heavyOperationCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Missing Optimizations</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {analysisReport.metrics.missingOptimizationCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unnecessary API Calls</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {analysisReport.metrics.unnecessaryApiCallCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PerformanceAnalysis;
