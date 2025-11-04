import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, Calendar, AlertCircle, CheckCircle } from "lucide-react";

export default function ISMAuditDashboard() {
  const audits = [
    {
      id: 1,
      type: "Internal",
      auditor: "João Silva - Lead Auditor",
      date: "2025-11-15",
      status: "scheduled",
      findingsCount: 0
    },
    {
      id: 2,
      type: "External",
      auditor: "Classification Society",
      date: "2025-10-20",
      status: "completed",
      findingsCount: 5
    },
    {
      id: 3,
      type: "Certification",
      auditor: "Flag State Inspector",
      date: "2025-09-10",
      status: "completed",
      findingsCount: 2
    }
  ];

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={FileCheck}
        title="Auditorias ISM"
        description="Gestão de auditorias conforme ISM Code"
        gradient="blue"
        badges={[
          { icon: FileCheck, label: "ISM Compliance" },
          { icon: Calendar, label: "Programação" },
          { icon: CheckCircle, label: "Certificação" }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Programadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Taxa de Conformidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">94%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Auditorias</CardTitle>
              <CardDescription>Auditorias ISM programadas e realizadas</CardDescription>
            </div>
            <Button size="sm">Nova Auditoria</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {audits.map((audit) => (
              <div key={audit.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Auditoria {audit.type}</h3>
                      <Badge variant={audit.status === 'scheduled' ? 'secondary' : 'default'}>
                        {audit.status === 'scheduled' ? 'Programada' : 'Concluída'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {audit.date}
                      </div>
                      <div>Auditor: {audit.auditor}</div>
                      {audit.findingsCount > 0 && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="h-3 w-3" />
                          {audit.findingsCount} constatações
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Ver Detalhes</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ModulePageWrapper>
  );
}
