import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function SGSOFindings() {
  const findings = [
    {
      id: 1,
      number: "SGSO-2025-001",
      category: "major",
      description: "Procedimento de emergência não atualizado",
      status: "open",
      dueDate: "2025-11-15",
      responsible: "João Silva"
    },
    {
      id: 2,
      number: "SGSO-2025-002",
      category: "minor",
      description: "Treinamento de segurança incompleto",
      status: "in_progress",
      dueDate: "2025-11-20",
      responsible: "Maria Santos"
    },
    {
      id: 3,
      number: "SGSO-2025-003",
      category: "observation",
      description: "Sugestão de melhoria no processo de comunicação",
      status: "closed",
      dueDate: "2025-10-30",
      responsible: "Pedro Costa"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
    case "major": return "destructive";
    case "minor": return "secondary";
    default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "closed": return "text-green-600";
    case "in_progress": return "text-blue-600";
    case "open": return "text-orange-600";
    default: return "text-gray-600";
    }
  };

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={AlertTriangle}
        title="Constatações SGSO"
        description="Gestão de não conformidades e ações corretivas"
        gradient="red"
        badges={[
          { icon: AlertTriangle, label: "Não Conformidades" },
          { icon: CheckCircle, label: "Ações Corretivas" }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Abertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Em Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">28</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registro de Constatações</CardTitle>
            <Button size="sm">Nova Constatação</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {findings.map((finding) => (
              <div key={finding.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold">{finding.number}</span>
                      <Badge variant={getCategoryColor(finding.category as unknown)}>
                        {finding.category.toUpperCase()}
                      </Badge>
                      <span className={`text-sm ${getStatusColor(finding.status)}`}>
                        {finding.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Responsável: {finding.responsible}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Prazo: {finding.dueDate}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Ver Detalhes</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ModulePageWrapper>
  );
}
