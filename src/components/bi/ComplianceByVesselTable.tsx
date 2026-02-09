"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface ComplianceByVesselData {
  vessel: string;
  total: number;
  concluido: number;
  andamento: number;
  pendente: number;
}

export function ComplianceByVesselTable() {
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

        // Get inspection counts per vessel
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
        logger.error("Error fetching compliance by vessel data:", err);
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
          <div className="flex items-center justify-center h-32">
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
          <h3 className="text-xl font-semibold">📋 Detalhamento por Embarcação</h3>
          {error && (
            <p className="text-sm text-yellow-600 mt-1">
              {error} (exibindo dados de exemplo)
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 font-medium">Navio</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium text-green-600 dark:text-green-400">Concluído</th>
                <th className="px-4 py-2 font-medium text-yellow-600 dark:text-yellow-400">Em Andamento</th>
                <th className="px-4 py-2 font-medium text-red-600 dark:text-red-400">Pendente</th>
              </tr>
            </thead>
            <tbody>
              {data.map((vessel) => (
                <tr key={vessel.vessel} className="border-t">
                  <td className="px-4 py-2 font-medium">{vessel.vessel}</td>
                  <td className="px-4 py-2">{vessel.total}</td>
                  <td className="px-4 py-2 text-green-600 dark:text-green-400">{vessel.concluido}</td>
                  <td className="px-4 py-2 text-yellow-600 dark:text-yellow-400">{vessel.andamento}</td>
                  <td className="px-4 py-2 text-red-600 dark:text-red-400">{vessel.pendente}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            💡 <strong>Ideal para auditorias e planejamento gerencial:</strong> Esta tabela apresenta
            uma visão clara do status de conformidade dos planos de ação por embarcação.
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>🟢 Verde = Planos concluídos</li>
            <li>🟡 Amarelo = Planos em andamento</li>
            <li>🔴 Vermelho = Planos pendentes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
