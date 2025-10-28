// @ts-nocheck
/**
 * Página de Validação do Editor de Templates
 * NOTA: Esta página foi substituída pelo novo sistema de templates em /templates (PATCH 401)
 */

import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TemplateValidationPage() {
  const navigate = useNavigate();
  
  return (
    <ModulePageWrapper gradient="blue">
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Templates Atualizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">
                Sistema de Templates Modernizado
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                O sistema de templates foi completamente renovado com o PATCH 401. 
                Agora você tem acesso a um editor visual com TipTap, suporte a placeholders dinâmicos, 
                preview em tempo real e exportação para PDF.
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/templates')}>
            Ir para o Novo Editor de Templates
          </Button>
        </CardContent>
      </Card>
    </ModulePageWrapper>
  );
}
