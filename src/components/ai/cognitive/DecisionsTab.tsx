import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { TacticalDecision } from "@/ai/tacticalAI";
import { getPriorityColor, formatTimestamp } from "./types";

interface DecisionsTabProps {
  decisions: TacticalDecision[];
  loading: boolean;
}

export const DecisionsTab: React.FC<DecisionsTabProps> = ({ decisions, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tactical AI Decisions</CardTitle>
        <CardDescription>Automated operational decisions and actions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading decisions...</div>
        ) : decisions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No decisions available</div>
        ) : (
          <div className="space-y-3">
            {decisions.map((decision) => (
              <div key={decision.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{decision.moduleName}</h3>
                      <Badge variant={getPriorityColor(decision.priority) as "default" | "secondary" | "destructive" | "outline"}>
                        {decision.priority}
                      </Badge>
                      {decision.executed && (
                        decision.success ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Action:</span>
                        <span className="font-medium">{decision.action}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{decision.reason}</div>
                      {decision.error && (
                        <div className="text-sm text-destructive mt-2">Error: {decision.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {formatTimestamp(decision.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
