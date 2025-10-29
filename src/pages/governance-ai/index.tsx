/**
 * PATCH 515: Governance AI Dashboard
 * Ethics-based decision governance with audit trail
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { governanceEngine, type GovernanceRequest, type GovernanceDecision } from '@/modules/governance/GovernanceEngine';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  FileEdit,
  Scale,
  Lock,
  Eye,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const GovernanceAIDashboard: React.FC = () => {
  const [decisions, setDecisions] = useState<GovernanceDecision[]>([]);
  const [stats, setStats] = useState(governanceEngine.getStatistics());
  
  // Test request form
  const [testRequest, setTestRequest] = useState<GovernanceRequest>({
    involvesPersonalData: false,
    hasConsent: false,
    securityRisk: 0.3,
    transparencyLevel: 0.9,
    impactLevel: 'medium',
  });

  useEffect(() => {
    // Run some test evaluations
    runTestEvaluations();
  }, []);

  const runTestEvaluations = async () => {
    const testRequests: GovernanceRequest[] = [
      {
        involvesPersonalData: true,
        hasConsent: true,
        securityRisk: 0.2,
        transparencyLevel: 0.9,
        impactLevel: 'low',
        description: 'User profile update',
      },
      {
        involvesPersonalData: true,
        hasConsent: false,
        securityRisk: 0.4,
        transparencyLevel: 0.7,
        impactLevel: 'high',
        description: 'Data processing without consent',
      },
      {
        involvesPersonalData: false,
        hasConsent: false,
        securityRisk: 0.8,
        transparencyLevel: 0.5,
        impactLevel: 'critical',
        description: 'High-risk system modification',
      },
      {
        involvesPersonalData: false,
        hasConsent: false,
        securityRisk: 0.1,
        transparencyLevel: 0.95,
        impactLevel: 'low',
        description: 'Standard operation',
      },
    ];

    const results: GovernanceDecision[] = [];
    for (const request of testRequests) {
      const decision = await governanceEngine.evaluateRequest(request);
      results.push(decision);
    }

    setDecisions(results);
    setStats(governanceEngine.getStatistics());
  };

  const evaluateTestRequest = async () => {
    const decision = await governanceEngine.evaluateRequest(testRequest);
    setDecisions([decision, ...decisions]);
    setStats(governanceEngine.getStatistics());
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approve': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'reject': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'escalate': return <ArrowUpRight className="h-5 w-5 text-yellow-500" />;
      case 'modify': return <FileEdit className="h-5 w-5 text-blue-500" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getDecisionBadge = (decision: string) => {
    const variants: Record<string, any> = {
      approve: 'default',
      reject: 'destructive',
      escalate: 'secondary',
      modify: 'outline',
    };
    const colors: Record<string, string> = {
      approve: 'bg-green-600',
    };
    return (
      <Badge variant={variants[decision] || 'default'} className={colors[decision]}>
        {decision}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ethics': return <Scale className="h-4 w-4" />;
      case 'compliance': return <FileEdit className="h-4 w-4" />;
      case 'security': return <Lock className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Governance Engine
          </h1>
          <p className="text-muted-foreground">
            AI-powered ethical decision governance and compliance
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
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
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <Progress value={(stats.approved / stats.total) * 100} className="mt-2" />
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
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <Progress value={(stats.rejected / stats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-yellow-500" />
              Escalated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.escalated}</div>
            <Progress value={(stats.escalated / stats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Ethics Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(stats.averageEthicsScore)}`}>
              {stats.averageEthicsScore}
            </div>
            <p className="text-xs text-muted-foreground mt-1">out of 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle>Test Evaluation</CardTitle>
          <CardDescription>
            Submit a request for governance evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch
                  checked={testRequest.involvesPersonalData}
                  onCheckedChange={(checked) =>
                    setTestRequest({ ...testRequest, involvesPersonalData: checked })
                  }
                />
                Involves Personal Data
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch
                  checked={testRequest.hasConsent}
                  onCheckedChange={(checked) =>
                    setTestRequest({ ...testRequest, hasConsent: checked })
                  }
                  disabled={!testRequest.involvesPersonalData}
                />
                Has User Consent
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Security Risk: {(testRequest.securityRisk * 100).toFixed(0)}%</Label>
            <Slider
              value={[testRequest.securityRisk * 100]}
              onValueChange={(value) =>
                setTestRequest({ ...testRequest, securityRisk: value[0] / 100 })
              }
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Transparency Level: {(testRequest.transparencyLevel * 100).toFixed(0)}%</Label>
            <Slider
              value={[testRequest.transparencyLevel * 100]}
              onValueChange={(value) =>
                setTestRequest({ ...testRequest, transparencyLevel: value[0] / 100 })
              }
              max={100}
              step={1}
            />
          </div>

          <Button onClick={evaluateTestRequest} className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            Evaluate Request
          </Button>
        </CardContent>
      </Card>

      {/* Recent Decisions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Decisions</CardTitle>
          <CardDescription>
            Governance evaluations with ethics scoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {decisions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No decisions yet. Use the test evaluation form above.
              </div>
            ) : (
              decisions.map((decision, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getDecisionIcon(decision.decision)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getDecisionBadge(decision.decision)}
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(decision.category)}
                            {decision.category}
                          </Badge>
                          {decision.requiresHumanReview && (
                            <Badge variant="destructive">
                              <Eye className="h-3 w-3 mr-1" />
                              Human Review Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{decision.justification}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(decision.ethicsScore)}`}>
                        {decision.ethicsScore}
                      </div>
                      <p className="text-xs text-muted-foreground">Ethics Score</p>
                    </div>
                  </div>

                  {/* Impact Assessment */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(decision.impactAssessment).map(([key, value]) => (
                      <div key={key} className="bg-muted/50 rounded p-2">
                        <div className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <Progress value={value * 100} className="mt-1 h-1" />
                        <div className="text-xs font-medium mt-1">
                          {(value * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  {decision.recommendations.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium text-muted-foreground">
                        Recommendations ({decision.recommendations.length})
                      </summary>
                      <ul className="mt-2 space-y-1 ml-4 list-disc">
                        {decision.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GovernanceAIDashboard;
