import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Cpu,
  Zap,
  Code,
  FileText
} from 'lucide-react';
import { runSystemValidation, type SystemHealthReport } from '@/utils/system-validator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const PerformanceAnalysisDashboard = () => {
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runValidation = async () => {
    setLoading(true);
    try {
      const result = await runSystemValidation();
      setReport(result);
      setLastCheck(new Date());
      toast.success('System validation completed');
    } catch (error) {
      toast.error('Failed to run system validation');
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-validation-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  if (loading && !report) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Performance Analysis</h1>
          <p className="text-muted-foreground">
            Nautilus One - Health & Performance Monitoring
          </p>
          {lastCheck && (
            <p className="text-sm text-muted-foreground mt-1">
              Last check: {lastCheck.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={runValidation} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Analysis
          </Button>
          <Button onClick={downloadReport} variant="outline" disabled={!report}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {report && (
        <Card className={`border-2 ${getStatusColor(report.overall_status)}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(report.overall_status)}
                <div>
                  <CardTitle>Overall System Status</CardTitle>
                  <CardDescription>
                    {report.overall_status === 'healthy' 
                      ? 'All systems operational' 
                      : report.overall_status === 'degraded'
                      ? 'Some issues detected'
                      : 'Critical issues require attention'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(report.overall_status)}>
                {report.overall_status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Main Content */}
      {report && (
        <Tabs defaultValue="functional" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="functional" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Functional
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              AI & Embeddings
            </TabsTrigger>
            <TabsTrigger value="connectivity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Connectivity
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          {/* Functional Checks */}
          <TabsContent value="functional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Functional Checks</CardTitle>
                <CardDescription>
                  Core functionality and database connectivity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.checks.functional.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{check.message}</h4>
                        <Badge variant="outline" className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                      {check.details && (
                        <p className="text-sm text-muted-foreground">
                          {typeof check.details === 'string' 
                            ? check.details 
                            : JSON.stringify(check.details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Metrics */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* API Response Times */}
              <Card>
                <CardHeader>
                  <CardTitle>API Response Times</CardTitle>
                  <CardDescription>Average response time per endpoint</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(report.metrics.api_response_times).map(([path, time]) => (
                    <div key={path} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{path}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${time > 200 ? 'text-red-500' : 'text-green-500'}`}>
                          {time}ms
                        </span>
                        {time > 200 ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Code Quality Issues */}
              <Card>
                <CardHeader>
                  <CardTitle>Code Quality Issues</CardTitle>
                  <CardDescription>Issues detected in codebase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Console Logs</span>
                    <Badge variant={report.metrics.code_quality_issues.console_logs > 10 ? 'destructive' : 'secondary'}>
                      {report.metrics.code_quality_issues.console_logs}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Any Types</span>
                    <Badge variant={report.metrics.code_quality_issues.any_types > 5 ? 'destructive' : 'secondary'}>
                      {report.metrics.code_quality_issues.any_types}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Empty Catches</span>
                    <Badge variant={report.metrics.code_quality_issues.empty_catches > 0 ? 'destructive' : 'secondary'}>
                      {report.metrics.code_quality_issues.empty_catches}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Missing Error Handling</span>
                    <Badge variant={report.metrics.code_quality_issues.missing_error_handling > 0 ? 'destructive' : 'secondary'}>
                      {report.metrics.code_quality_issues.missing_error_handling}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Heavy Operations */}
            {report.metrics.heavy_operations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Heavy Operations Detected
                  </CardTitle>
                  <CardDescription>
                    Operations that may cause performance issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.metrics.heavy_operations.map((op, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        {op}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Checks */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI & Embeddings Status</CardTitle>
                <CardDescription>
                  OpenAI integration and AI features health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.checks.ai.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{check.message}</h4>
                        <Badge variant="outline" className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                      {check.details && (
                        <p className="text-sm text-muted-foreground">
                          {typeof check.details === 'string' 
                            ? check.details 
                            : JSON.stringify(check.details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connectivity */}
          <TabsContent value="connectivity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connectivity & Integrations</CardTitle>
                <CardDescription>
                  Supabase, Edge Functions, and external services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.checks.connectivity.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{check.message}</h4>
                        <Badge variant="outline" className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                      {check.details && (
                        <p className="text-sm text-muted-foreground">
                          {typeof check.details === 'string' 
                            ? check.details 
                            : JSON.stringify(check.details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
                <CardDescription>
                  Prioritized list of improvements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(rec.priority) as 'destructive' | 'default' | 'secondary' | 'outline'}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{rec.category}</Badge>
                      </div>
                    </div>
                    <h4 className="font-semibold">{rec.issue}</h4>
                    <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                    <div className="pt-2 border-t">
                      <p className="text-sm">
                        <span className="font-medium">Impact:</span> {rec.impact}
                      </p>
                    </div>
                    {rec.files && rec.files.length > 0 && (
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-1">Affected files:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {rec.files.map((file, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Code className="h-3 w-3" />
                              {file}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PerformanceAnalysisDashboard;
