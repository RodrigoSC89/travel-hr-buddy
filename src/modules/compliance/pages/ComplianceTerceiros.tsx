import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ComplianceTerceiros() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        Due Diligence - Terceiros
      </h1>
      <Card>
        <CardHeader><CardTitle>Em Desenvolvimento</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Verificação de terceiros será implementada na próxima fase.</p></CardContent>
      </Card>
    </div>
  );
}
