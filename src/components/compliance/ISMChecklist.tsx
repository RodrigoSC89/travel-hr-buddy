// @ts-nocheck
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const items = [
  { id: 1, section: "ISM 9.1", text: "Analisar relatórios de incidentes e near misses semanalmente" },
  { id: 2, section: "ISM 10.2", text: "Garantir que todos os equipamentos críticos possuam plano de manutenção preventiva" },
  { id: 3, section: "ISPS 16", text: "Monitorar logs de acesso remoto e eventos suspeitos" },
  { id: 4, section: "NORMAM 101", text: "Manter histórico digital de não conformidades e ações corretivas" },
];

export default function ISMChecklist() {
  return (
    <Card className="bg-gray-950 border-cyan-800">
      <CardHeader>
        <CardTitle className="text-cyan-400">ISM/ISPS Compliance Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        {items.map((item) => (
          <div key={item.id} className="mb-2 text-cyan-400">
            {item.section} — {item.text}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
