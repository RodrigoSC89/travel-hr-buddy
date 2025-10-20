import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function RecommendedActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recommended Actions
        </CardTitle>
        <CardDescription>
          AI-generated recommendations for risk mitigation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Recommended Actions - Coming Soon</p>
          <p className="text-sm mt-2">This feature is under development</p>
        </div>
      </CardContent>
    </Card>
  );
}
