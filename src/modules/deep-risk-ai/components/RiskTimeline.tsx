/**
 * PATCH 455 - Risk Timeline Component
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Anomaly, RiskPrediction } from "../types";

interface Props {
  anomalies: Anomaly[];
  predictions: RiskPrediction[];
}

export const RiskTimeline: React.FC<Props> = ({ anomalies, predictions }) => {
  const events = [
    ...anomalies.map(a => ({ type: "anomaly", time: a.detectedAt, data: a })),
    ...predictions.map(p => ({ type: "prediction", time: p.predictedAt, data: p }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <Card>
      <CardHeader><CardTitle>Risk Timeline</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full ${event.type === "anomaly" ? "bg-orange-500" : "bg-blue-500"}`} />
                {idx < events.length - 1 && <div className="h-full w-0.5 bg-border mt-1" />}
              </div>
              <div className="flex-1 pb-4">
                <Badge variant={event.type === "anomaly" ? "secondary" : "default"}>
                  {event.type}
                </Badge>
                <p className="text-sm mt-1">
                  {event.type === "anomaly" 
                    ? `Anomaly: ${(event.data as Anomaly).anomalyType}`
                    : `Prediction: ${(event.data as RiskPrediction).riskType}`
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(event.time).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
