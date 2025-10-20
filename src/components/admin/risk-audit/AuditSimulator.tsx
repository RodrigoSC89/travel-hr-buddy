import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuditSimulator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Simulator</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Audit simulation tool - under development</p>
      </CardContent>
    </Card>
  );
}
