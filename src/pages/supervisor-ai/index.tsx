/**
 * PATCH 512: AI Supervisor Dashboard
 * Monitor and validate AI decisions with explanations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supervisorAI, type AIDecision, type ValidationResult } from '@/ai/supervisor/SupervisorAI';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Brain,
  Activity,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const SupervisorAIDashboard: React.FC = () => {
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [metrics, setMetrics] = useState(supervisorAI.getMetrics());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Simulate some AI decisions for demonstration
    simulateAIDecisions();
  }, []);

  const simulateAIDecisions = async () => {
    setIsProcessing(true);

    const mockDecisions: AIDecision[] = [
      {
        sourceAI: 'PredictiveEngine',
        action: 'scale_resources',
        confidence: 0.95,
        parameters: { from: 2, to: 5, resource: 'compute' },
      },
      {
        sourceAI: 'NavigationAI',
        action: 'adjust_route',
        confidence: 0.65,
        parameters: { newCourse: 180, reason: 'weather' },
      },
      {
        sourceAI: 'SafetyMonitor',
        action: 'emergency_stop',
        confidence: 0.88,
        parameters: { reason: 'obstacle_detected' },
      },
      {
        sourceAI: 'MaintenanceAI',
        action: 'schedule_maintenance',
        confidence: 0.75,
        parameters: { component: 'engine', priority: 'high' },
      },
    ];

    const results: ValidationResult[] = [];
    for (const decision of mockDecisions) {
      const result = await supervisorAI.validateDecision(decision);
      results.push(result);
    }

    setValidations(results);
    setMetrics(supervisorAI.getMetrics());
    setIsProcessing(false);
  };

  const getDecisionBadge = (result: ValidationResult) => {
    if (result.blocked) {
      return <Badge variant="destructive">Blocked</Badge>;
    }
    if (result.corrected) {
      return <Badge variant="secondary">Corrected</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">Approved</Badge>;
  };

  const getDecisionIcon = (result: ValidationResult) => {
    if (result.blocked) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (result.corrected) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Supervisor
          </h1>
          <p className="text-muted-foreground">
            Validation and monitoring of AI decision-making systems
          </p>
        </div>
        <Button onClick={simulateAIDecisions} disabled={isProcessing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
          Test Decisions
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalDecisions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All validated decisions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics.approved}</div>
            <Progress value={metrics.approvalRate * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(metrics.approvalRate)} approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Corrected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{metrics.corrected}</div>
            <Progress value={metrics.correctionRate * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(metrics.correctionRate)} correction rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metrics.rejected}</div>
            <Progress value={metrics.rejectionRate * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(metrics.rejectionRate)} rejection rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Validations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Validations</CardTitle>
          <CardDescription>
            AI decisions validated by the supervisor layer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No validations yet. Click "Test Decisions" to simulate AI decisions.
              </div>
            ) : (
              validations.map((result, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getDecisionIcon(result)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {result.originalDecision.sourceAI}
                          </h3>
                          {getDecisionBadge(result)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Action: {result.originalDecision.action}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {(result.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>

                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-sm">{result.explanation}</p>
                  </div>

                  {/* Validation Rules */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(result.validationRules).map(([rule, passed]) => (
                      <div
                        key={rule}
                        className={`flex items-center gap-2 text-xs p-2 rounded ${
                          passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {passed ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span className="capitalize">
                          {rule.replace('Check', '')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Parameters */}
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-muted-foreground">
                      View Parameters
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(result.originalDecision.parameters, null, 2)}
                    </pre>
                  </details>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Supervisor Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Active</h3>
                <p className="text-sm text-muted-foreground">
                  Monitoring all AI systems
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Performance</h3>
                <p className="text-sm text-muted-foreground">
                  {formatPercentage(metrics.approvalRate)} pass rate
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">Rules</h3>
                <p className="text-sm text-muted-foreground">
                  4 validation rules active
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorAIDashboard;
