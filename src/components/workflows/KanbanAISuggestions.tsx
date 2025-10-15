"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Suggestion {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: string;
  responsavel_sugerido: string;
}

export function KanbanAISuggestions({ suggestions }: { suggestions: Suggestion[] }) {
  const [accepted, setAccepted] = useState<string[]>([]);

  const handleAccept = (etapa: string) => {
    setAccepted((prev) => [...prev, etapa]);
    // TODO: disparar criação real da tarefa
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🤖 Sugestões da IA para este workflow</h2>
      {suggestions.map((s, idx) => (
        <Card key={idx} className={accepted.includes(s.etapa) ? "opacity-50" : ""}>
          <CardContent className="p-6 space-y-3">
            <div>
              <span className="font-semibold">🧩 Etapa:</span> {s.etapa}
            </div>
            <div>
              <span className="font-semibold">📌 Tipo:</span> {s.tipo_sugestao}
            </div>
            <div>
              <span className="font-semibold">💬 Conteúdo:</span> {s.conteudo}
            </div>
            <div>
              <span className="font-semibold">🔥 Criticidade:</span> {s.criticidade}
            </div>
            <div>
              <span className="font-semibold">👤 Responsável:</span> {s.responsavel_sugerido}
            </div>
            {!accepted.includes(s.etapa) && (
              <Button onClick={() => handleAccept(s.etapa)}>
                ✅ Aceitar sugestão
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
