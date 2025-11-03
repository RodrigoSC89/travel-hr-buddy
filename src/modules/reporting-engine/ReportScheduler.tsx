/**
 * PATCH 601 - Report Scheduler Placeholder
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportScheduler() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Scheduler</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Schedule automated report generation and delivery.
        </p>
      </CardContent>
    </Card>
  );
}
