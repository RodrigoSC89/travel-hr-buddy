import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Construction } from "lucide-react";

/**
 * DPIntelligenceCenter Component - Placeholder
 * 
 * This is a placeholder component for the DP Intelligence Center.
 * The full implementation requires the dp_incidents table in Supabase.
 * 
 * To enable this feature:
 * 1. Create the dp_incidents table migration
 * 2. Run supabase gen types to update types
 * 3. Replace this file with src/_legacy/dp-intelligence-center.tsx
 */
const DPIntelligenceCenter = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5" />
            Centro de Inteligência DP - Em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Recurso Indisponível</AlertTitle>
            <AlertDescription>
              O Centro de Inteligência DP requer a criação da tabela <code className="bg-muted px-1 py-0.5 rounded">dp_incidents</code> no banco de dados Supabase.
              <br /><br />
              Para ativar este recurso:
              <ol className="list-decimal ml-6 mt-2 space-y-1">
                <li>Criar a migração da tabela dp_incidents</li>
                <li>Executar <code className="bg-muted px-1 py-0.5 rounded">supabase gen types</code></li>
                <li>Implementar o componente completo de <code className="bg-muted px-1 py-0.5 rounded">src/_legacy/dp-intelligence-center.tsx</code></li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default DPIntelligenceCenter;
