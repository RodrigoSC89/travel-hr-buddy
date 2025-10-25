import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Transaction {
  type: "income" | "expense";
  amount: number;
  transaction_date: string;
  category: string;
}

interface ExpenseChartProps {
  transactions: Transaction[];
}

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  // Agregar dados por categoria
  const categoryData = transactions.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = { category: t.category, income: 0, expense: 0 };
    }
    if (t.type === "income") {
      acc[t.category].income += Number(t.amount);
    } else {
      acc[t.category].expense += Number(t.amount);
    }
    return acc;
  }, {} as Record<string, { category: string; income: number; expense: number }>);

  const chartData = Object.values(categoryData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas vs Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            />
            <Legend />
            <Bar dataKey="income" fill="hsl(var(--success))" name="Receitas" />
            <Bar dataKey="expense" fill="hsl(var(--destructive))" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
