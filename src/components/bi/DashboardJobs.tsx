import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface JobsByComponent {
  component_id: string;
  count: number;
  avg_duration: number;
}

export default function DashboardJobs() {
  const [data, setData] = useState<JobsByComponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: result, error } = await supabase.functions.invoke("bi-jobs-by-component");
        
        if (error) {
          console.error("Error fetching jobs by component:", error);
          setData([]);
        } else {
          setData(result || []);
        }
      } catch (error) {
        console.error("Error invoking function:", error);
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
          <ResponsiveContainer width="100%" height={300}>
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
