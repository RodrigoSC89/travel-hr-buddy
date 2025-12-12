/**
import { useState } from "react";;
 * PATCH 528 - Sistema de Templates de Documentos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, FileText, Download } from "lucide-react";

export default function Patch528DocumentTemplates() {
  const [checks, setChecks] = useState({
    editorFunctional: false,
    variablesWorking: false,
    pdfExport: false,
    moduleIntegration: false,
  });

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checks).every(Boolean);
  const progress = Object.values(checks).filter(Boolean).length;
  const total = Object.values(checks).length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">PATCH 528 – Sistema de Templates de Documentos</h1>
          <p className="text-muted-foreground">Editor de templates com variáveis dinâmicas e exportação</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🧪 PATCH 528 – Validação</CardTitle>
            <Badge variant={allChecked ? "default" : "secondary"}>
              {progress}/{total} ✓
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.editorFunctional}
              onCheckedChange={() => toggleCheck("editorFunctional")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.editorFunctional ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Editor de templates (drag & drop) visível e funcional</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.variablesWorking}
              onCheckedChange={() => toggleCheck("variablesWorking")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.variablesWorking ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Variáveis dinâmicas (placeholders) aplicadas corretamente</span>
              </div>
              <div className="mt-2 p-3 bg-muted/50 rounded-md">
                <code className="text-xs">{"{{crew.name}}, {{vessel.name}}, {{date}}"}</code>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.pdfExport}
              onCheckedChange={() => toggleCheck("pdfExport")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.pdfExport ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Exportação de documentos (PDF) com dados reais</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Download className="h-4 w-4" />
                <span>jsPDF ou html2pdf</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.moduleIntegration}
              onCheckedChange={() => toggleCheck("moduleIntegration")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.moduleIntegration ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Integração com pelo menos dois módulos (documentos + relatórios)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Critério:</strong> Template system completo e integrado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
