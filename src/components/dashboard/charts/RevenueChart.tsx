import { AreaChart, Area, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface RevenueChartProps {
  data: readonly { month: string; revenue: number; target: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data as any}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#3b82f6" 
          fillOpacity={1} 
          fill="url(#colorRevenue)"
          name="Receita (R$)"
        />
        <Line 
          type="monotone" 
          dataKey="target" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Meta (R$)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
