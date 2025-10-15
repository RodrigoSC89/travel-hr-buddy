"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Suggestion } from "./index";

export function KanbanAISuggestions({ suggestions }: { suggestions: Suggestion[] }) {
  const [accepted, setAccepted] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAccept = async (etapa: string, s: Suggestion) => {
    try {
      setAccepted((prev) => [...prev, etapa]);
      
      const { error } = await supabase.from("workflow_ai_suggestions").insert({
        etapa: s.etapa,
        tipo_sugestao: s.tipo_sugestao,
        conteudo: s.conteudo,
        criticidade: s.criticidade,
        responsavel_sugerido: s.responsavel_sugerido,
        origem: "Copilot",
      });

      if (error) {
        console.error("Error inserting AI suggestion:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a sugestão da IA",
          variant: "destructive",
        });
        // Revert the accepted state on error
        setAccepted((prev) => prev.filter(e => e !== etapa));
        return;
      }

      toast({
        title: "Sucesso",
        description: "Sugestão da IA aceita e salva com sucesso!",
      });
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a sugestão",
        variant: "destructive",
      });
      // Revert the accepted state on error
      setAccepted((prev) => prev.filter(e => e !== etapa));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        🤖 Sugestões da IA para este workflow
      </h2>
      {suggestions.map((s, idx) => (
        <Card key={idx} className={accepted.includes(s.etapa) ? 'opacity-50' : ''}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">🧩 Etapa:</span>
                <span className="text-sm">{s.etapa}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">📌 Tipo:</span>
                <span className="text-sm">{s.tipo_sugestao}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">💬 Conteúdo:</span>
                <span className="text-sm">{s.conteudo}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">🔥 Criticidade:</span>
                <span className="text-sm">{s.criticidade}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">👤 Responsável:</span>
                <span className="text-sm">{s.responsavel_sugerido}</span>
              </div>
              
              {!accepted.includes(s.etapa) && (
                <Button onClick={() => handleAccept(s.etapa, s)} className="mt-4">
                  ✅ Aceitar sugestão
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
