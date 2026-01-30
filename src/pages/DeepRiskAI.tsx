import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DeepRiskAI() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Deep Risk AI</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Módulo em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de análise de riscos em operações profundas com IA em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
