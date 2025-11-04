import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function ISMAuditFindings() {
  const findings = [
    {
      id: 1,
      number: "ISM-2025-001",
      category: "major",
      ismElement: "6.3",
      description: "Procedimentos de emergência não atualizados",
      status: "open"
    },
    {
      id: 2,
      number: "ISM-2025-002",
      category: "minor",
      ismElement: "9.2",
      description: "Registros de treinamento incompletos",
      status: "in_progress"
    }
  ];

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={AlertCircle}
        title="Não Conformidades ISM"
        description="Gestão de findings de auditorias ISM"
        gradient="orange"
        badges={[
          { icon: AlertCircle, label: "Findings" },
          { icon: CheckCircle, label: "Ações Corretivas" }
        ]}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registro de Não Conformidades</CardTitle>
            <Button size="sm">Novo Finding</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {findings.map((finding) => (
              <div key={finding.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm font-semibold">{finding.number}</span>
                  <Badge variant={finding.category === 'major' ? 'destructive' : 'secondary'}>
                    {finding.category.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">ISM {finding.ismElement}</Badge>
                </div>
                <p className="text-sm">{finding.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ModulePageWrapper>
  );
}
