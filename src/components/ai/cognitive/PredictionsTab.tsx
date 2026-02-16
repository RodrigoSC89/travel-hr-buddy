import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { ModuleRiskScore } from "@/ai/predictiveEngine";
import { getRiskColor, formatTimestamp } from "./types";

interface PredictionsTabProps {
  predictions: ModuleRiskScore[];
  loading: boolean;
}

export const PredictionsTab: React.FC<PredictionsTabProps> = ({ predictions, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Risk Predictions</CardTitle>
        <CardDescription>AI-powered forecasts of potential failures and overloads</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading predictions...</div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No predictions available</div>
        ) : (
          <div className="space-y-3">
            {predictions.map((pred) => {
              const predRecord = pred as unknown as Record<string, unknown>;
              const moduleName = String(predRecord.module_name || pred.moduleName);
              const riskScore = Number(predRecord.risk_score || pred.riskScore);
              const riskLevel = String(predRecord.risk_level || pred.riskLevel);
              const forecastEvent = String(predRecord.forecast_event || pred.forecastEvent);
              const predictedAt = String(predRecord.predicted_at || pred.predictedAt);
              return (
                <div key={`${moduleName}-${riskScore}`} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{moduleName}</h3>
                        <Badge className={getRiskColor(riskLevel)}>{riskLevel}</Badge>
                        <Badge variant="outline">{forecastEvent}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Risk Score:</span>
                          <span className="font-medium">{riskScore}/100</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="font-medium">{((pred.confidence || 0) * 100).toFixed(0)}%</span>
                        </div>
                        {pred.factors && pred.factors.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm text-muted-foreground">Factors:</span>
                            <ul className="list-disc list-inside text-sm mt-1">
                              {pred.factors.map((factor) => (
                                <li key={factor}>{factor}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {formatTimestamp(predictedAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
