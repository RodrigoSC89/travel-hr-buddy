"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
        const response = await fetch("/api/bi/compliance-by-vessel");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        setData(responseData);
      } catch (err) {
        console.error("Error fetching compliance by vessel data:", err);
        setError("Erro ao carregar dados de conformidade por navio");
        // Set sample data on error
        setData([
          {
            vessel: "Ocean Star",
            total: 15,
            concluido: 8,
            andamento: 5,
            pendente: 2,
          },
          {
            vessel: "Sea Pioneer",
            total: 12,
            concluido: 10,
            andamento: 1,
            pendente: 1,
          },
          {
            vessel: "Marine Explorer",
            total: 20,
            concluido: 5,
            andamento: 10,
            pendente: 5,
          },
        ]);
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
