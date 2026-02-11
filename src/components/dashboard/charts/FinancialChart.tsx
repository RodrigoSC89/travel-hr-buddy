import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface FinancialChartProps {
  data: readonly { month: string; revenue: number; target: number }[];
}

export default function FinancialChart({ data }: FinancialChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={[...data]}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Receita" radius={[8, 8, 0, 0]} />
        <Bar dataKey="target" fill="hsl(var(--success))" name="Meta" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
