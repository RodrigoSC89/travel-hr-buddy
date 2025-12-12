
/**
 * PATCH 582 - Decision Simulator Visualization UI
 * Visual representation of simulation results
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import type { SimulationResult, SimulationScenario } from "./index";

interface SimulationVisualizationProps {
  simulation: SimulationResult;
  onScenarioSelect?: (scenario: SimulationScenario) => void;
}

export const SimulationVisualization: React.FC<SimulationVisualizationProps> = ({
  simulation,
  onScenarioSelect
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed":
      return "bg-green-500";
    case "running":
      return "bg-blue-500";
    case "failed":
      return "bg-red-500";
    case "cancelled":
      return "bg-gray-500";
    default:
      return "bg-yellow-500";
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 30) return "text-green-600";
    if (risk <= 60) return "text-yellow-600";
    if (risk <= 85) return "text-orange-600";
    return "text-red-600";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Simulation Results</CardTitle>
              <CardDescription>
                Strategy: {simulation.strategy.name} • ID: {simulation.id}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(simulation.status)}>
              {simulation.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Confidence</p>
                <p className="text-lg font-semibold">{simulation.confidenceLevel}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-semibold">
                  {simulation.duration ? `${simulation.duration.toFixed(1)}s` : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-sm text-gray-500">Scenarios</p>
                <p className="text-lg font-semibold">{simulation.scenarios.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Success Probability</p>
                <p className="text-lg font-semibold">
                  {(simulation.strategy.successProbability * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings and Recommendations */}
      {(simulation.warnings.length > 0 || simulation.recommendations.length > 0) && (
        <div className="space-y-4">
          {simulation.warnings.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Warnings:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {simulation.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {simulation.recommendations.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {simulation.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
          <CardDescription>Simulation outcome metrics across all scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cost" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cost">Cost</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="time">Time</TabsTrigger>
              <TabsTrigger value="crew">Crew Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="cost" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Cost Analysis</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Minimum</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(simulation.metrics.cost.min)}
                    </span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Average</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(simulation.metrics.cost.average)}
                    </span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Maximum</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(simulation.metrics.cost.max)}
                    </span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Variance: {simulation.metrics.cost.variance.toFixed(2)}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Risk Analysis</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Minimum Risk</span>
                    <span className={`text-sm font-semibold ${getRiskColor(simulation.metrics.risk.min)}`}>
                      {simulation.metrics.risk.min.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={simulation.metrics.risk.min} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Average Risk</span>
                    <span className={`text-sm font-semibold ${getRiskColor(simulation.metrics.risk.average)}`}>
                      {simulation.metrics.risk.average.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={simulation.metrics.risk.average} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Maximum Risk</span>
                    <span className={`text-sm font-semibold ${getRiskColor(simulation.metrics.risk.max)}`}>
                      {simulation.metrics.risk.max.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={simulation.metrics.risk.max} className="h-2" />
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Risk Distribution</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(simulation.metrics.risk.distribution).map(([level, count]) => (
                      <div key={level} className="flex justify-between">
                        <span className="text-sm capitalize">{level}:</span>
                        <span className="text-sm font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="time" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Time Analysis</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Minimum Duration</span>
                    <span className="text-sm font-semibold">
                      {simulation.metrics.time.min.toFixed(1)}h
                    </span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Average Duration</span>
                    <span className="text-sm font-semibold">
                      {simulation.metrics.time.average.toFixed(1)}h
                    </span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Maximum Duration</span>
                    <span className="text-sm font-semibold">
                      {simulation.metrics.time.max.toFixed(1)}h
                    </span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                {simulation.metrics.time.criticalPath && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Critical Path</p>
                    <ul className="list-disc list-inside space-y-1">
                      {simulation.metrics.time.criticalPath.slice(0, 5).map((action, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="crew" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Crew Impact Analysis</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Minimum Impact</span>
                    <span className="text-sm font-semibold">
                      {simulation.metrics.crewImpact.min.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={simulation.metrics.crewImpact.min} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Average Impact</span>
                    <span className="text-sm font-semibold">
                      {simulation.metrics.crewImpact.average.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={simulation.metrics.crewImpact.average} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Maximum Impact</span>
                    <span className="text-sm font-semibold">
                      {simulation.metrics.crewImpact.max.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={simulation.metrics.crewImpact.max} className="h-2" />
                </div>
                {simulation.metrics.crewImpact.affectedCrew && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Affected Crew Members: ~{simulation.metrics.crewImpact.affectedCrew}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Scenarios</CardTitle>
          <CardDescription>
            Different scenarios tested during simulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {simulation.scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onScenarioSelect?.(scenario}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{scenario.name}</h4>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                  <Badge variant="outline">
                    {(scenario.probability * 100).toFixed(0)}% probability
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Outcomes:</p>
                  <div className="space-y-2">
                    {scenario.outcomes.map((outcome) => (
                      <div key={outcome.id} className="text-sm bg-gray-100 p-2 rounded">
                        <p className="font-medium">{outcome.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                          <span>Cost: {formatCurrency(outcome.impact.cost)}</span>
                          <span className={getRiskColor(outcome.impact.risk)}>
                            Risk: {outcome.impact.risk}%
                          </span>
                          <span>Time: {outcome.impact.time}h</span>
                          <span>Crew: {outcome.impact.crewImpact}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {scenario.triggers && scenario.triggers.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Triggers:</p>
                    <div className="flex flex-wrap gap-1">
                      {scenario.triggers.map((trigger, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
