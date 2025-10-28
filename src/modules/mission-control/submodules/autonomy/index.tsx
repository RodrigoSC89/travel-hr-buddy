/**
 * PATCH 410: Mission Autonomy Submodule
 * AI-driven autonomous mission management and optimization
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Zap, TrendingUp, Shield, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const MissionAutonomy: React.FC = () => {
  const [autoOptimization, setAutoOptimization] = React.useState(true);
  const [autoScheduling, setAutoScheduling] = React.useState(true);
  const [riskMitigation, setRiskMitigation] = React.useState(true);
  const [aiAssistance, setAiAssistance] = React.useState(true);

  const aiInsights = [
    {
      id: '1',
      type: 'optimization',
      title: 'Route Optimization Available',
      description: 'AI detected 15% fuel savings for Survey Mission B-12',
      impact: 'high',
      action: 'Apply Suggestion'
    },
    {
      id: '2',
      type: 'risk',
      title: 'Weather Risk Detected',
      description: 'Adverse conditions predicted for 2025-11-02, consider rescheduling',
      impact: 'medium',
      action: 'Review Schedule'
    },
    {
      id: '3',
      type: 'efficiency',
      title: 'Crew Utilization Improvement',
      description: 'Suggest rotating Team Charlie to reduce fatigue',
      impact: 'medium',
      action: 'View Details'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-500" />
          Mission Autonomy
        </h2>
        <p className="text-muted-foreground">
          AI-powered mission automation and optimization
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">94%</div>
            <p className="text-xs text-muted-foreground">System accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Optimizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">23</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">$12.5k</div>
            <p className="text-xs text-muted-foreground">Estimated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Risks Avoided</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">7</div>
            <p className="text-xs text-muted-foreground">Incidents prevented</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Autonomy Settings</CardTitle>
          <CardDescription>Configure AI-driven mission automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="auto-optimization" className="text-sm font-medium">
                  Automatic Route Optimization
                </Label>
                <p className="text-xs text-muted-foreground">
                  AI optimizes routes for fuel efficiency and time
                </p>
              </div>
              <Switch 
                id="auto-optimization"
                checked={autoOptimization}
                onCheckedChange={setAutoOptimization}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="auto-scheduling" className="text-sm font-medium">
                  Smart Scheduling
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically adjust schedules based on conditions
                </p>
              </div>
              <Switch 
                id="auto-scheduling"
                checked={autoScheduling}
                onCheckedChange={setAutoScheduling}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="risk-mitigation" className="text-sm font-medium">
                  Proactive Risk Mitigation
                </Label>
                <p className="text-xs text-muted-foreground">
                  AI predicts and prevents potential issues
                </p>
              </div>
              <Switch 
                id="risk-mitigation"
                checked={riskMitigation}
                onCheckedChange={setRiskMitigation}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="ai-assistance" className="text-sm font-medium">
                  AI Decision Assistance
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get AI recommendations for complex decisions
                </p>
              </div>
              <Switch 
                id="ai-assistance"
                checked={aiAssistance}
                onCheckedChange={setAiAssistance}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Insights & Suggestions</CardTitle>
          <CardDescription>Actionable recommendations from AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiInsights.map(insight => (
              <div 
                key={insight.id}
                className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {insight.type === 'optimization' && <Zap className="h-4 w-4 text-yellow-500" />}
                      {insight.type === 'risk' && <Shield className="h-4 w-4 text-red-500" />}
                      {insight.type === 'efficiency' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge 
                        variant={insight.impact === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    {insight.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
