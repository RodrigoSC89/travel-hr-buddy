import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * TV Logs Page
 * 
 * DISABLED: Requires database schema that doesn't exist yet
 * TODO: Create proper database schema before enabling this feature
 */
export default function TVWallLogsPage() {

  return (
    <div className="min-h-screen bg-background p-6">
      <Card>
        <CardHeader>
          <CardTitle>TV Wall - Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta funcionalidade requer configuração de banco de dados adicional.
              Entre em contato com o administrador do sistema.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
