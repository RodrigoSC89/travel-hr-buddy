/**
 * Performance Dashboard - Coming Soon
 * Feature planned for Q2 2026
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PerformanceDashboard() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-muted rounded-full w-fit">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Dashboard de Performance</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            O Dashboard de Performance de Auditorias está em desenvolvimento. 
            Esta funcionalidade fornecerá métricas detalhadas sobre o desempenho 
            em auditorias e identificará áreas de melhoria.
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
