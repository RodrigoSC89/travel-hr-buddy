import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio } from "lucide-react";

export default function SonarAI() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Radio className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Sonar AI Enhancement</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Módulo em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de aprimoramento de sonar com IA em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
