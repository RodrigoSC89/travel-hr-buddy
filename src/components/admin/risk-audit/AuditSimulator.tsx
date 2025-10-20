import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function AuditSimulator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Audit Simulator
        </CardTitle>
        <CardDescription>
          Simulate audit scenarios and predict outcomes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Audit Simulator - Coming Soon</p>
          <p className="text-sm mt-2">This feature is under development</p>
        </div>
      </CardContent>
    </Card>
  );
}
