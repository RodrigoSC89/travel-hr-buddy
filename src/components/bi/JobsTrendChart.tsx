import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface JobTrendData {
  month: string;
  total_jobs: number;
  monthLabel: string;
}

// Convert YYYY-MM format to Portuguese month label
const formatMonthLabel = (month: string): string => {
  const monthNames = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez"
  ];
  
  const [year, monthNum] = month.split("-");
  const monthIndex = parseInt(monthNum, 10) - 1;
  const monthAbbr = monthNames[monthIndex];
  
  return `${monthAbbr} de ${year}`;
};

// Initialize last 6 months with zero counts
const initializeLast6Months = (): JobTrendData[] => {
  const months: JobTrendData[] = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;
    
    months.push({
      month: monthKey,
      total_jobs: 0,
      monthLabel: formatMonthLabel(monthKey)
    });
  }
  
  return months;
};

export default function JobsTrendChart() {
  const [data, setData] = useState<JobTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrend() {
      try {
        // Mock implementation - replace with actual RPC call when function is available
        // const { data: result, error } = await supabase.rpc("jobs_trend_by_month");
        
        // For now, use initialized data with zeros
        setData(initializeLast6Months());
      } catch (error) {
        console.error("Error invoking function:", error);
        setData(initializeLast6Months());
      } finally {
        setLoading(false);
      }
    }
    
    fetchTrend();
  }, []);

  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-semibold mb-2">📈 Tendência de Jobs Finalizados</h2>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="monthLabel" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="total_jobs" 
                stroke="#0f172a" 
                strokeWidth={3}
                name="Jobs Finalizados"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
