/**
 * PATCH 600 - Risk Heatmap Placeholder
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RiskHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Visual risk intensity map across vessels and modules.
        </p>
      </CardContent>
    </Card>
  );
}
