/**
import { useState } from "react";;
 * PATCH 442 - SATCOM Diagnostic Panel
 * Interactive test panel for SATCOM failover testing
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  TestTube, 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Activity
} from "lucide-react";
import type { SatcomConnection } from "../index";
import { satcomFailoverService } from "../services/failover-service";

interface DiagnosticPanelProps {
  connections: SatcomConnection[];
  vesselId: string;
  onTestComplete?: () => void;
}

type TestType = 
  | "connection_loss" 
  | "failover" 
  | "recovery" 
  | "full_cycle"
  | "stress_test";

interface TestResult {
  type: TestType;
  success: boolean;
  duration: number;
  message: string;
  timestamp: Date;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  connections,
  vesselId,
  onTestComplete,
}) => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<TestType | null>(null);

  const runTest = async (testType: TestType) => {
    setIsRunningTest(true);
    setCurrentTest(testType);
    const startTime = Date.now();

    try {
      switch (testType) {
      case "connection_loss":
        await testConnectionLoss();
        break;
      case "failover":
        await testFailover();
        break;
      case "recovery":
        await testRecovery();
        break;
      case "full_cycle":
        await testFullCycle();
        break;
      case "stress_test":
        await testStress();
        break;
      }

      const duration = Date.now() - startTime;
      const result: TestResult = {
        type: testType,
        success: true,
        duration,
        message: `Test completed successfully in ${(duration / 1000).toFixed(2)}s`,
        timestamp: new Date(),
      };

      setTestResults((prev) => [result, ...prev.slice(0, 9)]);
      toast.success(result.message);
      onTestComplete?.();
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        type: testType,
        success: false,
        duration,
        message: `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      };

      setTestResults((prev) => [result, ...prev.slice(0, 9)]);
      toast.error(result.message);
    } finally {
      setIsRunningTest(false);
      setCurrentTest(null);
    }
  };

  const testConnectionLoss = async () => {
    const primaryConn = connections.find((c) => c.status === "connected");
    if (!primaryConn) {
      throw new Error("No active connection to test");
    }

    await satcomFailoverService.simulateConnectionLoss(
      vesselId,
      primaryConn.id,
      primaryConn.provider,
      "Diagnostic test - simulated connection loss"
    );

    // Wait for simulated recovery
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Log restoration
    await satcomFailoverService.logFailover({
      vessel_id: vesselId,
      event_type: "connection_restored",
      to_provider: primaryConn.provider,
      to_connection_id: primaryConn.id,
      reason: "Diagnostic test - connection restored",
      success: true,
    });
  };

  const testFailover = async () => {
    const activeConn = connections.find((c) => c.status === "connected");
    const fallbackConn = connections.find(
      (c) => c.status !== "disconnected" && c.id !== activeConn?.id
    );

    if (!activeConn || !fallbackConn) {
      throw new Error("Not enough connections for failover test");
    }

    await satcomFailoverService.simulateFailoverTest(
      vesselId,
      activeConn.id,
      fallbackConn.id,
      activeConn.provider,
      fallbackConn.provider
    );
  };

  const testRecovery = async () => {
    const disconnectedConn = connections.find((c) => c.status === "disconnected");
    if (!disconnectedConn) {
      throw new Error("No disconnected connection to test recovery");
    }

    await satcomFailoverService.logFailover({
      vessel_id: vesselId,
      event_type: "recovery_initiated",
      to_provider: disconnectedConn.provider,
      to_connection_id: disconnectedConn.id,
      reason: "Diagnostic test - recovery initiated",
      success: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await satcomFailoverService.logFailover({
      vessel_id: vesselId,
      event_type: "recovery_completed",
      to_provider: disconnectedConn.provider,
      to_connection_id: disconnectedConn.id,
      reason: "Diagnostic test - recovery completed",
      success: true,
      duration_seconds: 2,
    });

    await satcomFailoverService.updateConnectionStatus({
      vessel_id: vesselId,
      connection_id: disconnectedConn.id,
      provider: disconnectedConn.provider,
      status: "connected",
      signal_strength: 90,
    });
  };

  const testFullCycle = async () => {
    // Run all tests in sequence
    await testConnectionLoss();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await testFailover();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await testRecovery();
  };

  const testStress = async () => {
    // Rapid connection switching
    for (let i = 0; i < 5; i++) {
      const conn1 = connections[i % connections.length];
      const conn2 = connections[(i + 1) % connections.length];

      await satcomFailoverService.logFailover({
        vessel_id: vesselId,
        event_type: "automatic_switch",
        from_provider: conn1.provider,
        to_provider: conn2.provider,
        reason: `Stress test iteration ${i + 1}`,
        success: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const getTestIcon = (testType: TestType) => {
    switch (testType) {
    case "connection_loss":
      return XCircle;
    case "failover":
      return Activity;
    case "recovery":
      return CheckCircle;
    case "full_cycle":
      return PlayCircle;
    case "stress_test":
      return AlertTriangle;
    }
  };

  const getTestLabel = (testType: TestType) => {
    switch (testType) {
    case "connection_loss":
      return "Connection Loss";
    case "failover":
      return "Failover Test";
    case "recovery":
      return "Recovery Test";
    case "full_cycle":
      return "Full Cycle";
    case "stress_test":
      return "Stress Test";
    }
  };

  const tests: TestType[] = [
    "connection_loss",
    "failover",
    "recovery",
    "full_cycle",
    "stress_test",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-primary" />
          Diagnostic Panel
        </CardTitle>
        <CardDescription>
          PATCH 442 - Test SATCOM failover and recovery scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {tests.map((testType) => {
            const Icon = getTestIcon(testType);
            const isRunning = isRunningTest && currentTest === testType;

            return (
              <Button
                key={testType}
                onClick={() => runTest(testType)}
                disabled={isRunningTest}
                variant={isRunning ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                {isRunning ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                <span className="text-xs">{getTestLabel(testType)}</span>
              </Button>
            );
          })}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Recent Tests</div>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium">
                          {getTestLabel(result.type)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.message}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {(result.duration / 1000).toFixed(2)}s
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        {isRunningTest && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Running {currentTest && getTestLabel(currentTest)}...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
