import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ChartItem {
  name: string;
  value: number;
}

export default function OpexChartWidget() {
  const { data: chartData = [] } = useQuery({
    queryKey: ["opex-widget-v3"],
    queryFn: async () => {
      const { data } = await supabase
        .from("expenses")
        .select("amount, category, date")
        .order("date", { ascending: false })
        .limit(100);

      if (!data) return [] as ChartItem[];

      const byCategory: Record<string, number> = {};
      data.forEach((e: any) => {
        const cat = e.category || "Outros";
        byCategory[cat] = (byCategory[cat] || 0) + Number(e.amount || 0);
      });

      return Object.entries(byCategory)
        .map(([name, value]) => ({ name: name.length > 10 ? name.slice(0, 10) + "…" : name, value: Math.round(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6) as ChartItem[];
    },
    staleTime: 120_000,
    refetchInterval: 120_000,
  });

  const total = chartData.reduce((sum: number, d: ChartItem) => sum + d.value, 0);
  const maxVal = Math.max(...chartData.map((d: ChartItem) => d.value), 1);

  // Color gradient based on relative value
  const barColors = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--muted-foreground))"];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.div
            className="text-2xl font-bold text-foreground"
            key={total}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ${(total / 1000).toFixed(0)}K
          </motion.div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">OPEX Total</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-[10px]">
          <TrendingDown className="h-3 w-3 text-success" />
          <span className="text-success font-medium">-3.2%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[130px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 11,
                boxShadow: "0 4px 12px hsl(var(--foreground) / 0.1)"
              }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, "Valor"]}
              cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {chartData.map((_: ChartItem, index: number) => (
                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top category label */}
      {chartData.length > 0 && (
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Maior: <span className="text-foreground font-medium">{chartData[0]?.name}</span></span>
          <span className="text-foreground font-medium">${(chartData[0]?.value / 1000).toFixed(1)}K</span>
        </div>
      )}
    </div>
  );
}
