/**
 * PATCH 532 - Route Suggestions Component
 * Displays multiple AI-optimized route suggestions with weather impact analysis
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Navigation,
  Clock,
  Gauge,
  AlertTriangle,
  Wind,
  Waves,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { Route } from "../services/routePlannerService";
import type { RouteWeatherImpact } from "../services/weatherIntegrationService";

interface RouteSuggestionProps {
  route: Route;
  weatherImpact?: RouteWeatherImpact;
  onSelect: () => void;
  isSelected: boolean;
}

export const RouteSuggestionCard: React.FC<RouteSuggestionProps> = ({
  route,
  weatherImpact,
  onSelect,
  isSelected,
}) => {
  const getSeverityColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getSeverityBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, text: "Safe" };
    if (score >= 60) return { variant: "secondary" as const, text: "Caution" };
    if (score >= 40) return { variant: "destructive" as const, text: "Risk" };
    return { variant: "destructive" as const, text: "High Risk" };
  };

  const safetyBadge = weatherImpact 
    ? getSeverityBadge(weatherImpact.safetyScore)
    : { variant: "outline" as const, text: "Unknown" };

  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? "ring-2 ring-primary shadow-lg" 
          : "hover:shadow-md"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{route.name}</CardTitle>
              {route.recommended && (
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              )}
              {route.aiOptimized && (
                <Badge variant="secondary">AI Optimized</Badge>
              )}
            </div>
            {route.description && (
              <p className="text-sm text-muted-foreground">{route.description}</p>
            )}
          </div>
          <Badge variant={safetyBadge.variant}>
            {safetyBadge.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Navigation className="h-4 w-4" />
              <span className="text-xs">Distance</span>
            </div>
            <p className="text-lg font-semibold">{route.distance.toFixed(1)} nm</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Duration</span>
            </div>
            <p className="text-lg font-semibold">{route.estimatedDuration.toFixed(1)}h</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Risk Score</span>
            </div>
            <p className={`text-lg font-semibold ${getSeverityColor(100 - route.riskScore)}`}>
              {route.riskScore}/100
            </p>
          </div>
        </div>

        {/* Weather Impact */}
        {weatherImpact && (
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Weather Impact</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-500" />
                <div className="text-xs">
                  <p className="font-medium">Wind: {weatherImpact.avgWindSpeed.toFixed(1)} kn</p>
                  <p className="text-muted-foreground">Max: {weatherImpact.maxWindSpeed.toFixed(1)} kn</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-cyan-500" />
                <div className="text-xs">
                  <p className="font-medium">Waves: {weatherImpact.avgWaveHeight.toFixed(1)} m</p>
                  <p className="text-muted-foreground">Max: {weatherImpact.maxWaveHeight.toFixed(1)} m</p>
                </div>
              </div>
            </div>

            {weatherImpact.recommendedSpeed && (
              <div className="flex items-center gap-2 text-xs">
                <Gauge className="h-4 w-4" />
                <span>Recommended Speed: {weatherImpact.recommendedSpeed.toFixed(1)} kn</span>
              </div>
            )}

            {weatherImpact.timeImpact > 0 && (
              <div className="flex items-center gap-2 text-xs text-orange-500">
                <TrendingUp className="h-4 w-4" />
                <span>Expected delay: {weatherImpact.timeImpact.toFixed(1)}h due to weather</span>
              </div>
            )}
          </div>
        )}

        {/* Optimization Savings */}
        {(route.timeSavings || route.fuelSavings) && (
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">AI Optimization Benefits</p>
            <div className="grid grid-cols-2 gap-2">
              {route.timeSavings && route.timeSavings > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs">-{route.timeSavings.toFixed(1)}h time</span>
                </div>
              )}
              {route.fuelSavings && route.fuelSavings > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs">-{route.fuelSavings.toFixed(1)}% fuel</span>
                </div>
              )}
            </div>
            {route.optimizationReason && (
              <p className="text-xs text-muted-foreground italic">
                {route.optimizationReason}
              </p>
            )}
          </div>
        )}

        {/* Weather Alerts */}
        {route.weatherAlerts && route.weatherAlerts.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Weather Alerts ({route.weatherAlerts.length})
            </p>
            <div className="space-y-1">
              {route.weatherAlerts.slice(0, 2).map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-start gap-2 text-xs p-2 bg-orange-50 dark:bg-orange-950 rounded"
                >
                  <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{alert.type.replace("_", " ")}</p>
                    <p className="text-muted-foreground">{alert.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
              {route.weatherAlerts.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{route.weatherAlerts.length - 2} more alerts
                </p>
              )}
            </div>
          </div>
        )}

        {/* ETA */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground">Estimated Time of Arrival</p>
          <p className="text-sm font-semibold">{route.etaArrival}</p>
        </div>

        <Button 
          className="w-full" 
          variant={isSelected ? "default" : "outline"}
          onClick={onSelect}
        >
          {isSelected ? "Selected" : "Select Route"}
        </Button>
      </CardContent>
    </Card>
  );
};
