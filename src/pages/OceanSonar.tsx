import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves } from "lucide-react";

export default function OceanSonar() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Waves className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Ocean Sonar AI</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Módulo em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de análise de sonar oceânico com IA em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
