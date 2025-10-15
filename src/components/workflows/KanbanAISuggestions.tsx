'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">🤖 Sugestões da IA para este workflow</h2>
      <div className="grid gap-4">
        {suggestions.map((s, idx) => (
          <Card key={idx} className={accepted.includes(s.etapa) ? 'opacity-50' : ''}>
            <CardContent className="space-y-2">
              <p><strong>🧩 Etapa:</strong> {s.etapa}</p>
              <p><strong>📌 Tipo:</strong> {s.tipo_sugestao}</p>
              <p><strong>💬 Conteúdo:</strong> {s.conteudo}</p>
              <p><strong>🔥 Criticidade:</strong> {s.criticidade}</p>
              <p><strong>👤 Responsável:</strong> {s.responsavel_sugerido}</p>
              {!accepted.includes(s.etapa) && (
                <Button onClick={() => handleAccept(s.etapa)}>
                  ✅ Aceitar sugestão
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
