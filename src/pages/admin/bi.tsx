/**
 * Admin BI Dashboard - Stub
 * Original BI components removed during cleanup
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AdminBI() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Business Intelligence Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Dashboard de BI em manutenção.</p>
        </CardContent>
      </Card>
    </div>
  );
}
