import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ComplianceRegulamentos() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6" />
        Regulamentos & Regras Legais
      </h1>
      <Card>
        <CardHeader><CardTitle>Em Desenvolvimento</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Módulo de regulamentos será implementado na próxima fase.</p></CardContent>
      </Card>
    </div>
  );
}
