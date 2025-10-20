import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

export function NormativeScores() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Normative Scores
        </CardTitle>
        <CardDescription>
          Compliance scores and normative adherence metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Normative Scores - Coming Soon</p>
          <p className="text-sm mt-2">This feature is under development</p>
        </div>
      </CardContent>
    </Card>
  );
}
