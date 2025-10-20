import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Info } from "lucide-react";

export function NormativeScores() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-purple-500" />
          Normative Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          <p>This module is under development. Compliance scoring will be available soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
