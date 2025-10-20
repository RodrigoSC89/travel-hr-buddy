import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NormativeScores() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Normative Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Normative compliance scores - under development</p>
      </CardContent>
    </Card>
  );
}
