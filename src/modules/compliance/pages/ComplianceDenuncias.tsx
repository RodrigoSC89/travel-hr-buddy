import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ComplianceDenuncias() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <AlertCircle className="h-6 w-6" />
        Canal de Denúncias
      </h1>
      <Card>
        <CardHeader><CardTitle>Em Desenvolvimento</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Canal anônimo de denúncias será implementado na próxima fase.</p></CardContent>
      </Card>
    </div>
  );
}
