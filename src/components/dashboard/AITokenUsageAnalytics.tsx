/**
 * AI Token Usage Analytics - Real-time AI cost/token tracking
 * Queries ai_logs for token consumption trends
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useMemo } from "react";

export function AITokenUsageAnalytics() {
  const { data: logs = [] } = useQuery({
    queryKey: ["ai-token-usage"],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data } = await supabase
        .from("ai_logs")
        .select("tokens_used, service, model, status, created_at, response_time_ms")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(500);
      return data || [];
    },
    staleTime: 60000,
  });

  const analytics = useMemo(() => {
    const totalTokens = logs.reduce((sum, l) => sum + (l.tokens_used || 0), 0);
    const totalCalls = logs.length;
    const successCalls = logs.filter((l) => l.status === "success").length;
    const avgResponseTime = totalCalls > 0
      ? Math.round(logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / totalCalls)
      : 0;

    // Group by service
    const byService: Record<string, { tokens: number; calls: number }> = {};
    logs.forEach((l) => {
      const svc = l.service || "unknown";
      if (!byService[svc]) byService[svc] = { tokens: 0, calls: 0 };
      byService[svc].tokens += l.tokens_used || 0;
      byService[svc].calls += 1;
    });

    // Daily trend (last 7 days)
    const dailyTokens: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const dayTotal = logs
        .filter((l) => l.created_at?.startsWith(dayStr))
        .reduce((sum, l) => sum + (l.tokens_used || 0), 0);
      dailyTokens.push(dayTotal);
    }

    const trend = dailyTokens.length >= 2
      ? dailyTokens[dailyTokens.length - 1] - dailyTokens[dailyTokens.length - 2]
      : 0;

    return { totalTokens, totalCalls, successCalls, avgResponseTime, byService, dailyTokens, trend };
  }, [logs]);

  const maxDaily = Math.max(...analytics.dailyTokens, 1);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            AI Token & Performance
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Últimos 30 dias
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Tokens", value: analytics.totalTokens.toLocaleString(), icon: Coins, color: "text-primary" },
            { label: "Chamadas", value: analytics.totalCalls.toString(), icon: Zap, color: "text-info" },
            { label: "Sucesso", value: analytics.totalCalls > 0 ? `${Math.round((analytics.successCalls / analytics.totalCalls) * 100)}%` : "—", icon: TrendingUp, color: "text-success" },
            { label: "Latência", value: `${analytics.avgResponseTime}ms`, icon: TrendingDown, color: "text-warning" },
          ].map((kpi) => (
            <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/30">
              <kpi.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-sm font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* 7-day bar chart */}
        <div>
          <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between">
            <span>Tokens / dia (7d)</span>
            {analytics.trend > 0 ? (
              <span className="text-destructive text-[10px]">▲ +{analytics.trend.toLocaleString()}</span>
            ) : analytics.trend < 0 ? (
              <span className="text-success text-[10px]">▼ {analytics.trend.toLocaleString()}</span>
            ) : null}
          </div>
          <div className="flex items-end gap-1 h-16">
            {analytics.dailyTokens.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/60 hover:bg-primary transition-colors"
                style={{ height: `${(val / maxDaily) * 100}%`, minHeight: val > 0 ? "4px" : "2px" }}
                title={`${val.toLocaleString()} tokens`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>7d atrás</span>
            <span>Hoje</span>
          </div>
        </div>

        {/* By service */}
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Por serviço</div>
          {Object.entries(analytics.byService)
            .sort((a, b) => b[1].tokens - a[1].tokens)
            .slice(0, 4)
            .map(([svc, data]) => (
              <div key={svc} className="flex items-center justify-between text-xs">
                <span className="font-medium truncate">{svc}</span>
                <span className="text-muted-foreground">{data.tokens.toLocaleString()} tok · {data.calls} calls</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default AITokenUsageAnalytics;
