/**
 * Module Tester UI Component
 * PATCH 84.0 - Real Module Usage Checklist
 * 
 * Provides a UI to run module tests and view results
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  testAllModules,
  generateMarkdownReport,
  getModuleTestStats,
  type ModuleTestResult,
} from '@/lib/dev/module-tester';
import { Download, Play, RefreshCw, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export function ModuleTesterUI() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentModule, setCurrentModule] = useState('');
  const [results, setResults] = useState<ModuleTestResult[]>([]);
  const [report, setReport] = useState('');
  const [stats, setStats] = useState(getModuleTestStats());

  useEffect(() => {
    // Load stats on mount
    setStats(getModuleTestStats());
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setReport('');

    try {
      const testResults = await testAllModules((current, total, moduleName) => {
        setProgress((current / total) * 100);
        setCurrentModule(moduleName);
      });

      setResults(testResults);

      // Generate markdown report
      const markdownReport = generateMarkdownReport(testResults);
      setReport(markdownReport);

      // Update stats
      setStats(getModuleTestStats());
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
      setCurrentModule('');
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modules_status_table_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
  };

  const getStatusColor = (status: ModuleTestResult['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500';
      case 'partial':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: ModuleTestResult['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const readyCount = results.filter((r) => r.status === 'ready').length;
  const partialCount = results.filter((r) => r.status === 'partial').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Tester</h1>
          <p className="text-muted-foreground">PATCH 84.0 - Real Module Usage Checklist</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
          {report && (
            <>
              <Button onClick={copyToClipboard} variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Copy Report
              </Button>
              <Button onClick={downloadReport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Modules Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.modulesCovered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg AI Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgAIConfidence.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {stats.lastTestTime
                ? new Date(stats.lastTestTime).toLocaleString()
                : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Testing in Progress</CardTitle>
            <CardDescription>Testing module: {currentModule}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{progress.toFixed(0)}% complete</p>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
            <CardDescription>
              {results.length} modules tested on {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{readyCount}</div>
                <div className="text-sm text-muted-foreground">✅ Ready</div>
                <div className="text-xs text-muted-foreground">
                  {((readyCount / results.length) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{partialCount}</div>
                <div className="text-sm text-muted-foreground">🟡 Partial</div>
                <div className="text-xs text-muted-foreground">
                  {((partialCount / results.length) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{failedCount}</div>
                <div className="text-sm text-muted-foreground">🔴 Failed</div>
                <div className="text-xs text-muted-foreground">
                  {((failedCount / results.length) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Module Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Module ID</th>
                    <th className="text-left p-2">Module Name</th>
                    <th className="text-left p-2">Route</th>
                    <th className="text-center p-2">AI</th>
                    <th className="text-center p-2">Logs</th>
                    <th className="text-left p-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {results
                    .sort((a, b) => {
                      const statusOrder = { failed: 0, partial: 1, ready: 2 };
                      return statusOrder[a.status] - statusOrder[b.status];
                    })
                    .map((result) => (
                      <tr key={result.moduleId} className="border-b hover:bg-muted/50">
                        <td className="p-2">{getStatusIcon(result.status)}</td>
                        <td className="p-2">
                          <code className="text-xs">{result.moduleId}</code>
                        </td>
                        <td className="p-2 font-medium">{result.moduleName}</td>
                        <td className="p-2">
                          <code className="text-xs">{result.route || '-'}</code>
                        </td>
                        <td className="p-2 text-center">
                          {result.details.aiCallSuccessful ? '✓' : '✗'}
                        </td>
                        <td className="p-2 text-center">
                          {result.details.logSaved ? '✓' : '✗'}
                        </td>
                        <td className="p-2 text-xs">
                          {result.errors.length > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              {result.errors[0]}
                            </Badge>
                          ) : result.warnings.length > 0 ? (
                            <Badge variant="secondary" className="text-xs">
                              {result.warnings[0]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Preview */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Markdown Report Preview</CardTitle>
            <CardDescription>This report can be saved to /dev/checklists/modules_status_table.md</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto">
              {report}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
