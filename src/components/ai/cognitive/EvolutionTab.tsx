import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvolutionReport } from "@/ai/evoAIConnector";

interface EvolutionTabProps {
  evolutionReport: EvolutionReport | null;
  loading: boolean;
}

export const EvolutionTab: React.FC<EvolutionTabProps> = ({ evolutionReport, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Evolution</CardTitle>
        <CardDescription>AI learning progress and performance trends</CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !evolutionReport ? (
          <div className="text-center py-8">Loading evolution data...</div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-primary/5">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Evolution Score</h3>
                <div className="text-5xl font-bold text-primary mb-2">
                  {evolutionReport.evolutionScore.toFixed(0)}
                </div>
                <Badge variant="outline">{evolutionReport.performanceScore.trend}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  {(evolutionReport.performanceScore.overall * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Overall</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  {(evolutionReport.performanceScore.prediction * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Prediction</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  {(evolutionReport.performanceScore.adaptation * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Adaptation</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  {(evolutionReport.performanceScore.tactical * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Tactical</div>
              </div>
            </div>

            {evolutionReport.insights && evolutionReport.insights.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Key Insights</h3>
                <div className="space-y-2">
                  {evolutionReport.insights.map((insight) => (
                    <div key={insight.pattern} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{insight.pattern}</span>
                        <Badge variant={
                          insight.impact === "high" ? "destructive" :
                            insight.impact === "medium" ? "default" : "secondary"
                        }>
                          {insight.impact}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {insight.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
