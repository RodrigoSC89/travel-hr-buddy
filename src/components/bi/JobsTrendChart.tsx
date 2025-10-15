import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendData {
  month: string;
  total_jobs: number;
}

interface JobsTrendChartProps {
  data: TrendData[];
  loading?: boolean;
}

export default function JobsTrendChart({ data, loading = false }: JobsTrendChartProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">📈 Tendência de Jobs (Últimos 6 meses)</h2>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_jobs" 
                stroke="#0f172a" 
                strokeWidth={2}
                name="Jobs Finalizados" 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}
