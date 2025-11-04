import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, CheckCircle } from "lucide-react";

export default function ISMAuditChecklists() {
  const checklists = [
    {
      id: 1,
      name: "ISM Code - Seção 1-5",
      items: 25,
      completed: 25,
      percentage: 100
    },
    {
      id: 2,
      name: "ISM Code - Seção 6-10",
      items: 30,
      completed: 22,
      percentage: 73
    },
    {
      id: 3,
      name: "ISM Code - Seção 11-13",
      items: 20,
      completed: 15,
      percentage: 75
    }
  ];

  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={ClipboardList}
        title="Checklists ISM"
        description="Checklists de auditoria conforme ISM Code"
        gradient="green"
        badges={[
          { icon={ClipboardList}, label: "Checklists" },
          { icon: CheckCircle, label: "Validação" }
        ]}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Checklists Disponíveis</CardTitle>
            <Button size="sm">Novo Checklist</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklists.map((checklist) => (
              <div key={checklist.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{checklist.name}</h3>
                    <div className="text-sm text-muted-foreground mb-2">
                      {checklist.completed} de {checklist.items} itens completados
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all" 
                        style={{ width: `${checklist.percentage}%` }}
                      />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4">Abrir</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ModulePageWrapper>
  );
}
