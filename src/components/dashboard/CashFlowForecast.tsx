/**
 * CashFlowForecast - Financial projection from invoices + expenses
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function CashFlowForecast() {
  const { data, isLoading } = useQuery({
    queryKey: ["cash-flow-forecast"],
    queryFn: async () => {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();

      const [invoicesRes, expensesRes, payrollRes] = await Promise.all([
        supabase.from("invoices").select("total_amount, status, due_at, created_at").gte("created_at", threeMonthsAgo).limit(200),
        supabase.from("expenses").select("amount, category, date").gte("date", threeMonthsAgo).limit(200),
        supabase.from("crew_payroll").select("gross_pay, net_pay, payroll_period_start").limit(100),
      ]);

      const invoices = invoicesRes.data || [];
      const expenses = expensesRes.data || [];
      const payroll = payrollRes.data || [];

      const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total_amount || 0), 0);
      const pendingRevenue = invoices.filter(i => i.status === "pending_approval" || i.status === "draft" || i.status === "sent").reduce((s, i) => s + (i.total_amount || 0), 0);
      const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
      const totalPayroll = payroll.reduce((s, p) => s + (p.gross_pay || 0), 0);

      const netCashFlow = totalRevenue - totalExpenses - totalPayroll;
      const projectedMonthly = (totalRevenue + pendingRevenue) / 3;
      const avgExpenses = (totalExpenses + totalPayroll) / 3;

      // Top expense categories
      const catMap: Record<string, number> = {};
      expenses.forEach(e => {
        const cat = e.category || "Other";
        catMap[cat] = (catMap[cat] || 0) + (e.amount || 0);
      });
      const topCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

      return { totalRevenue, pendingRevenue, totalExpenses, totalPayroll, netCashFlow, projectedMonthly, avgExpenses, topCategories };
    },
    staleTime: 120000,
  });

  if (isLoading) return <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>;
  if (!data) return null;

  const fmt = (n: number) => {
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
  };

  const isPositive = data.netCashFlow >= 0;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Cash Flow Forecast (3M)
          <Badge variant="outline" className={`ml-auto text-[10px] ${isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            {isPositive ? "Positivo" : "Negativo"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main KPI */}
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            {fmt(data.netCashFlow)}
          </p>
          <p className="text-xs text-muted-foreground">Net Cash Flow (3 meses)</p>
        </div>

        {/* Revenue vs Expenses */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-lg bg-success/5 border border-success/10">
            <div className="flex items-center gap-1 mb-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-[10px] text-muted-foreground">Receita</span>
            </div>
            <p className="text-sm font-bold text-success">{fmt(data.totalRevenue)}</p>
            <p className="text-[10px] text-muted-foreground">+{fmt(data.pendingRevenue)} pendente</p>
          </div>
          <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
            <div className="flex items-center gap-1 mb-1">
              <ArrowDownRight className="h-3 w-3 text-destructive" />
              <span className="text-[10px] text-muted-foreground">Despesas</span>
            </div>
            <p className="text-sm font-bold text-destructive">{fmt(data.totalExpenses + data.totalPayroll)}</p>
            <p className="text-[10px] text-muted-foreground">Payroll: {fmt(data.totalPayroll)}</p>
          </div>
        </div>

        {/* Top expense categories */}
        {data.topCategories.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Top Categorias de Despesa</p>
            {data.topCategories.map(([cat, amt]) => (
              <div key={cat} className="flex justify-between text-[11px] p-1 rounded bg-muted/20">
                <span className="truncate">{cat}</span>
                <span className="font-medium text-muted-foreground">{fmt(amt)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Monthly projection */}
        <div className="flex justify-between text-[11px] pt-2 border-t border-border/50">
          <span className="text-muted-foreground">Projeção mensal</span>
          <span className="font-bold">{fmt(data.projectedMonthly)} receita / {fmt(data.avgExpenses)} despesa</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default CashFlowForecast;
