import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Restore Chart Embed Page
 * 
 * DISABLED: Requires database schema that doesn't exist yet:
 * - document_restore_logs table
 * - get_restore_summary RPC function
 * - get_restore_count_by_day_with_email RPC function
 * 
 * TODO: Create proper database schema before enabling this feature
 */
export default function RestoreChartEmbed() {


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6">
      <Alert className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Esta funcionalidade requer configuração de banco de dados adicional.
          Entre em contato com o administrador do sistema.
        </AlertDescription>
      </Alert>
    </div>
  );
}
