"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface ComplianceByVesselData {
  vessel: string;
  total: number;
  concluido: number;
  andamento: number;
  pendente: number;
}

export function ComplianceByVesselChart() {
  const [data, setData] = useState<ComplianceByVesselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const { data: vessels, error: fetchError } = await (supabase.from as Function)("vessels")
          .select("id, name");

        if (fetchError) throw new Error(fetchError.message);

        const results: ComplianceByVesselData[] = [];
        for (const vessel of (vessels || [])) {
          const { count: total } = await (supabase.from as Function)("compliance_inspections")
            .select("*", { count: "exact", head: true })
            .eq("vessel_id", vessel.id);
          const { count: concluido } = await (supabase.from as Function)("compliance_inspections")
            .select("*", { count: "exact", head: true })
            .eq("vessel_id", vessel.id)
            .eq("status", "completed");
          const { count: andamento } = await (supabase.from as Function)("compliance_inspections")
            .select("*", { count: "exact", head: true })
            .eq("vessel_id", vessel.id)
            .eq("status", "in_progress");

          results.push({
            vessel: vessel.name,
            total: total || 0,
            concluido: concluido || 0,
            andamento: andamento || 0,
            pendente: (total || 0) - (concluido || 0) - (andamento || 0),
          });
        }
        setData(results);
      } catch (err) {
        logger.error("[ComplianceByVesselChart] Error fetching data:", err as Error);
        setError("Erro ao carregar dados. Verifique se as tabelas existem.");
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">
            📊 Conformidade de Planos de Ação por Navio
          </h2>
          {error && (
            <p className="text-sm text-yellow-600 mt-1">
              {error} (exibindo dados de exemplo)
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Status dos planos de ação de incidentes DP por embarcação
          </p>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="vessel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="concluido" fill="#10B981" name="✅ Concluído" />
            <Bar dataKey="andamento" fill="#FBBF24" name="🔄 Em andamento" />
            <Bar dataKey="pendente" fill="#EF4444" name="🕒 Pendente" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
