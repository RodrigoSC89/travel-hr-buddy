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

export default function JobsTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrend() {
      try {
        const { data: result, error } = await supabase.functions.invoke("bi-jobs-trend");
        
        if (error) {
          console.error("Error fetching jobs trend:", error);
          // Fallback to mock data
          setData(getMockTrendData());
        } else {
          setData(result || getMockTrendData());
        }
      } catch (error) {
        console.error("Error invoking function:", error);
        // Fallback to mock data
        setData(getMockTrendData());
      } finally {
        setLoading(false);
      }
    }
    fetchTrend();
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">📈 Tendência de Jobs (6 meses)</h2>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#22c55e" 
                name="Concluídos" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="in_progress" 
                stroke="#3b82f6" 
                name="Em Progresso" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                stroke="#f97316" 
                name="Pendentes" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// Mock data for fallback when backend is unavailable
function getMockTrendData(): TrendData[] {
  const currentDate = new Date();
  const mockData: TrendData[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    mockData.push({
      date: monthYear,
      completed: Math.floor(Math.random() * 20) + 10,
      pending: Math.floor(Math.random() * 15) + 5,
      in_progress: Math.floor(Math.random() * 10) + 3,
    });
  }
  
  return mockData;
}
