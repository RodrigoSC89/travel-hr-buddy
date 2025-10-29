/**
 * PATCH 547 - Trust Score Display Component
 * UI component to display trust scores with color-coded levels and historical tracking
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, TrendingUp, TrendingDown, Info, History } from "lucide-react";
import { calculateTrustScore, getTrustScoreHistory, type TrustScore, type TrustInput } from "./calculateTrustScore";
import { Button } from "@/components/ui/button";

interface TrustScoreDisplayProps {
  entityId: string;
  entityType: "user" | "incident" | "token" | "system";
  showHistory?: boolean;
  autoCalculate?: boolean;
}

const levelColors = {
  excellent: "bg-green-500",
  high: "bg-blue-500",
  medium: "bg-yellow-500",
  low: "bg-orange-500",
  very_low: "bg-red-500",
};

const levelTextColors = {
  excellent: "text-green-700",
  high: "text-blue-700",
  medium: "text-yellow-700",
  low: "text-orange-700",
  very_low: "text-red-700",
};

export const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({
  entityId,
  entityType,
  showHistory = true,
  autoCalculate = false,
}) => {
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [history, setHistory] = useState<Array<{ timestamp: string; score: number; event_type: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistoryView, setShowHistoryView] = useState(false);

  useEffect(() => {
    if (autoCalculate) {
      loadTrustScore();
    }
    if (showHistory) {
      loadHistory();
    }
  }, [entityId, entityType, autoCalculate, showHistory]);

  const loadTrustScore = async () => {
    setIsLoading(true);
    try {
      const input: TrustInput = {
        entityId,
        entityType,
        eventType: "validation_success",
        sourceSystem: entityId,
      };
      const score = await calculateTrustScore(input);
      setTrustScore(score);
    } catch (error) {
      console.error("Error loading trust score:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await getTrustScoreHistory(entityId, 20);
      setHistory(historyData);
    } catch (error) {
      console.error("Error loading trust history:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading trust score...</p>
        </CardContent>
      </Card>
    );
  }

  if (!trustScore && !autoCalculate) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Button onClick={loadTrustScore}>Calculate Trust Score</Button>
        </CardContent>
      </Card>
    );
  }

  if (!trustScore) {
    return null;
  }

  const trend = history.length >= 2 ? history[0].score - history[1].score : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Trust Score</CardTitle>
            </div>
            {showHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistoryView(!showHistoryView)}
              >
                <History className="h-4 w-4 mr-2" />
                {showHistoryView ? "Hide" : "Show"} History
              </Button>
            )}
          </div>
          <CardDescription>
            AI-powered trust analysis for {entityType}: {entityId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Score Display */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl font-bold">{trustScore.score}</span>
                <div className="flex flex-col">
                  <Badge
                    variant="outline"
                    className={`${levelColors[trustScore.level]} text-white`}
                  >
                    {trustScore.level.replace("_", " ").toUpperCase()}
                  </Badge>
                  {trend !== 0 && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {trend > 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-green-500">+{trend}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-500" />
                          <span className="text-red-500">{trend}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Progress value={trustScore.score} className="h-2" />
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{trustScore.recommendation}</p>
          </div>

          {/* Score Factors */}
          <div className="grid grid-cols-2 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Recent Activity</span>
                      <span className="font-medium">{trustScore.factors.recentActivity}</span>
                    </div>
                    <Progress value={trustScore.factors.recentActivity} className="h-1" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Based on the last 10 trust events</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Historical Performance</span>
                      <span className="font-medium">{trustScore.factors.historicalPerformance}</span>
                    </div>
                    <Progress value={trustScore.factors.historicalPerformance} className="h-1" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Long-term performance track record</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Compliance Record</span>
                      <span className="font-medium">{trustScore.factors.complianceRecord}</span>
                    </div>
                    <Progress value={trustScore.factors.complianceRecord} className="h-1" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compliance with security and audit standards</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Incident Resolution</span>
                      <span className="font-medium">{trustScore.factors.incidentHistory}</span>
                    </div>
                    <Progress value={trustScore.factors.incidentHistory} className="h-1" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Incident resolution rate and history</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* History View */}
      {showHistoryView && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trust Score History</CardTitle>
            <CardDescription>Recent trust events and score changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-semibold w-12">{event.score}</div>
                    <div className="text-xs text-muted-foreground">
                      <div>{event.event_type.replace(/_/g, " ")}</div>
                      <div>{new Date(event.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  {index < history.length - 1 && (
                    <div className="text-xs">
                      {event.score > history[index + 1].score ? (
                        <span className="text-green-500">
                          +{event.score - history[index + 1].score}
                        </span>
                      ) : event.score < history[index + 1].score ? (
                        <span className="text-red-500">
                          {event.score - history[index + 1].score}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
