import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

export default function ComplianceEvidencias() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <FileCheck className="h-6 w-6" />
        Gestão de Evidências
      </h1>
      <Card>
        <CardHeader><CardTitle>Em Desenvolvimento</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Upload e gestão de evidências será implementado na próxima fase.</p></CardContent>
      </Card>
    </div>
  );
}
