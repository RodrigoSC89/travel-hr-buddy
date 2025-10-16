import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface JobsByComponent {
  component_id: string;
  count: number;
  avg_duration: number;
}

export default function DashboardJobs() {
  const [data, setData] = useState<JobsByComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bi-jobs-by-component`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching jobs by component:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Falhas por Componente + Tempo Médio</h2>
        <CardContent>
          <p className="text-red-600">Erro ao carregar dados: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">📊 Falhas por Componente + Tempo Médio</h2>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" label={{ value: "Qtd Jobs / Horas (Empilhado)", position: "insideBottomRight", offset: -5 }} />
              <YAxis dataKey="component_id" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0f172a" name="Jobs Finalizados" />
              <Bar dataKey="avg_duration" fill="#3b82f6" name="Tempo Médio (h)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
