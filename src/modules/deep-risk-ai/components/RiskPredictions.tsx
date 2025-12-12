/**
 * PATCH 455 - Risk Predictions Component
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp } from "lucide-react";
import type { RiskPrediction } from "../types";

interface Props {
  predictions: RiskPrediction[];
}

export const RiskPredictions: React.FC<Props> = ({ predictions }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "bg-red-500/20 text-red-500";
    case "high": return "bg-orange-500/20 text-orange-500";
    case "medium": return "bg-yellow-500/20 text-yellow-500";
    default: return "bg-blue-500/20 text-blue-500";
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>AI Risk Predictions</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {predictions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No predictions available</p>
          ) : (
            predictions.map(prediction => (
              <Card key={prediction.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{prediction.riskType}</span>
                      <Badge className={getSeverityColor(prediction.severity)}>
                        {prediction.severity}
                      </Badge>
                      <Badge variant="outline">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {(prediction.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-sm">{prediction.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Source: {prediction.source} • {new Date(prediction.predictedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});
