"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Auditoria {
  id: string;
  navio: string;
  data: string;
  norma: string;
  resultado: "Conforme" | "Não Conforme" | "Observação";
  item_auditado: string;
  comentarios?: string;
}

export function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auditorias/list")
      .then((res) => res.json())
      .then((data) => {
        setAuditorias(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading audits:", error);
        setLoading(false);
      });
  }, []);

  const corResultado: Record<string, string> = {
    "Conforme": "bg-green-100 text-green-800",
    "Não Conforme": "bg-red-100 text-red-800",
    "Observação": "bg-yellow-100 text-yellow-800",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando auditorias...</p>
        </div>
      </div>
    );
  }

  if (auditorias.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Nenhuma auditoria registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        📋 Auditorias Técnicas Registradas
      </h2>
      
      {auditorias.map((a) => (
        <Card key={a.id} className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  🚢 {a.navio}
                </h3>
                <Badge className={corResultado[a.resultado]}>
                  {a.resultado}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {a.data && format(new Date(a.data), "dd/MM/yyyy")} - Norma: {a.norma}
              </div>
              
              <div className="text-sm">
                <strong>Item auditado:</strong> {a.item_auditado}
              </div>
              
              {a.comentarios && (
                <div className="text-sm">
                  <strong>Comentários:</strong> {a.comentarios}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
