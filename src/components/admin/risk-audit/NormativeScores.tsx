import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

export function NormativeScores() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-purple-500" />
          Compliance Scoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            View compliance scores across different normative frameworks and standards.
          </p>
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Normative scores display will be implemented here
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
