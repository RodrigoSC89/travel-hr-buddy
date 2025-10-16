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
  comentarios: string;
}

export function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);

  useEffect(() => {
    fetch("/api/auditorias/list")
      .then((res) => res.json())
      .then((data) => setAuditorias(data));
  }, []);

  const corResultado: Record<string, string> = {
    "Conforme": "bg-green-100 text-green-800",
    "Não Conforme": "bg-red-100 text-red-800",
    "Observação": "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold">📋 Auditorias Técnicas Registradas</h2>
      {auditorias.map((a) => (
        <Card key={a.id} className="shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">🚢 {a.navio}</h3>
                <p className="text-sm text-muted-foreground">{format(new Date(a.data), "dd/MM/yyyy")} - Norma: {a.norma}</p>
              </div>
              <Badge className={corResultado[a.resultado]}>{a.resultado}</Badge>
            </div>
            <p className="text-sm"><strong>Item auditado:</strong> {a.item_auditado}</p>
            <p className="text-sm"><strong>Comentários:</strong> {a.comentarios}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
