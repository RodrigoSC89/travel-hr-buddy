import { AreaChart, Area, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface RevenueChartProps {
  data: readonly { month: string; revenue: number; target: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={[...data]}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
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
          stroke="hsl(var(--primary))" 
          fillOpacity={1} 
          fill="url(#colorRevenue)"
          name="Receita (R$)"
        />
        <Line 
          type="monotone" 
          dataKey="target" 
          stroke="hsl(var(--success))" 
          strokeWidth={2}
          name="Meta (R$)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
