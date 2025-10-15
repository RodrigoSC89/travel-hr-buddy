import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface JobTrendData {
  month: string;
  total_jobs: number;
}

export default function JobsTrendChart() {
  const [data, setData] = useState<JobTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrend() {
      try {
        const { data: result, error } = await supabase.functions.invoke("bi-jobs-trend");
        
        if (error) {
          console.error("Error fetching jobs trend:", error);
          setData([]);
        } else {
          setData(result || []);
        }
      } catch (error) {
        console.error("Error fetching jobs trend:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrend();
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">📈 Tendência de Jobs Finalizados</h2>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total_jobs" stroke="#0f172a" strokeWidth={3} name="Jobs" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
