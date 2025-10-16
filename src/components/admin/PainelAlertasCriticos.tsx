"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Alerta {
  id: string
  auditoria_id: string
  comentario_id: string | null
  descricao: string
  nivel: string
  resolvido: boolean
  criado_em: string
}

export function PainelAlertasCriticos() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Não autenticado");
        setLoading(false);
        return;
      }

      // Call the Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke("admin-alertas", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (functionError) {
        console.error("Error calling admin-alertas function:", functionError);
        setError(functionError.message || "Erro ao buscar alertas");
        setLoading(false);
        return;
      }

      setAlertas(data || []);
    } catch (err) {
      console.error("Error fetching alertas:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">⚠️ Alertas Críticos da Auditoria</h2>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">⚠️ Alertas Críticos da Auditoria</h2>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar alertas: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">⚠️ Alertas Críticos da Auditoria</h2>

      {alertas.length === 0 ? (
        <Alert>
          <AlertDescription>
            Nenhum alerta crítico encontrado. ✅
          </AlertDescription>
        </Alert>
      ) : (
        <ScrollArea className="max-h-[70vh] border rounded-md p-4">
          {alertas.map((alerta) => (
            <Card key={alerta.id} className="mb-4 bg-red-50 border-red-200">
              <CardContent className="space-y-2 pt-6">
                <div className="text-sm text-muted-foreground">
                  Auditoria ID: {alerta.auditoria_id}<br />
                  {alerta.comentario_id && (
                    <>Comentário ID: {alerta.comentario_id}<br /></>
                  )}
                  Data: {new Date(alerta.criado_em).toLocaleString("pt-BR")}
                </div>
                <div className="font-medium text-red-700 whitespace-pre-wrap">
                  {alerta.descricao}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 font-semibold">
                    {alerta.nivel.toUpperCase()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
