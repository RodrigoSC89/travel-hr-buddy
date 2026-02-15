import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function OpexChartWidget() {
  const { data: chartData = [] } = useQuery({
    queryKey: ["opex-widget"],
    queryFn: async () => {
      const { data } = await supabase
        .from("expenses")
        .select("amount, category, date")
        .order("date", { ascending: false })
        .limit(50);

      if (!data) return [];

      // Aggregate by category
      const byCategory: Record<string, number> = {};
      data.forEach((e) => {
        const cat = e.category || "Outros";
        byCategory[cat] = (byCategory[cat] || 0) + Number(e.amount || 0);
      });

      return Object.entries(byCategory)
        .map(([name, value]) => ({ name: name.slice(0, 12), value: Math.round(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    },
    staleTime: 120_000,
  });

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-2">
      <div className="text-2xl font-bold text-foreground">
        R$ {(total / 1000).toFixed(0)}K
      </div>
      <p className="text-xs text-muted-foreground">OPEX Total</p>
      <div className="h-[120px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              formatter={(v: number) => [`R$ ${v.toLocaleString()}`, "Valor"]}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
