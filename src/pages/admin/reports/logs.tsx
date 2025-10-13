import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Restore Report Logs Page
 * 
 * DISABLED: Requires database table 'restore_report_logs' that doesn't exist yet
 * TODO: Create proper database schema before enabling this feature
 */
export default function RestoreReportLogsPage() {
  const navigate = useNavigate();


  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={() => navigate("/admin")}
        className="mb-4"
      >
        ← Voltar
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Logs de Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta funcionalidade requer configuração de banco de dados adicional.
              A tabela 'restore_report_logs' precisa ser criada antes de usar esta página.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
