import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface FinancialChartProps {
  data: readonly { month: string; revenue: number; target: number }[];
}

export default function FinancialChart({ data }: FinancialChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data as unknown}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="revenue" fill="#3b82f6" name="Receita" radius={[8, 8, 0, 0]} />
        <Bar dataKey="target" fill="#10b981" name="Meta" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
