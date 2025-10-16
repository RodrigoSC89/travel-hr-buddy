"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Alerta {
  id: string;
  auditoria_id: string;
  comentario_id: string;
  tipo: string;
  descricao: string;
  criado_em: string;
}

export function PainelAlertasCriticos() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        setLoading(true);
        setError(null);

        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/admin-alertas`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar alertas: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setAlertas(data.alertas || []);
        } else {
          throw new Error(data.error || "Erro desconhecido ao buscar alertas");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar alertas";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Erro ao buscar alertas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Carregando alertas críticos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Erro ao carregar alertas</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <span>⚠️</span>
        <span>Alertas Críticos da Auditoria</span>
      </h2>
      
      {alertas.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Nenhum alerta crítico encontrado. 🎉
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[70vh] border rounded-md p-4">
          <div className="space-y-4">
            {alertas.map((alerta) => (
              <Card key={alerta.id} className="bg-red-50 border-red-200">
                <CardContent className="p-4 space-y-2">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      <span className="font-medium">Auditoria ID:</span>{" "}
                      <span className="font-mono text-xs">{alerta.auditoria_id}</span>
                    </div>
                    <div>
                      <span className="font-medium">Comentário ID:</span>{" "}
                      <span className="font-mono text-xs">{alerta.comentario_id}</span>
                    </div>
                    <div>
                      <span className="font-medium">Data:</span>{" "}
                      {new Date(alerta.criado_em).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="font-medium text-red-700 whitespace-pre-wrap border-t border-red-200 pt-2 mt-2">
                    {alerta.descricao}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                      {alerta.tipo || "CRÍTICO"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
