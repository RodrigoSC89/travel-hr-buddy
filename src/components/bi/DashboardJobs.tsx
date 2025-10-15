import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface JobsByComponentData {
  component_id: string;
  count: number;
  avg_duration: number;
}

export default function DashboardJobs() {
  const [data, setData] = useState<JobsByComponentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        const res = await fetch(`${supabaseUrl}/functions/v1/bi-jobs-by-component`, {
          headers: {
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching job statistics:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">📊 Falhas por Componente + Tempo Médio</h2>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" label={{ value: "Qtd Jobs / Horas", position: "insideBottomRight", offset: -5 }} />
              <YAxis dataKey="component_id" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0f172a" name="Jobs Finalizados" />
              <Bar dataKey="avg_duration" fill="#2563eb" name="Tempo Médio (h)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
