/**
 * System Benchmark Dashboard
 * PATCH 541 Phase 3 - Performance Validation UI
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, Cpu, TrendingUp, Zap } from "lucide-react";
import { cpuBenchmark, BenchmarkReport } from "@/lib/performance/cpu-benchmark";
import { logger } from "@/lib/logger";

export default function SystemBenchmark() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<BenchmarkReport | null>(null);

  const runBenchmark = async () => {
    setIsRunning(true);
    try {
      const result = await cpuBenchmark.runBenchmark();
      setReport(result);
    } catch (error) {
      logger.error("System benchmark failed", { error });
    } finally {
      setIsRunning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      excellent: "default",
      good: "secondary",
      acceptable: "outline",
      poor: "destructive"
    } as const;
    return variants[status as keyof typeof variants] || "outline";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Performance Benchmark</h1>
          <p className="text-muted-foreground">
            Validate CPU performance and system capabilities
          </p>
        </div>
        <Button 
          onClick={runBenchmark} 
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? (
            <>
              <Activity className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Run Benchmark
            </>
          )}
        </Button>
      </div>

      {report && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Overall Performance Score
              </CardTitle>
              <CardDescription>
                Tested on {new Date(report.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(report.totalScore)}`}>
                    {report.totalScore}
                  </div>
                  <p className="text-muted-foreground mt-2">out of 100</p>
                </div>
                <Progress value={report.totalScore} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {report.tests.map((test, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{test.testName}</CardTitle>
                    <Badge variant={getStatusBadge(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Execution Time
                    </span>
                    <span className="font-mono font-medium">
                      {test.executionTime}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Operations/sec
                    </span>
                    <span className="font-mono font-medium">
                      {test.operationsPerSecond.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Progress value={test.score} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Score: {test.score}/100
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">CPU Cores</dt>
                  <dd className="font-medium">{report.systemInfo.cores}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Memory Limit</dt>
                  <dd className="font-medium">
                    {report.systemInfo.memory > 0 
                      ? `${report.systemInfo.memory} MB` 
                      : "N/A"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">User Agent</dt>
                  <dd className="font-mono text-xs mt-1">
                    {report.systemInfo.userAgent}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </>
      )}

      {!report && !isRunning && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Cpu className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Click "Run Benchmark" to test system performance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
