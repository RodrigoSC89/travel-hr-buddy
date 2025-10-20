import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Info } from "lucide-react";

export function RecommendedActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Recommended Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          <p>This module is under development. AI-powered recommendations will be available soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
