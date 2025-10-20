import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function TacticalRiskPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Tactical Risk Panel
        </CardTitle>
        <CardDescription>
          AI-powered tactical risk monitoring and forecasting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Tactical Risk Panel - Coming Soon</p>
          <p className="text-sm mt-2">This feature is under development</p>
        </div>
      </CardContent>
    </Card>
  );
}
