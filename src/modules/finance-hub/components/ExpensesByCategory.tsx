import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useFinanceData } from "../hooks/useFinanceData";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export const ExpensesByCategory = () => {
  const { transactions, categories, loading } = useFinanceData();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Loading expense data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate expenses by category
  const expensesByCategory = transactions
    .filter(t => t.transaction_type === 'expense' && t.status === 'completed')
    .reduce((acc, transaction) => {
      const categoryId = transaction.category_id || 'uncategorized';
      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          total: 0,
          count: 0
        };
      }
      acc[categoryId].total += Number(transaction.amount);
      acc[categoryId].count += 1;
      return acc;
    }, {} as Record<string, { categoryId: string; total: number; count: number }>);

  // Convert to array and add category names
  const chartData = Object.values(expensesByCategory).map((item, index) => {
    const category = categories.find(c => c.id === item.categoryId);
    return {
      name: category?.name || 'Uncategorized',
      value: item.total,
      count: item.count,
      color: COLORS[index % COLORS.length]
    };
  }).sort((a, b) => b.value - a.value);

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No expense data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, 'USD')}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground mb-4">
              Total Expenses: {formatCurrency(totalExpenses, 'USD')}
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} transaction{item.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.value, 'USD')}</p>
                    <p className="text-xs text-muted-foreground">
                      {((item.value / totalExpenses) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
