import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ComplianceRelatorios() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6" />
        Relatórios de Compliance
      </h1>
      <Card>
        <CardHeader><CardTitle>Em Desenvolvimento</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Relatórios inteligentes serão implementados na próxima fase.</p></CardContent>
      </Card>
    </div>
  );
}
