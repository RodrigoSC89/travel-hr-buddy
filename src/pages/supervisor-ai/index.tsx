/**
 * PATCH 512 - Supervising AI Interface
 * UI for monitoring and understanding AI Supervisor decisions
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  RefreshCw,
  Info,
} from "lucide-react";
import { supervisorAI, AIDecision, SupervisorValidation } from "@/ai/supervisor/SupervisorAI";
import { toast } from "sonner";

export default function SupervisorAIInterface() {
  const [validationHistory, setValidationHistory] = useState<SupervisorValidation[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedValidation, setSelectedValidation] = useState<SupervisorValidation | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const history = supervisorAI.getValidationHistory(50);
      const metricsData = supervisorAI.getMetrics();
      setValidationHistory(history);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error loading supervisor data:", error);
      toast.error("Failed to load supervisor data");
    } finally {
      setLoading(false);
    }
  };

  const testDecision = async () => {
    // Create a test decision
    const testDecision: AIDecision = {
      id: `test-${Date.now()}`,
      sourceAI: "Test AI",
      action: "process_data",
      parameters: { dataset: "test", mode: "analysis" },
      confidence: 0.85,
      timestamp: new Date().toISOString(),
    };

    const validation = await supervisorAI.validateDecision(testDecision);
    toast.success("Test decision processed", {
      description: validation.explanation,
    });
    loadData();
  };

  const getStatusIcon = (validation: SupervisorValidation) => {
    if (!validation.approved) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    if (validation.corrected) {
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getStatusBadge = (validation: SupervisorValidation) => {
    if (!validation.approved) {
      return <Badge variant="destructive">BLOCKED</Badge>;
    }
    if (validation.corrected) {
      return <Badge variant="warning">CORRECTED</Badge>;
    }
    return <Badge variant="default">APPROVED</Badge>;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Supervisor
          </h1>
          <p className="text-muted-foreground">
            Monitoring and validating AI decisions across all systems
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={testDecision} variant="outline" size="sm">
            Test Decision
          </Button>
          <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDecisions || 0}</div>
            <p className="text-xs text-muted-foreground">Processed by supervisor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.approved || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalDecisions
                ? `${((metrics.approved / metrics.totalDecisions) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Corrected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.corrected || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalDecisions
                ? `${((metrics.corrected / metrics.totalDecisions) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.rejected || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalDecisions
                ? `${((metrics.rejected / metrics.totalDecisions) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Validation History */}
      <Card>
        <CardHeader>
          <CardTitle>Validation History</CardTitle>
          <CardDescription>Recent AI decisions reviewed by the supervisor</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="corrected">Corrected</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ValidationList
                validations={validationHistory}
                onSelect={setSelectedValidation}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="approved">
              <ValidationList
                validations={validationHistory.filter((v) => v.approved && !v.corrected)}
                onSelect={setSelectedValidation}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="corrected">
              <ValidationList
                validations={validationHistory.filter((v) => v.corrected)}
                onSelect={setSelectedValidation}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="rejected">
              <ValidationList
                validations={validationHistory.filter((v) => !v.approved)}
                onSelect={setSelectedValidation}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Selected Validation Details */}
      {selectedValidation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Validation Details
            </CardTitle>
            <CardDescription>Detailed explanation of supervisor decision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                {getStatusBadge(selectedValidation)}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Explanation</h3>
                <p className="text-sm">{selectedValidation.explanation}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Original Decision</h3>
                <div className="bg-muted p-3 rounded text-sm">
                  <div>Source: {selectedValidation.originalDecision.sourceAI}</div>
                  <div>Action: {selectedValidation.originalDecision.action}</div>
                  <div>Confidence: {selectedValidation.originalDecision.confidence}</div>
                </div>
              </div>

              {selectedValidation.correctedDecision && (
                <div>
                  <h3 className="font-semibold mb-2">Corrected Decision</h3>
                  <div className="bg-green-50 p-3 rounded text-sm">
                    <div>Action: {selectedValidation.correctedDecision.action}</div>
                    <div>Confidence: {selectedValidation.correctedDecision.confidence}</div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Validation Rules Applied</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedValidation.validationRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ValidationListProps {
  validations: SupervisorValidation[];
  onSelect: (validation: SupervisorValidation) => void;
  getStatusIcon: (validation: SupervisorValidation) => React.ReactNode;
  getStatusBadge: (validation: SupervisorValidation) => React.ReactNode;
}

function ValidationList({ validations, onSelect, getStatusIcon, getStatusBadge }: ValidationListProps) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {validations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No validations found</div>
        ) : (
          validations.map((validation) => (
            <div
              key={validation.decisionId}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
              onClick={() => onSelect(validation)}
            >
              {getStatusIcon(validation)}
              <div className="flex-1">
                <div className="font-medium">{validation.originalDecision.sourceAI}</div>
                <div className="text-sm text-muted-foreground">
                  {validation.originalDecision.action}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(validation.timestamp).toLocaleString()}
                </div>
              </div>
              {getStatusBadge(validation)}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
