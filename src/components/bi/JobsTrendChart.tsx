import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface TrendData {
  date: string;
  completed: number;
  pending: number;
  in_progress: number;
}

interface JobsTrendChartProps {
  data?: TrendData[];
}

export default function JobsTrendChart({ data: externalData }: JobsTrendChartProps) {
  const [data, setData] = useState<TrendData[]>(externalData || []);
  const [loading, setLoading] = useState(!externalData);

  useEffect(() => {
    if (externalData) {
      setData(externalData);
      setLoading(false);
      return;
    }

    async function fetchTrendData() {
      try {
        const { data: result, error } = await supabase.functions.invoke("bi-jobs-trend");
        
        if (error) {
          console.error("Error fetching jobs trend:", error);
          // Use mock data on error
          setData([
            { date: "2024-01", completed: 12, pending: 5, in_progress: 3 },
            { date: "2024-02", completed: 15, pending: 8, in_progress: 4 },
            { date: "2024-03", completed: 18, pending: 6, in_progress: 5 },
            { date: "2024-04", completed: 22, pending: 4, in_progress: 6 },
            { date: "2024-05", completed: 25, pending: 7, in_progress: 4 },
            { date: "2024-06", completed: 28, pending: 5, in_progress: 7 },
          ]);
        } else {
          setData(result || []);
        }
      } catch (error) {
        console.error("Error invoking function:", error);
        // Use mock data on error
        setData([
          { date: "2024-01", completed: 12, pending: 5, in_progress: 3 },
          { date: "2024-02", completed: 15, pending: 8, in_progress: 4 },
          { date: "2024-03", completed: 18, pending: 6, in_progress: 5 },
          { date: "2024-04", completed: 22, pending: 4, in_progress: 6 },
          { date: "2024-05", completed: 25, pending: 7, in_progress: 4 },
          { date: "2024-06", completed: 28, pending: 5, in_progress: 7 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchTrendData();
  }, [externalData]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">📈 Tendência de Jobs Finalizados</h2>
      <CardContent>
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Finalizados" 
              />
              <Line 
                type="monotone" 
                dataKey="in_progress" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Em Progresso" 
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Pendentes" 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
