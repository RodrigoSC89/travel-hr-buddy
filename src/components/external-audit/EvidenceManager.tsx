/**
 * Evidence Manager - Coming Soon
 * Feature planned for Q2 2026
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EvidenceManager() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-muted rounded-full w-fit">
            <FileCheck className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Gerenciador de Evidências</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            O Gerenciador de Evidências para Auditoria Externa está em 
            desenvolvimento. Esta funcionalidade permitirá organizar e 
            preparar toda documentação para auditorias externas.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Previsão: Q2 2026</span>
          </div>
          
          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
