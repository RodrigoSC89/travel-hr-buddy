import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdjustmentsTabProps {
  parameters: unknown;
  loading: boolean;
}

export const AdjustmentsTab: React.FC<AdjustmentsTabProps> = ({ parameters, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adaptive Parameters</CardTitle>
        <CardDescription>Self-tuned system parameters and thresholds</CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !parameters ? (
          <div className="text-center py-8">Loading parameters...</div>
        ) : (
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- adaptive parameter entries have deeply dynamic shape */}
            {Object.entries(parameters).map(([key, param]: [string, any]) => {
              const deltaPercent = ((param.currentValue - param.defaultValue) / param.defaultValue * 100).toFixed(1);
              const isAdjusted = Math.abs(parseFloat(deltaPercent)) > 5;
              return (
                <div key={key} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{key}</h3>
                    {isAdjusted && <Badge variant="secondary">Adjusted</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <span className="ml-2 font-medium">{param.currentValue} {param.unit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Default:</span>
                      <span className="ml-2">{param.defaultValue} {param.unit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delta:</span>
                      <span className={`ml-2 font-medium ${parseFloat(deltaPercent) > 0 ? "text-warning" : "text-success"}`}>
                        {deltaPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Adjustments:</span>
                      <span className="ml-2">{param.adjustmentCount}</span>
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
