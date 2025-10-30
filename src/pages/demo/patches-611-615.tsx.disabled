/**
 * Demo page for Patches 611-615
 * Showcases all 5 modules in action
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ops3DCore } from '@/visual/ops-3d-core';
import { graphInferenceEngine } from '@/ai/inference/graph-engine';
import { autonomousDecisionSimulator } from '@/ai/decisions/simulation-engine';
import { contextualThreatMonitor } from '@/ai/security/context-threat-monitor';
import { jointCopilotStrategyRecommender } from '@/copilot/strategy/recommender';
import { AlertCircle, CheckCircle, Info, Shield, Zap } from 'lucide-react';

export default function Patches611615Demo() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [graphStats, setGraphStats] = useState<any>(null);
  const [threatStats, setThreatStats] = useState<any>(null);
  const [copilotStats, setCopilotStats] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [simulationReport, setSimulationReport] = useState<any>(null);

  // Initialize all systems
  const initializeSystems = async () => {
    setLoading(true);
    try {
      await graphInferenceEngine.initialize();
      await autonomousDecisionSimulator.initialize();
      await contextualThreatMonitor.start();
      await jointCopilotStrategyRecommender.initialize();
      
      setInitialized(true);
      updateStats();
    } catch (error) {
      console.error('Failed to initialize systems:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update all statistics
  const updateStats = () => {
    setGraphStats(graphInferenceEngine.getStats());
    setThreatStats(contextualThreatMonitor.getStats());
    setCopilotStats(jointCopilotStrategyRecommender.getStats());
  };

  // Generate recommendation
  const generateRecommendation = async () => {
    setLoading(true);
    try {
      const rec = await jointCopilotStrategyRecommender.generateRecommendation();
      setRecommendation(rec);
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run simulation
  const runSimulation = async () => {
    setLoading(true);
    try {
      const scenarios = autonomousDecisionSimulator.getScenarios();
      if (scenarios.length > 0) {
        const report = await autonomousDecisionSimulator.simulateScenario(scenarios[0].id);
        setSimulationReport(report);
      }
    } catch (error) {
      console.error('Failed to run simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle recommendation response
  const handleRecommendationResponse = async (action: 'accept' | 'reject' | 'defer') => {
    if (!recommendation) return;
    
    await jointCopilotStrategyRecommender.handleUserResponse(
      recommendation.id,
      action,
      `User ${action}ed recommendation`
    );
    
    updateStats();
    
    // Show feedback
    alert(`Recommendation ${action}ed successfully!`);
  };

  useEffect(() => {
    initializeSystems();
    
    // Update stats every 10 seconds
    const interval = setInterval(updateStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Initializing Systems...</CardTitle>
            <CardDescription>Setting up Patches 611-615</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="animate-pulse">Loading Graph Engine...</div>
              <div className="animate-pulse">Loading Decision Simulator...</div>
              <div className="animate-pulse">Loading Threat Monitor...</div>
              <div className="animate-pulse">Loading Copilot Recommender...</div>
              <div className="animate-pulse">Loading 3D Visualizer...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Patches 611-615 Demo</h1>
        <p className="text-muted-foreground">
          Advanced AI & Visualization Features
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="3d-viz">3D Viz</TabsTrigger>
          <TabsTrigger value="graph">Graph</TabsTrigger>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="copilot">Copilot</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Graph Engine</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {graphStats && (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{graphStats.nodeCount} Nodes</div>
                    <p className="text-xs text-muted-foreground">
                      {graphStats.edgeCount} edges
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Threat Monitor</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {threatStats && (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{threatStats.activeThreats} Active</div>
                    <p className="text-xs text-muted-foreground">
                      {threatStats.unacknowledgedAlerts} alerts
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Copilot System</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {copilotStats && (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{copilotStats.copilotCount} Copilots</div>
                    <p className="text-xs text-muted-foreground">
                      {(copilotStats.acceptanceRate * 100).toFixed(0)}% accept rate
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3D Visualizer Tab */}
        <TabsContent value="3d-viz">
          <Card>
            <CardHeader>
              <CardTitle>PATCH 611 - Ops 3D Visualizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] w-full border rounded-lg overflow-hidden">
                <Ops3DCore />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Graph Engine Tab */}
        <TabsContent value="graph" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PATCH 612 - Graph Engine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {graphStats && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Statistics</h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt>Nodes:</dt>
                          <dd className="font-medium">{graphStats.nodeCount}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Edges:</dt>
                          <dd className="font-medium">{graphStats.edgeCount}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulator Tab */}
        <TabsContent value="simulator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PATCH 613 - Decision Simulator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runSimulation} disabled={loading}>
                {loading ? 'Running...' : 'Run Simulation'}
              </Button>

              {simulationReport && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Simulation Complete</AlertTitle>
                  <AlertDescription>
                    Recommended: {simulationReport.recommendation.strategyName}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PATCH 614 - Threat Monitor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {threatStats && (
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600">
                        {threatStats.threatsBySeverity.critical}
                      </div>
                      <div className="text-sm">Critical</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-orange-600">
                        {threatStats.threatsBySeverity.high}
                      </div>
                      <div className="text-sm">High</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-yellow-600">
                        {threatStats.threatsBySeverity.medium}
                      </div>
                      <div className="text-sm">Medium</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600">
                        {threatStats.threatsBySeverity.low}
                      </div>
                      <div className="text-sm">Low</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Copilot Tab */}
        <TabsContent value="copilot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PATCH 615 - Copilot Recommender</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateRecommendation} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Recommendation'}
              </Button>

              {recommendation && (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{recommendation.title}</AlertTitle>
                    <AlertDescription>
                      <Badge>{recommendation.priority}</Badge>
                      <p className="mt-2">{recommendation.description}</p>
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button onClick={() => handleRecommendationResponse('accept')}>
                      Accept
                    </Button>
                    <Button onClick={() => handleRecommendationResponse('reject')} variant="destructive">
                      Reject
                    </Button>
                    <Button onClick={() => handleRecommendationResponse('defer')} variant="outline">
                      Defer
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
