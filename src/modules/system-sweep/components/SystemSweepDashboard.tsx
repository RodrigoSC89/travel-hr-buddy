/**
 * PATCH 596 - System Sweep Dashboard
 * UI component for displaying system sweep results
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, RefreshCw, Settings } from "lucide-react";
import { useSweepAudit } from "../hooks/useSweepAudit";
import type { SweepIssue } from "../types";

export function SystemSweepDashboard() {
  const { isRunning, result, error, runSweep, autoFix, clearResult } = useSweepAudit();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "destructive";
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "build":
      return "🔨";
    case "routing":
      return "🛣️";
    case "performance":
      return "⚡";
    case "memory":
      return "💾";
    case "typescript":
      return "📘";
    case "supabase":
      return "🗄️";
    case "console_errors":
      return "⚠️";
    default:
      return "📋";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Sweep</h1>
          <p className="text-muted-foreground">
            Comprehensive system audit and stability check
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runSweep}
            disabled={isRunning}
            size="lg"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Sweep...
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Run System Sweep
              </>
            )}
          </Button>
          {result && (
            <Button onClick={clearResult} variant="outline" size="lg">
              Clear Results
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-5 w-5" />
              Sweep Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error.message}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Issues
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.totalIssues}</div>
                <p className="text-xs text-muted-foreground">
                  Found in {(result.duration / 1000).toFixed(2)}s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Issues
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {result.criticalIssues}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Build Status
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {result.stats.buildStatus.toUpperCase()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Compilation status
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Auto-Fixable
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {result.issues.filter(i => i.autoFixable).length}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={autoFix}
                  disabled={result.issues.filter(i => i.autoFixable).length === 0}
                >
                  Auto-Fix
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle>Detected Issues</CardTitle>
              <CardDescription>
                {result.issues.length} issues found across {new Set(result.issues.map(i => i.category)).size} categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.issues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                    <p>No issues found! System is healthy.</p>
                  </div>
                ) : (
                  result.issues.map((issue: SweepIssue) => (
                    <div
                      key={issue.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                          <div>
                            <h4 className="font-semibold">{issue.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {issue.description}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getSeverityColor(issue.severity) as any}>
                          {issue.severity}
                        </Badge>
                      </div>
                      {issue.file && (
                        <p className="text-xs text-muted-foreground">
                          📁 {issue.file}{issue.line ? `:${issue.line}` : ""}
                        </p>
                      )}
                      {issue.suggestion && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          💡 {issue.suggestion}
                        </p>
                      )}
                      {issue.autoFixable && (
                        <Badge variant="outline" className="text-xs">
                          Auto-fixable
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
