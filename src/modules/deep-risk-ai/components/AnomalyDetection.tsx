/**
 * PATCH 455 - Anomaly Detection Component
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle } from "lucide-react";
import type { Anomaly } from "../types";

interface Props {
  anomalies: Anomaly[];
}

export const AnomalyDetection: React.FC<Props> = ({ anomalies }) => {
  const getRiskColor = (score: number) => {
    if (score > 0.8) return "bg-red-500/20 text-red-500";
    if (score > 0.6) return "bg-orange-500/20 text-orange-500";
    return "bg-yellow-500/20 text-yellow-500";
  };

  return (
    <Card>
      <CardHeader><CardTitle>Detected Anomalies</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anomalies.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No anomalies detected</p>
          ) : (
            anomalies.map(anomaly => (
              <Card key={anomaly.id} className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{anomaly.anomalyType}</span>
                      <Badge className={getRiskColor(anomaly.riskScore)}>
                        Risk: {(anomaly.riskScore * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Value</div>
                        <div className="font-semibold">{anomaly.value.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Expected</div>
                        <div>{anomaly.expectedValue.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Deviation</div>
                        <div className="text-orange-500">{(anomaly.deviation * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Source: {anomaly.dataSource} • {new Date(anomaly.detectedAt).toLocaleString()}
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
};
